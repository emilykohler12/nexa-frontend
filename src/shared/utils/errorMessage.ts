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

// Forma de un error de axios de la que solo se lee el status y el mensaje del backend.
interface ApiErrorLike {
  response?: { status?: number; data?: { error?: unknown } }
}

export function safeErrorMessage(err: unknown, fallback: string): string {
  const apiError = err as ApiErrorLike | null | undefined
  const status   = apiError?.response?.status
  const message  = apiError?.response?.data?.error

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
