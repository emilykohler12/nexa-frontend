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

// Fase 2 del backend: reglas de horarios reabiertos, reserva tardía e inasistencias.
describe('safeErrorMessage: códigos de las reglas de horarios y estados', () => {
  const errWithCode = (status: number, code: string, message = 'texto del servidor') =>
    ({ response: { status, data: { error: message, code } } })

  const casos: [string, RegExp][] = [
    ['INVALID_STATUS_TRANSITION', /cambio de estado no se puede hacer/],
    ['APPOINTMENT_OVERLAP', /se superpone con otro turno/],
    ['SERVICE_DOES_NOT_FIT', /El servicio no entra en ese horario/],
    ['REOPENED_SLOT_CLOSED', /horario de último momento ya cerró/],
    ['REOPENED_SLOT_UNAVAILABLE', /horario de último momento ya no está disponible/],
    ['NO_SHOW_BEFORE_START', /todavía no empezó/],
    ['NOT_CANCELLABLE', /ya no se puede cancelar/],
    ['START_TIME_PASSED', /horario ya pasó/],
    ['INVALID_NOTICE_TIME', /hora de aviso no puede ser futura/],
    ['NOTICE_TOO_OLD', /más de 48 horas lo tiene que cargar la administradora/],
  ]

  it.each(casos)('%s tiene un mensaje claro en español', (code, pattern) => {
    const msg = safeErrorMessage(errWithCode(400, code), 'fallback')
    expect(msg).toMatch(pattern)
    expect(msg).not.toBe('texto del servidor')
    expect(msg).not.toBe('fallback')
  })

  it('el mensaje propio gana aunque el texto del servidor sea técnico o muy largo', () => {
    expect(safeErrorMessage(errWithCode(409, 'SERVICE_DOES_NOT_FIT', 'x'.repeat(300)), 'fallback')).toMatch(/El servicio no entra/)
  })

  it('un 5xx sigue usando el fallback aunque traiga uno de estos códigos', () => {
    expect(safeErrorMessage(errWithCode(500, 'NOT_CANCELLABLE'), 'fallback')).toBe('fallback')
  })

  it('un código desconocido conserva el mensaje del servidor', () => {
    expect(safeErrorMessage(errWithCode(400, 'OTRO_CODIGO', 'Mensaje normal'), 'fallback')).toBe('Mensaje normal')
  })
})
