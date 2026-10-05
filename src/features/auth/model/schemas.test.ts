import { describe, it, expect } from 'vitest'
import { registerSchema } from './schemas'

// RF-02 — el alta de clienta pide nombre, apellido y teléfono celular por separado.
describe('registerSchema', () => {
  const valid = {
    name: 'Ana', lastName: 'Pérez', phone: '1155550000',
    email: 'ana@test.local', password: 'Password123', termsAccepted: true,
  }

  it('acepta un alta completa', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('exige el apellido', () => {
    expect(registerSchema.safeParse({ ...valid, lastName: undefined }).success).toBe(false)
  })

  it('exige el teléfono', () => {
    expect(registerSchema.safeParse({ ...valid, phone: undefined }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, phone: '' }).success).toBe(false)
  })
})
