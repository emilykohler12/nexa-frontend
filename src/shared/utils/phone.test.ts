import { describe, it, expect } from 'vitest'
import { isArgentineMobile, phoneError, PHONE_ERROR } from './phone'

// Mismos casos que nexa-backend/tests/integration/phone.validation.test.ts: las dos reglas tienen que coincidir.
describe('isArgentineMobile', () => {
  it.each([
    '+54 9 11 2345-6789', '+5491123456789', '011 15 2345-6789', '11 2345 6789', '1123456789',
    '(11) 2345-6789', '3764 15-123456', '3764111111', '0376 15 4123456', '+54 376 411-1111',
  ])('acepta %s', (phone) => expect(isArgentineMobile(phone)).toBe(true))

  it.each([
    '', '1', '12345', '112345678', '11234567890123', 'abcdefghij', '11 2345 678a', '+54 9 0 0000 0000',
    '5112345678', '9112345678', '0112345678', '11-2345', '+1 555 123 4567',
  ])('rechaza %j', (phone) => expect(isArgentineMobile(phone)).toBe(false))
})

describe('phoneError', () => {
  it('el vacío no es error (teléfono opcional)', () => {
    expect(phoneError('')).toBeNull()
    expect(phoneError('   ')).toBeNull()
  })
  it('devuelve el mensaje cuando no es un celular válido', () => {
    expect(phoneError('123')).toBe(PHONE_ERROR)
  })
  it('null con un celular válido', () => {
    expect(phoneError('11 5555-0123')).toBeNull()
  })
})
