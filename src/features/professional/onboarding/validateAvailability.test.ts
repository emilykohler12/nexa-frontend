import { describe, it, expect } from 'vitest'
import { validateAvailability, EMPTY_AVAILABILITY } from './types'

describe('validateAvailability', () => {
  it('acepta franjas con inicio menor al fin y días libres', () => {
    expect(validateAvailability({ ...EMPTY_AVAILABILITY, monday: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '20:00' }] })).toBeNull()
    expect(validateAvailability(EMPTY_AVAILABILITY)).toBeNull()
  })

  it('rechaza inicio igual o posterior al fin y nombra el día', () => {
    expect(validateAvailability({ ...EMPTY_AVAILABILITY, tuesday: [{ start: '18:00', end: '09:00' }] })).toBe('Martes: la hora de inicio tiene que ser anterior a la de fin.')
    expect(validateAvailability({ ...EMPTY_AVAILABILITY, friday: [{ start: '10:00', end: '10:00' }] })).toMatch(/^Viernes:/)
  })

  it('rechaza una hora vacía', () => {
    expect(validateAvailability({ ...EMPTY_AVAILABILITY, sunday: [{ start: '', end: '10:00' }] })).toMatch(/^Domingo: completá/)
  })
})
