// src/features/client/appointments/reminderLink.ts
//
// Enlaces del mail de recordatorio: FRONTEND_URL/mis-turnos?turno=<id>&accion=ver|reprogramar|cancelar.
// El enlace solo dice QUÉ turno y QUÉ pantalla abrir: nunca ejecuta nada. La cancelación y la reprogramación
// siempre pasan por su confirmación, y el backend decide si corresponden.
import { NO_SHOW_AUTO_NOTICE } from '@/app/data/shared/status.data'
import { appointmentInstant } from '@/shared/utils/argentinaTime'

export const REMINDER_ACTIONS = ['ver', 'reprogramar', 'cancelar'] as const
export type ReminderAction = typeof REMINDER_ACTIONS[number]

export interface ReminderLink {
  turno:  string
  accion: ReminderAction
}

// Los ids del backend son cadenas cortas sin espacios; se rechaza todo lo demás para no arrastrar basura de la URL.
const TURNO_FORMAT = /^[A-Za-z0-9_-]{1,64}$/

// Sin `turno` válido no hay enlace. Una `accion` ausente o desconocida cae en «ver», la única que no pide nada más.
export function parseReminderLink(params: URLSearchParams): ReminderLink | null {
  const turno = params.get('turno')
  if (!turno || !TURNO_FORMAT.test(turno)) return null
  const accion = params.get('accion')
  return {
    turno,
    accion: REMINDER_ACTIONS.find(a => a === accion) ?? 'ver',
  }
}

export function reminderLinkSearch(link: ReminderLink): string {
  return `?${new URLSearchParams({ turno: link.turno, accion: link.accion }).toString()}`
}

interface LinkAppointment {
  id:            string
  date:          string
  time:          string
  status:        string
  comboGroupId?: string | null
}

export type ReminderLinkOutcome<T> =
  | { kind: 'open'; accion: ReminderAction; target: T }
  | { kind: 'message'; text: string }

export const REMINDER_LINK_MESSAGES = {
  notFound:     'No encontramos ese turno en tu cuenta. Puede que el enlace sea de otra cuenta o que el turno ya no exista.',
  started:      'Ese turno ya empezó, por eso no lo abrimos desde el enlace. Si hace falta, lo ves en «Historial».',
  cancelled:    'Ese turno ya está cancelado.',
  finished:     'Ese turno ya se realizó.',
  noShow:       'Ese turno figura como «No asistió». Si viniste, avisale al estudio para que lo corrijan.',
  comboReschedule: 'Este turno es parte de un combo y no se puede reprogramar desde acá. Cancelalo y reservá de nuevo si necesitás cambiar el horario.',
  loadFailed:   'No pudimos cargar tus turnos para abrir ese enlace. Intentá de nuevo en unos minutos.',
} as const

const isActive = (status: string) => status === 'confirmed' || status === 'pending'

function closedMessage(status: string): string {
  switch (status) {
    case 'no_show_auto':       return NO_SHOW_AUTO_NOTICE
    case 'cancelled_no_show':  return REMINDER_LINK_MESSAGES.noShow
    case 'finished':           return REMINDER_LINK_MESSAGES.finished
    default:                   return REMINDER_LINK_MESSAGES.cancelled
  }
}

// Decide qué hacer con el enlace a partir de los turnos de la clienta (el backend solo devuelve los propios, así que
// «ajeno» e «inexistente» son lo mismo desde acá y se dicen igual, sin confirmar si el id existe).
// En un combo el enlace trae el id de la primera pata: si esa ya no está activa se usa la primera que siga en pie.
export function resolveReminderLink<T extends LinkAppointment>(
  link: ReminderLink,
  appointments: T[],
  now: number,
): ReminderLinkOutcome<T> {
  const found = appointments.find(a => a.id === link.turno)
  if (!found) return { kind: 'message', text: REMINDER_LINK_MESSAGES.notFound }

  const group = found.comboGroupId ? appointments.filter(a => a.comboGroupId === found.comboGroupId) : [found]
  const active = group.filter(a => isActive(a.status))
  if (active.length === 0) return { kind: 'message', text: closedMessage(found.status) }

  const target = isActive(found.status) ? found : active[0]
  if (appointmentInstant(target.date, target.time).getTime() <= now) {
    return { kind: 'message', text: REMINDER_LINK_MESSAGES.started }
  }
  if (link.accion === 'reprogramar' && target.comboGroupId) {
    return { kind: 'message', text: REMINDER_LINK_MESSAGES.comboReschedule }
  }
  return { kind: 'open', accion: link.accion, target }
}
