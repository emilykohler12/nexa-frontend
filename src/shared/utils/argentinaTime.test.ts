import { describe, it, expect } from 'vitest'
import { argentinaDateOf, todayInArgentina, appointmentInstant } from './argentinaTime'

describe('argentinaDateOf: la fecha en hora de Argentina, no en UTC', () => {
  it('a las 20:59 de Argentina es el mismo día en UTC y en Argentina', () => {
    expect(argentinaDateOf(new Date('2026-10-31T20:59:00-03:00'))).toBe('2026-10-31')
  })

  it('a las 21:00 en punto de Argentina (00:00 UTC del día siguiente) sigue siendo el mismo día', () => {
    const at = new Date('2026-10-31T21:00:00-03:00')
    expect(at.toISOString().split('T')[0]).toBe('2026-11-01') // el error que se evita
    expect(argentinaDateOf(at)).toBe('2026-10-31')
  })

  it('a las 23:59 de Argentina sigue siendo el mismo día', () => {
    expect(argentinaDateOf(new Date('2026-10-31T23:59:59-03:00'))).toBe('2026-10-31')
  })

  it('a la medianoche de Argentina cambia el día', () => {
    expect(argentinaDateOf(new Date('2026-11-01T00:00:00-03:00'))).toBe('2026-11-01')
  })

  it('a las 00:30 UTC todavía es el día anterior en Argentina; a las 03:00 UTC ya es el nuevo', () => {
    expect(argentinaDateOf(new Date('2026-11-01T00:30:00Z'))).toBe('2026-10-31')
    expect(argentinaDateOf(new Date('2026-11-01T02:59:59Z'))).toBe('2026-10-31')
    expect(argentinaDateOf(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11-01')
  })

  it('cambio de mes y de año', () => {
    expect(argentinaDateOf(new Date('2026-12-31T22:00:00-03:00'))).toBe('2026-12-31')
    expect(argentinaDateOf(new Date('2027-01-01T00:00:00-03:00'))).toBe('2027-01-01')
  })

  it('el 29 de febrero de un año bisiesto', () => {
    expect(argentinaDateOf(new Date('2028-02-29T21:30:00-03:00'))).toBe('2028-02-29')
  })

  it('coincide con la fecha del turno cuando el turno se arma con appointmentInstant', () => {
    expect(argentinaDateOf(appointmentInstant('2026-11-03', '21:30'))).toBe('2026-11-03')
    expect(argentinaDateOf(appointmentInstant('2026-11-03', '00:00'))).toBe('2026-11-03')
  })
})

describe('todayInArgentina', () => {
  it('usa el instante recibido', () => {
    expect(todayInArgentina(new Date('2026-11-01T01:00:00Z'))).toBe('2026-10-31')
  })

  it('sin argumento devuelve la fecha de hoy con formato AAAA-MM-DD', () => {
    expect(todayInArgentina()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
