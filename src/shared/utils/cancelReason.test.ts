import { describe, it, expect } from 'vitest'
import { cancelReasonText } from './cancelReason'

describe('cancelReasonText (historial de la clienta, RF-26)', () => {
  it('unpaid_expired: se liberó por falta de pago', () => {
    expect(cancelReasonText('cancelled', 'unpaid_expired', 'system')).toBe('No se pagó la seña a tiempo: el turno se liberó solo')
  })

  it('user_cancelled: dice quién canceló', () => {
    expect(cancelReasonText('cancelled', 'user_cancelled', 'client')).toBe('Cancelado por la clienta')
    expect(cancelReasonText('cancelled', 'user_cancelled', 'studio')).toBe('Cancelado por el estudio')
    expect(cancelReasonText('cancelled', 'user_cancelled', 'system')).toBe('Cancelado automáticamente por el sistema')
    expect(cancelReasonText('cancelled', 'user_cancelled')).toBe('Cancelado a pedido de la clienta o del estudio')
  })

  it('las inasistencias tienen su texto', () => {
    expect(cancelReasonText('cancelled_no_show')).toBe('La clienta no se presentó al turno')
    expect(cancelReasonText('no_show_auto')).toMatch(/30 minutos/)
  })

  it('sin motivo, con texto libre y con un código desconocido', () => {
    expect(cancelReasonText('cancelled', null, null)).toBe('Sin motivo registrado')
    expect(cancelReasonText('cancelled', 'Se enfermó la clienta', null)).toBe('Se enfermó la clienta')
    expect(cancelReasonText('cancelled', 'some_new_code', null)).toBe('Cancelado (motivo no especificado)')
  })

  it('un turno realizado no tiene motivo', () => {
    expect(cancelReasonText('finished')).toBe('')
  })
})
