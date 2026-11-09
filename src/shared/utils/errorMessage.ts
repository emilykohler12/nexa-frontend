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
  // Fase 3: hora de aviso de la clienta al cancelar (la carga el personal).
  INVALID_NOTICE_TIME: 'La hora de aviso no puede ser futura. Revisá el día y la hora en que avisó la clienta.',
  NOTICE_TOO_OLD: 'Un aviso de hace más de 48 horas lo tiene que cargar la administradora.',
  // Una clienta bloqueada nunca debe enterarse de que lo está: el servidor responde OPERATION_FAILED y, por si algún
  // servidor viejo todavía manda CLIENT_BLOCKED, se muestra el mismo texto genérico.
  OPERATION_FAILED: 'No pudimos completar la operación',
  CLIENT_BLOCKED: 'No pudimos completar la operación',
}

// Fase 10 del backend. A diferencia de los de arriba, estos NO pisan el texto del servidor: el
// servidor ya manda un mensaje en español y más preciso (ej. «No hay suficiente stock de Esmalte…»,
// «La hora de inicio tiene que ser anterior a la de fin»). Se usan solo cuando ese texto falta o
// no es seguro de mostrar, y tienen prioridad sobre el fallback genérico de cada pantalla.
export const ERROR_CODE_FALLBACKS: Record<string, string> = {
  VALIDATION_ERROR: 'Hay datos que no son válidos. Revisá lo que cargaste y probá de nuevo.',
  NOT_FOUND: 'Ya no existe lo que intentás modificar. Actualizá la página y probá de nuevo.',
  INSUFFICIENT_STOCK: 'No hay stock suficiente para hacer esto. Revisá las cantidades.',
}

// 429 sin código (el límite de envíos de postulaciones y el global no mandan `code`).
export const TOO_MANY_REQUESTS_MESSAGE = 'Hiciste demasiados intentos seguidos. Esperá un rato y probá de nuevo.'

// El backend agrega a veces la ruta del campo al final del mensaje de validación, ej.
// «La hora de inicio tiene que ser anterior a la de fin (availability.monday.0)». Eso es técnico.
const TRAILING_FIELD_PATH = /\s*\([A-Za-z_][\w]*(?:\.[\w]+)+\)\s*$|\s*\([A-Za-z_]\w*\)\s*$/

// Mensajes por defecto de zod (en inglés) que nunca deben llegar a la pantalla.
const ENGLISH_VALIDATION = /^(invalid|required|expected|too (small|big)|string must|number must|unrecognized)/i

// Forma de un error de axios de la que solo se lee el status, el código y el mensaje del backend.
interface ApiErrorLike {
  response?: { status?: number; data?: { error?: unknown; code?: unknown } }
}

function usableServerMessage(raw: unknown, code: unknown): string | null {
  if (typeof raw !== 'string') return null
  let message = raw.trim()
  if (code === 'VALIDATION_ERROR') message = message.replace(TRAILING_FIELD_PATH, '').trim()
  if (!message) return null
  if (message.length > 200) return null
  if (message.includes('\n')) return null
  if (UNSAFE_PATTERNS.some(p => p.test(message))) return null
  if (ENGLISH_VALIDATION.test(message)) return null
  return message
}

export function safeErrorMessage(err: unknown, fallback: string): string {
  const apiError = err as ApiErrorLike | null | undefined
  const status   = apiError?.response?.status
  const code     = apiError?.response?.data?.code

  if (typeof code === 'string' && code in ERROR_CODE_MESSAGES && !(status && status >= 500)) {
    return ERROR_CODE_MESSAGES[code]
  }
  if (status && status >= 500) return fallback

  const message = usableServerMessage(apiError?.response?.data?.error, code)
  if (message) return message

  if (typeof code === 'string' && code in ERROR_CODE_FALLBACKS) return ERROR_CODE_FALLBACKS[code]
  if (status === 429) return TOO_MANY_REQUESTS_MESSAGE
  return fallback
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
