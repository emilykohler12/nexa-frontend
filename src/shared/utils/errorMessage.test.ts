import { describe, it, expect } from 'vitest'
import { safeErrorMessage } from './errorMessage'

function errWith(status: number | undefined, message: unknown) {
  return { response: { status, data: { error: message } } }
}

describe('safeErrorMessage', () => {
  it('devuelve el mensaje del backend cuando es un texto normal', () => {
    const msg = safeErrorMessage(errWith(400, 'Ese horario ya no está disponible'), 'fallback')
    expect(msg).toBe('Ese horario ya no está disponible')
  })

  it('usa el fallback si no hay mensaje', () => {
    expect(safeErrorMessage({}, 'fallback')).toBe('fallback')
    expect(safeErrorMessage(errWith(400, undefined), 'fallback')).toBe('fallback')
    expect(safeErrorMessage(errWith(400, ''), 'fallback')).toBe('fallback')
    expect(safeErrorMessage(errWith(400, '   '), 'fallback')).toBe('fallback')
  })

  it('usa el fallback para cualquier error 5xx, sin importar el texto', () => {
    const msg = safeErrorMessage(errWith(500, 'Un mensaje perfectamente normal'), 'fallback')
    expect(msg).toBe('fallback')
  })

  it('usa el fallback si el mensaje es sospechosamente largo', () => {
    const long = 'x'.repeat(201)
    expect(safeErrorMessage(errWith(400, long), 'fallback')).toBe('fallback')
  })

  it('usa el fallback si el mensaje tiene saltos de línea (stack trace)', () => {
    expect(safeErrorMessage(errWith(400, 'línea uno\nlínea dos'), 'fallback')).toBe('fallback')
  })

  it('nunca deja pasar un mensaje que huela a error técnico de Prisma/Node', () => {
    const technical = [
      "Invalid `prisma.appointment.create()` invocation",
      'Unknown argument `foo`',
      'at Object.<anonymous> (/app/src/foo.ts:42:10)',
      'Cannot read properties of undefined (at node_modules/express/lib/router.js)',
      'PrismaClientKnownRequestError',
    ]
    for (const message of technical) {
      expect(safeErrorMessage(errWith(400, message), 'fallback')).toBe('fallback')
    }
  })
})
