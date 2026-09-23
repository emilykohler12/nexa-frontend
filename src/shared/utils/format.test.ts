import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCurrencyCompact } from './format'

// El espacio entre "$" y el número que devuelve Intl es un non-breaking
// space (U+00A0), no uno normal — se normaliza antes de comparar para que el
// test no dependa del caracter exacto que use la versión de ICU del runner.
function normalizeSpaces(s: string): string {
  return s.replace(/\s/g, ' ')
}

describe('formatCurrency', () => {
  it('formatea en pesos argentinos sin decimales', () => {
    expect(normalizeSpaces(formatCurrency(10000))).toBe('$ 10.000')
  })

  it('redondea a entero (maximumFractionDigits: 0)', () => {
    expect(normalizeSpaces(formatCurrency(1500.7))).toBe('$ 1.501')
  })

  it('funciona con cero', () => {
    expect(normalizeSpaces(formatCurrency(0))).toBe('$ 0')
  })
})

describe('formatCurrencyCompact', () => {
  it('abrevia montos grandes', () => {
    expect(formatCurrencyCompact(1500000)).toMatch(/1[.,]5\s?M/)
  })
})
