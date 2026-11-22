import { describe, it, expect } from 'vitest'
import { dmyInText, formatDateDMY } from './dateFormat'

describe('fechas en día/mes/año', () => {
  it('formatDateDMY pasa AAAA-MM-DD a DD/MM/AAAA', () => {
    expect(formatDateDMY('2026-11-21')).toBe('21/11/2026')
    expect(formatDateDMY('2027-01-05')).toBe('05/01/2027')
  })

  it('devuelve tal cual lo que no es una fecha', () => {
    expect(formatDateDMY('')).toBe('')
    expect(formatDateDMY('mañana')).toBe('mañana')
  })

  it('dmyInText cambia todas las fechas de un texto y deja el resto', () => {
    expect(dmyInText('Corte con Lucía: 2026-11-21 10:00 → 2026-11-23 14:00')).toBe('Corte con Lucía: 21/11/2026 10:00 → 23/11/2026 14:00')
    expect(dmyInText('Sin fechas, solo 10:00')).toBe('Sin fechas, solo 10:00')
  })
})
