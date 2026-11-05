import { describe, it, expect } from 'vitest'
import {
  checkNoticeTime, decideRefund, describeClientOutcome, describeStaffOutcome, formatHours, fromArgentinaInput,
  isDepositPaid, noticeHoursBefore, toArgentinaInput, type RefundRule,
} from './cancellation'

const RULE: RefundRule = { cancellationHours: 12, refundPolicy: 'full' }
// Turno: 03/11/2026 16:00 (hora de Argentina).
const DATE = '2026-11-03'
const TIME = '16:00'
const hoursBefore = (h: number) => new Date(new Date(`${DATE}T${TIME}:00-03:00`).getTime() - h * 3_600_000)

describe('formatHours', () => {
  it('muestra horas y minutos, truncando los minutos sueltos', () => {
    expect(formatHours(13)).toBe('13 h 0 min')
    expect(formatHours(11.5)).toBe('11 h 30 min')
    expect(formatHours(11 + 59.9 / 60)).toBe('11 h 59 min')
  })
})

describe('isDepositPaid', () => {
  it('la seña está paga con partial o paid', () => {
    expect(isDepositPaid('partial')).toBe(true)
    expect(isDepositPaid('paid')).toBe(true)
    expect(isDepositPaid('pending')).toBe(false)
    expect(isDepositPaid('refunded')).toBe(false)
    expect(isDepositPaid(undefined)).toBe(false)
  })
})

describe('decideRefund: cancela la clienta', () => {
  const decide = (h: number, rule: RefundRule | null = RULE) => decideRefund({ rule, cancelledBy: 'client', paid: true, hours: noticeHoursBefore(DATE, TIME, hoursBefore(h)) })

  it('con 13 horas de aviso se devuelve la seña', () => {
    expect(decide(13)).toEqual({ kind: 'refund' })
  })
  it('con 12 horas justas se devuelve (el corte es «12 o más»)', () => {
    expect(decide(12)).toEqual({ kind: 'refund' })
  })
  it('con 11 horas queda retenida', () => {
    expect(decide(11)).toEqual({ kind: 'retained', reason: 'late' })
  })
  it('con el turno ya empezado queda retenida', () => {
    expect(decide(-0.5)).toEqual({ kind: 'retained', reason: 'after_start' })
  })
  it('con política «ninguna» queda retenida aunque avise con tiempo', () => {
    expect(decide(30, { cancellationHours: 12, refundPolicy: 'none' })).toEqual({ kind: 'retained', reason: 'policy_none' })
  })
  it('sin seña paga no hay nada para devolver', () => {
    expect(decideRefund({ rule: RULE, cancelledBy: 'client', paid: false, hours: 30 })).toEqual({ kind: 'no_deposit' })
  })
  it('si no se pudo leer la política no se adivina el resultado', () => {
    expect(decide(30, null)).toEqual({ kind: 'unknown' })
  })
})

describe('decideRefund: cancela el estudio', () => {
  it('devuelve toda la seña sin mirar la hora ni la política', () => {
    const rule: RefundRule = { cancellationHours: 12, refundPolicy: 'none' }
    expect(decideRefund({ rule, cancelledBy: 'studio', paid: true, hours: -3 })).toEqual({ kind: 'refund' })
    expect(decideRefund({ rule: null, cancelledBy: 'studio', paid: true, hours: 1 })).toEqual({ kind: 'refund' })
  })
})

describe('textos del resultado', () => {
  it('personal: aviso con 13, 12 y 11 horas', () => {
    const text = (h: number) => {
      const hours = noticeHoursBefore(DATE, TIME, hoursBefore(h))
      return describeStaffOutcome(decideRefund({ rule: RULE, cancelledBy: 'client', paid: true, hours }), { cancelledBy: 'client', hours, rule: RULE })
    }
    expect(text(13)).toBe('Avisó con 13 h 0 min de anticipación: se devuelve la seña.')
    expect(text(12)).toBe('Avisó con 12 h 0 min de anticipación: se devuelve la seña.')
    expect(text(11)).toMatch(/^Avisó con 11 h 0 min de anticipación: la seña queda retenida\./)
  })
  it('personal: el estudio devuelve toda la seña y sin seña paga no hay nada que devolver', () => {
    const studio = describeStaffOutcome({ kind: 'refund' }, { cancelledBy: 'studio', hours: 0, rule: RULE })
    expect(studio).toBe('Se devuelve toda la seña.')
    expect(describeStaffOutcome({ kind: 'no_deposit' }, { cancelledBy: 'client', hours: 20, rule: RULE })).toBe('No hay seña paga para devolver.')
  })
  it('clienta: según las horas que faltan', () => {
    expect(describeClientOutcome({ kind: 'refund' }, { hours: 13, rule: RULE })).toBe('Faltan 13 h 0 min para el turno: se te devuelve la seña.')
    expect(describeClientOutcome({ kind: 'retained', reason: 'late' }, { hours: 11, rule: RULE })).toMatch(/Faltan 11 h 0 min.*plazo.*12 h.*queda retenida/)
    expect(describeClientOutcome({ kind: 'retained', reason: 'after_start' }, { hours: -1, rule: RULE })).toBe('El turno ya empezó: la seña queda retenida.')
  })
})

describe('hora de aviso en hora de Argentina', () => {
  it('convierte de ida y vuelta sin depender de la zona del navegador', () => {
    const at = new Date('2026-11-03T19:05:30Z') // 16:05 en Argentina
    expect(toArgentinaInput(at)).toBe('2026-11-03T16:05')
    expect(fromArgentinaInput('2026-11-03T16:05')?.toISOString()).toBe('2026-11-03T19:05:00.000Z')
    expect(fromArgentinaInput('')).toBeNull()
  })

  const now = new Date('2026-11-03T19:00:00Z')
  it('no admite horas futuras', () => {
    expect(checkNoticeTime({ noticeAt: new Date(now.getTime() + 60_000), now, role: 'admin' })).toBe('future')
    expect(checkNoticeTime({ noticeAt: now, now, role: 'admin' })).toBeNull()
  })
  it('la profesional no carga avisos de más de 48 horas; la administradora sí', () => {
    const exact = new Date(now.getTime() - 48 * 3_600_000)
    const old   = new Date(now.getTime() - 48 * 3_600_000 - 60_000)
    expect(checkNoticeTime({ noticeAt: exact, now, role: 'professional' })).toBeNull()
    expect(checkNoticeTime({ noticeAt: old, now, role: 'professional' })).toBe('too_old')
    expect(checkNoticeTime({ noticeAt: old, now, role: 'admin' })).toBeNull()
  })
  it('sin hora válida no se puede confirmar', () => {
    expect(checkNoticeTime({ noticeAt: null, now, role: 'admin' })).toBe('invalid')
  })
})
