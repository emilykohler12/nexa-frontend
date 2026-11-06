import { describe, it, expect } from 'vitest'
import { safeErrorMessage } from './errorMessage'

// Fase 10 del backend: VALIDATION_ERROR, NOT_FOUND, INSUFFICIENT_STOCK y el 429 de postulaciones.
const withCode = (status: number, code: string, error?: string) => ({ response: { status, data: { code, error } } })

describe('safeErrorMessage — códigos de la Fase 10 del backend', () => {
  it('VALIDATION_ERROR: muestra el texto del servidor y le saca la ruta técnica del campo', () => {
    const msg = safeErrorMessage(
      withCode(400, 'VALIDATION_ERROR', 'La hora de inicio tiene que ser anterior a la de fin (availability.monday.0)'),
      'fallback',
    )
    expect(msg).toBe('La hora de inicio tiene que ser anterior a la de fin')
  })

  it('VALIDATION_ERROR: si el texto está en inglés o falta, usa un mensaje claro en español', () => {
    const generic = 'Hay datos que no son válidos. Revisá lo que cargaste y probá de nuevo.'
    expect(safeErrorMessage(withCode(400, 'VALIDATION_ERROR', 'Invalid input: expected number'), 'fallback')).toBe(generic)
    expect(safeErrorMessage(withCode(400, 'VALIDATION_ERROR'), 'fallback')).toBe(generic)
  })

  it('NOT_FOUND sin texto usable: avisa que ya no existe', () => {
    expect(safeErrorMessage(withCode(404, 'NOT_FOUND'), 'fallback')).toMatch(/Ya no existe/)
  })

  it('NOT_FOUND con el texto del servidor: lo conserva', () => {
    expect(safeErrorMessage(withCode(404, 'NOT_FOUND', 'Foto no encontrada'), 'fallback')).toBe('Foto no encontrada')
  })

  it('INSUFFICIENT_STOCK: conserva el texto del servidor (trae el nombre del producto) y tiene mensaje propio si falta', () => {
    const server = 'No se puede borrar esa entrada: parte de ese stock de Esmalte ya se vendió'
    expect(safeErrorMessage(withCode(400, 'INSUFFICIENT_STOCK', server), 'fallback')).toBe(server)
    expect(safeErrorMessage(withCode(400, 'INSUFFICIENT_STOCK'), 'fallback')).toMatch(/stock suficiente/)
  })

  it('429 sin código ni texto: pide esperar un rato', () => {
    expect(safeErrorMessage({ response: { status: 429, data: {} } }, 'fallback')).toMatch(/demasiados intentos/)
  })

  it('un 5xx con código de la Fase 10 sigue usando el fallback', () => {
    expect(safeErrorMessage(withCode(500, 'VALIDATION_ERROR', 'algo'), 'fallback')).toBe('fallback')
  })
})
