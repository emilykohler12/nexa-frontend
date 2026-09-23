import { describe, it, expect } from 'vitest'
import { getAppointmentStatusConfig } from './appointmentStatus'

describe('getAppointmentStatusConfig (vista de la profesional)', () => {
  it('devuelve el label normal para cada estado', () => {
    expect(getAppointmentStatusConfig('confirmed').label).toBe('Confirmado')
    expect(getAppointmentStatusConfig('no_show').label).toBe('No asistió')
    expect(getAppointmentStatusConfig('finished').label).toBe('Finalizado')
  })

  it('un turno cancelado por falta de pago no se ve como si lo hubiera cancelado alguien', () => {
    const config = getAppointmentStatusConfig('cancelled', 'unpaid_expired')
    expect(config.label).toBe('No se pagó a tiempo')
  })

  it('un turno cancelado a mano se ve como "Cancelado"', () => {
    const config = getAppointmentStatusConfig('cancelled', 'user_cancelled')
    expect(config.label).toBe('Cancelado')
  })
})
