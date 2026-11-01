import { describe, it, expect } from 'vitest'
import { parseReminderLink, reminderLinkSearch, resolveReminderLink, REMINDER_LINK_MESSAGES } from './reminderLink'
import { NO_SHOW_AUTO_NOTICE } from '@/app/data/shared/status.data'

const params = (qs: string) => new URLSearchParams(qs)
const NOW = new Date('2026-11-03T10:00:00-03:00').getTime()

const appt = (extra: Record<string, unknown> = {}) => ({
  id: 'a1', date: '2026-11-03', time: '16:00', status: 'confirmed', comboGroupId: null as string | null,
  ...extra,
})

describe('parseReminderLink', () => {
  it.each(['ver', 'reprogramar', 'cancelar'] as const)('lee turno y accion=%s', accion => {
    expect(parseReminderLink(params(`turno=cm1abc&accion=${accion}`))).toEqual({ turno: 'cm1abc', accion })
  })

  it('una acción ausente o desconocida cae en «ver»', () => {
    expect(parseReminderLink(params('turno=cm1abc'))).toEqual({ turno: 'cm1abc', accion: 'ver' })
    expect(parseReminderLink(params('turno=cm1abc&accion=borrar'))).toEqual({ turno: 'cm1abc', accion: 'ver' })
    expect(parseReminderLink(params('turno=cm1abc&accion=CANCELAR'))).toEqual({ turno: 'cm1abc', accion: 'ver' })
  })

  it.each(['', 'a b', '<script>', '../x', 'a/b', 'x'.repeat(65)])('rechaza el turno inválido «%s»', turno => {
    expect(parseReminderLink(params(`turno=${encodeURIComponent(turno)}&accion=cancelar`))).toBeNull()
  })

  it('sin turno no hay enlace', () => {
    expect(parseReminderLink(params('accion=cancelar'))).toBeNull()
  })

  it('reminderLinkSearch arma solo turno y accion', () => {
    expect(reminderLinkSearch({ turno: 'cm1abc', accion: 'cancelar' })).toBe('?turno=cm1abc&accion=cancelar')
  })
})

describe('resolveReminderLink', () => {
  const link = (accion: 'ver' | 'reprogramar' | 'cancelar' = 'ver') => ({ turno: 'a1', accion })

  it('abre el turno con la acción pedida', () => {
    for (const accion of ['ver', 'reprogramar', 'cancelar'] as const) {
      const out = resolveReminderLink(link(accion), [appt()], NOW)
      expect(out).toMatchObject({ kind: 'open', accion })
    }
  })

  it('también abre un turno pendiente de seña', () => {
    expect(resolveReminderLink(link(), [appt({ status: 'pending' })], NOW).kind).toBe('open')
  })

  it('turno inexistente o ajeno: mismo mensaje, sin confirmar si el id existe', () => {
    expect(resolveReminderLink(link(), [appt({ id: 'otro' })], NOW)).toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.notFound })
    expect(resolveReminderLink(link(), [], NOW)).toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.notFound })
  })

  it.each([
    ['no_show_auto',      NO_SHOW_AUTO_NOTICE],
    ['cancelled_no_show', REMINDER_LINK_MESSAGES.noShow],
    ['finished',          REMINDER_LINK_MESSAGES.finished],
    ['cancelled',         REMINDER_LINK_MESSAGES.cancelled],
    ['estado_nuevo',      REMINDER_LINK_MESSAGES.cancelled],
  ])('estado %s: mensaje y no abre nada', (status, text) => {
    expect(resolveReminderLink(link('cancelar'), [appt({ status })], NOW)).toEqual({ kind: 'message', text })
  })

  describe('turno que ya empezó', () => {
    it('un segundo antes abre; a la hora exacta y después, no', () => {
      const a = appt({ time: '21:00' })
      expect(resolveReminderLink(link(), [a], new Date('2026-11-03T20:59:59-03:00').getTime()).kind).toBe('open')
      expect(resolveReminderLink(link(), [a], new Date('2026-11-03T21:00:00-03:00').getTime())).toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.started })
      expect(resolveReminderLink(link(), [a], new Date('2026-11-03T21:01:00-03:00').getTime()).kind).toBe('message')
    })

    it('se mide en hora de Argentina aunque el instante caiga ya en el día siguiente en UTC', () => {
      // 22:30 de Argentina es 01:30 UTC del 4/11: un turno de las 22:00 del 3/11 ya empezó.
      const out = resolveReminderLink(link(), [appt({ time: '22:00' })], new Date('2026-11-04T01:30:00Z').getTime())
      expect(out).toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.started })
    })

    it('un turno de la madrugada del día siguiente no empezó a las 23:59', () => {
      const out = resolveReminderLink(link(), [appt({ date: '2026-11-04', time: '00:10' })], new Date('2026-11-03T23:59:00-03:00').getTime())
      expect(out.kind).toBe('open')
    })
  })

  describe('combos', () => {
    const legs = (extra: [Record<string, unknown>, Record<string, unknown>] = [{}, {}]) => [
      appt({ id: 'a1', comboGroupId: 'g1', ...extra[0] }),
      appt({ id: 'a2', comboGroupId: 'g1', ...extra[1] }),
    ]

    it('reprogramar no se puede en un combo', () => {
      expect(resolveReminderLink(link('reprogramar'), legs(), NOW)).toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.comboReschedule })
    })

    it('cancelar y ver abren la pata del enlace', () => {
      expect(resolveReminderLink(link('cancelar'), legs(), NOW)).toMatchObject({ kind: 'open', target: { id: 'a1' } })
      expect(resolveReminderLink(link('ver'), legs(), NOW)).toMatchObject({ kind: 'open', target: { id: 'a1' } })
    })

    it('si la pata del enlace ya está cancelada se usa la primera que sigue en pie', () => {
      expect(resolveReminderLink(link('ver'), legs([{ status: 'cancelled' }, {}]), NOW)).toMatchObject({ kind: 'open', target: { id: 'a2' } })
    })

    it('con todas las patas cerradas, mensaje según el estado', () => {
      expect(resolveReminderLink(link('ver'), legs([{ status: 'cancelled' }, { status: 'cancelled' }]), NOW))
        .toEqual({ kind: 'message', text: REMINDER_LINK_MESSAGES.cancelled })
    })

    it('otro grupo de combo no se mezcla', () => {
      const all = [...legs(), appt({ id: 'z9', comboGroupId: 'g2', status: 'cancelled' })]
      expect(resolveReminderLink(link('cancelar'), all, NOW).kind).toBe('open')
    })
  })
})
