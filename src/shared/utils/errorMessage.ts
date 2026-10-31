// src/shared/utils/errorMessage.ts
//
// El backend a veces devuelve un error 500 con el mensaje crudo de Prisma/Node
// (rutas de archivo, stack trace, nombres de columnas) en vez de un mensaje
// pensado para el usuario. Esto nunca debe llegar a pantalla — si el mensaje
// "huele" a algo técnico, se descarta y se usa el fallback en su lugar.
const UNSAFE_PATTERNS = [
  /prisma/i,
  /\.ts:\d+/,
  /invocation/i,
  /at Object\.|at async |at [A-Za-z]+\.[a-z]+ ?\(/,
  /node_modules/,
  /invalid `/i,
  /unknown argument/i,
  /expected [a-z]+\./i,
  /\bsql\b/i,
]

// Mensajes propios para los códigos de error de las reglas de horarios y de estados (Fase 2 del
// backend). Tienen prioridad sobre el texto que manda el servidor: este mismo código se usa en
// situaciones parecidas con textos distintos, y acá queda uno claro para la usuaria.
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_STATUS_TRANSITION: 'Ese cambio de estado no se puede hacer con este turno. Si figura como «No asistió», corregí primero su estado.',
  APPOINTMENT_OVERLAP: 'No se puede confirmar: el turno se superpone con otro turno de la profesional.',
  SERVICE_DOES_NOT_FIT: 'El servicio no entra en ese horario: no termina antes del siguiente turno ni dentro del horario de trabajo. Elegí otro horario.',
  REOPENED_SLOT_CLOSED: 'Ese horario de último momento ya cerró. Elegí otro horario.',
  REOPENED_SLOT_UNAVAILABLE: 'Ese horario de último momento ya no está disponible. Elegí uno de los que se ofrecen.',
  NO_SHOW_BEFORE_START: 'No se puede marcar «No asistió» un turno que todavía no empezó.',
  NOT_CANCELLABLE: 'Este turno ya no se puede cancelar.',
  START_TIME_PASSED: 'Ese horario ya pasó. Elegí otro horario.',
}

// Forma de un error de axios de la que solo se lee el status, el código y el mensaje del backend.
interface ApiErrorLike {
  response?: { status?: number; data?: { error?: unknown; code?: unknown } }
}

export function safeErrorMessage(err: unknown, fallback: string): string {
  const apiError = err as ApiErrorLike | null | undefined
  const status   = apiError?.response?.status
  const message  = apiError?.response?.data?.error
  const code     = apiError?.response?.data?.code

  if (typeof code === 'string' && code in ERROR_CODE_MESSAGES && !(status && status >= 500)) {
    return ERROR_CODE_MESSAGES[code]
  }
  if (typeof message !== 'string' || !message.trim()) return fallback
  if (status && status >= 500) return fallback
  if (message.length > 200) return fallback
  if (message.includes('\n')) return fallback
  if (UNSAFE_PATTERNS.some(p => p.test(message))) return fallback

  return message
}

// Código de error del backend (por ejemplo 'PROFESSIONAL_SLOT_TAKEN') y status HTTP de un error de
// axios, para decidir qué hacer sin tipar el error como any.
export function apiErrorCode(err: unknown): string | undefined {
  const code = (err as { response?: { data?: { code?: unknown } } } | null | undefined)?.response?.data?.code
  return typeof code === 'string' ? code : undefined
}

export function apiErrorStatus(err: unknown): number | undefined {
  const status = (err as ApiErrorLike | null | undefined)?.response?.status
  return typeof status === 'number' ? status : undefined
}
