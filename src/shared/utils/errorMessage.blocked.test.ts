import { describe, it, expect } from 'vitest'
import { safeErrorMessage } from './errorMessage'

const apiError = (status: number, data: { error?: string; code?: string }) => ({ response: { status, data } })

describe('clienta bloqueada: el error nunca delata el bloqueo (06/11/2026)', () => {
  it('OPERATION_FAILED muestra el texto genérico del servidor', () => {
    const msg = safeErrorMessage(apiError(400, { error: 'No pudimos completar la operación', code: 'OPERATION_FAILED' }), 'No se pudo reservar.')
    expect(msg).toBe('No pudimos completar la operación')
  })

  it('aunque un servidor viejo mande 403 CLIENT_BLOCKED con su texto, se muestra el genérico', () => {
    const msg = safeErrorMessage(
      apiError(403, { error: 'Tu cuenta está bloqueada y no puede reservar turnos. Contactanos para más información.', code: 'CLIENT_BLOCKED' }),
      'No se pudo reservar.',
    )
    expect(msg).toBe('No pudimos completar la operación')
    expect(msg.toLowerCase()).not.toMatch(/bloquead|bloqueo/)
  })
})
