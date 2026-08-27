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

export function safeErrorMessage(err: any, fallback: string): string {
  const status  = err?.response?.status
  const message = err?.response?.data?.error

  if (typeof message !== 'string' || !message.trim()) return fallback
  if (status && status >= 500) return fallback
  if (message.length > 200) return fallback
  if (message.includes('\n')) return fallback
  if (UNSAFE_PATTERNS.some(p => p.test(message))) return fallback

  return message
}
