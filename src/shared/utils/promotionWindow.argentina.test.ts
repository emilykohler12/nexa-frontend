import { describe, it, expect, vi, afterEach } from 'vitest'
import { isPromotionLive } from './promotionWindow'

afterEach(() => vi.useRealTimers())

describe('isPromotionLive en hora de Argentina', () => {
  it('a las 22:00 de Argentina (01:00 UTC del día siguiente) una promo que termina hoy sigue vigente', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-04T01:00:00Z')) // 3/11 22:00 en Argentina
    expect(isPromotionLive({ startDate: null, endDate: '2026-11-03' })).toBe(true)
    expect(isPromotionLive({ startDate: '2026-11-04', endDate: null })).toBe(false)
  })
})
