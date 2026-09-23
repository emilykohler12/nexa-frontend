import { describe, it, expect, vi, afterEach } from 'vitest'
import { isPromotionLive } from './promotionWindow'

describe('isPromotionLive', () => {
  afterEach(() => vi.useRealTimers())

  it('es viva sin fechas de inicio/fin', () => {
    expect(isPromotionLive({ startDate: null, endDate: null })).toBe(true)
  })

  it('no está viva si startDate es futuro', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
    expect(isPromotionLive({ startDate: '2026-06-20', endDate: null })).toBe(false)
  })

  it('no está viva si endDate ya pasó', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
    expect(isPromotionLive({ startDate: null, endDate: '2026-06-10' })).toBe(false)
  })

  it('está viva dentro de la ventana', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
    expect(isPromotionLive({ startDate: '2026-06-01', endDate: '2026-06-30' })).toBe(true)
  })

  it('está viva justo el día de inicio y el día de fin', () => {
    // Mediodía a propósito (no cerca de medianoche): isPromotionLive compara
    // contra toISOString(), que pasa a UTC — un horario cercano a medianoche
    // haría que el test dependa de la zona horaria de quien lo corre.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00'))
    expect(isPromotionLive({ startDate: '2026-06-15', endDate: '2026-06-15' })).toBe(true)
  })
})
