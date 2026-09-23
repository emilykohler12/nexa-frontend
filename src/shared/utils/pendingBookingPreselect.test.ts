import { describe, it, expect, beforeEach } from 'vitest'
import { setPendingBookingPreselect, consumePendingBookingPreselect } from './pendingBookingPreselect'

describe('pendingBookingPreselect', () => {
  beforeEach(() => sessionStorage.clear())

  it('guarda y consume la preselección una sola vez', () => {
    setPendingBookingPreselect({ serviceId: 'svc-1', professionalId: 'pro-1', promotionId: 'promo-1' })

    const first = consumePendingBookingPreselect()
    expect(first).toEqual({ serviceId: 'svc-1', professionalId: 'pro-1', promotionId: 'promo-1' })

    const second = consumePendingBookingPreselect()
    expect(second).toBeNull()
  })

  it('devuelve null si nunca se guardó nada', () => {
    expect(consumePendingBookingPreselect()).toBeNull()
  })

  it('devuelve null (no rompe) si el valor guardado no es JSON válido', () => {
    sessionStorage.setItem('nexa_pending_booking_preselect', 'esto no es json{{{')
    expect(consumePendingBookingPreselect()).toBeNull()
  })
})
