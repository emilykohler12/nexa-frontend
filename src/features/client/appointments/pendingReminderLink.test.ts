import { describe, it, expect, beforeEach } from 'vitest'
import { setPendingReminderLink, consumePendingReminderLink, PENDING_REMINDER_LINK_KEY } from './pendingReminderLink'

describe('pendingReminderLink', () => {
  beforeEach(() => sessionStorage.clear())

  it('devuelve el enlace guardado y lo borra: se usa una sola vez', () => {
    setPendingReminderLink({ turno: 'cm1abc', accion: 'cancelar' })

    expect(consumePendingReminderLink()).toEqual({ turno: 'cm1abc', accion: 'cancelar' })
    expect(consumePendingReminderLink()).toBeNull()
  })

  it('sin nada guardado devuelve null', () => {
    expect(consumePendingReminderLink()).toBeNull()
  })

  it('vence a la hora: a la hora justa sirve, un minuto después no (y igual se borra)', () => {
    const t0 = 1_000_000
    setPendingReminderLink({ turno: 'cm1abc', accion: 'ver' }, t0)
    expect(consumePendingReminderLink(t0 + 60 * 60_000)).toEqual({ turno: 'cm1abc', accion: 'ver' })

    setPendingReminderLink({ turno: 'cm1abc', accion: 'ver' }, t0)
    expect(consumePendingReminderLink(t0 + 61 * 60_000)).toBeNull()
    expect(sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)).toBeNull()
  })

  it('descarta valores alterados o corruptos en vez de usarlos', () => {
    sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, JSON.stringify({ turno: '<script>', accion: 'cancelar', at: Date.now() }))
    expect(consumePendingReminderLink()).toBeNull()

    sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, 'no es json')
    expect(consumePendingReminderLink()).toBeNull()

    sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, JSON.stringify({ turno: 'cm1abc', accion: 'cancelar' }))
    expect(consumePendingReminderLink()).toBeNull() // sin marca de hora
  })

  it('una acción desconocida guardada cae en «ver»', () => {
    sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, JSON.stringify({ turno: 'cm1abc', accion: 'borrar', at: Date.now() }))
    expect(consumePendingReminderLink()).toEqual({ turno: 'cm1abc', accion: 'ver' })
  })
})
