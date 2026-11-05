// Horarios que se le ofrecen a la clienta, calculados con lo que devuelve el servidor
// (GET /api/professional/:id/availability?date=&serviceId=). El navegador NO filtra con su reloj:
// `new Date().toISOString()` da la fecha en UTC y después de las 21:00 de Argentina ya es "mañana".
// El servidor manda `earliestStart` (primer inicio reservable ese día, según la reserva tardía) y
// `reopenedStarts` (inicios de los horarios reabiertos, cada 5 minutos).
import { generateSlots } from '@/features/professional/onboarding/types'

export const LAST_MINUTE_LABEL = 'Horario de último momento'

// El backend usa 0=lunes...6=domingo; Date#getDay() usa 0=domingo...6=sábado
const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5]

export interface AvailabilityRow {
  dayOfWeek: number
  startTime: string
  endTime:   string
}

export interface AvailabilityResponse {
  availability:    AvailabilityRow[]
  bookedTimes?:    string[]
  // "HH:mm" del primer inicio reservable; '00:00' si la fecha es futura; null si la fecha ya pasó.
  earliestStart?:  string | null
  reopenedStarts?: string[]
}

// Qué día es la fecha consultada según el servidor: 'past' (ya pasó), 'today' (hoy, hay un primer
// inicio), 'future', o 'unknown' si el servidor no lo informó.
export type DayKind = 'past' | 'today' | 'future' | 'unknown'

export interface DaySlots {
  regular:  string[]
  reopened: string[]
  dayKind:  DayKind
}

export const EMPTY_DAY: DaySlots = { regular: [], reopened: [], dayKind: 'unknown' }

function dayKindOf(earliestStart: string | null | undefined): DayKind {
  if (earliestStart === null) return 'past'
  if (earliestStart === undefined) return 'unknown'
  return earliestStart === '00:00' ? 'future' : 'today'
}

export function slotsFromAvailability(res: AvailabilityResponse, date: string): DaySlots {
  const dayKind = dayKindOf(res.earliestStart)
  if (dayKind === 'past') return { regular: [], reopened: [], dayKind }

  const backendDay = JS_DAY_TO_BACKEND_DAY[new Date(`${date}T00:00:00`).getDay()]
  // Un mismo día puede tener varias filas (varios rangos con un hueco entre medio, ej: 08–12 y
  // 14–20) — hay que juntar los turnos de todas, no solo la primera.
  const dayRows = res.availability.filter(a => a.dayOfWeek === backendDay)
  const booked = new Set(res.bookedTimes ?? [])
  const reopened = [...new Set(res.reopenedStarts ?? [])].sort()
  const reopenedSet = new Set(reopened)
  const earliest = res.earliestStart ?? undefined

  const regular = dayRows
    .flatMap(row => generateSlots({ start: row.startTime, end: row.endTime }))
    .filter(t => !booked.has(t) && !reopenedSet.has(t) && (earliest === undefined || t >= earliest))

  return { regular, reopened, dayKind }
}

// ¿Hay alguna profesional con horarios de trabajo ese día? (para elegir el mensaje cuando no hay lugar)
export function hasWorkingHoursOn(res: AvailabilityResponse): boolean {
  return res.availability.length > 0
}

// "Cualquiera": alcanza con que UNA profesional tenga el horario libre.
export function unionSlots(list: DaySlots[]): DaySlots {
  const reopened = [...new Set(list.flatMap(s => s.reopened))].sort()
  const reopenedSet = new Set(reopened)
  const regular = [...new Set(list.flatMap(s => s.regular))].filter(t => !reopenedSet.has(t)).sort()
  return { regular, reopened, dayKind: mergeKinds(list.map(s => s.dayKind)) }
}

// Combo simultáneo: el horario tiene que servirle a todos los servicios a la vez.
export function intersectSlots(list: DaySlots[]): DaySlots {
  if (list.length === 0) return EMPTY_DAY
  const common = (s: DaySlots) => new Set([...s.regular, ...s.reopened])
  const sets = list.map(common)
  const all = [...sets[0]].filter(t => sets.every(set => set.has(t)))
  const reopenedAny = new Set(list.flatMap(s => s.reopened))
  return {
    regular:  all.filter(t => !reopenedAny.has(t)).sort(),
    reopened: all.filter(t => reopenedAny.has(t)).sort(),
    dayKind:  mergeKinds(list.map(s => s.dayKind)),
  }
}

function mergeKinds(kinds: DayKind[]): DayKind {
  if (kinds.includes('today')) return 'today'
  if (kinds.includes('future')) return 'future'
  if (kinds.length > 0 && kinds.every(k => k === 'past')) return 'past'
  return 'unknown'
}

// Valor del atributo `min` de un <input type="date">: el día de hoy en el calendario local del
// navegador (no en UTC). Es solo una ayuda visual; quien decide si un horario sirve es el servidor.
export function localTodayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
