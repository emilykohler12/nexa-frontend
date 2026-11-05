import { describe, it, expect } from 'vitest'
import { getAppointmentStatusConfig } from './appointmentStatus'

describe('getAppointmentStatusConfig (vista de la profesional)', () => {
  it('devuelve el label normal para cada estado', () => {
    expect(getAppointmentStatusConfig('confirmed').label).toBe('Confirmado')
    expect(getAppointmentStatusConfig('cancelled_no_show').label).toBe('No asistió')
    expect(getAppointmentStatusConfig('finished').label).toBe('Finalizado')
  })

  it('no_show_auto se distingue de la inasistencia marcada por el personal', () => {
    const auto = getAppointmentStatusConfig('no_show_auto')
    const manual = getAppointmentStatusConfig('cancelled_no_show')
    expect(auto.label).toBe('No asistió (automático)')
    expect(auto.label).not.toBe(manual.label)
    expect(auto.color).not.toBe(manual.color)
  })

  it('la etiqueta statusLabel del backend manda sobre la del mapa', () => {
    expect(getAppointmentStatusConfig('no_show_auto', null, 'no_show_auto', 'No asistió (automático)').label).toBe('No asistió (automático)')
    expect(getAppointmentStatusConfig('confirmed', null, null, 'Etiqueta nueva').label).toBe('Etiqueta nueva')
    expect(getAppointmentStatusConfig('confirmed', null, 'pending_deposit', 'Pendiente de seña').label).toBe('Pendiente de seña')
  })

  it('un cancelado por falta de pago conserva su etiqueta aunque venga statusLabel', () => {
    expect(getAppointmentStatusConfig('cancelled', 'unpaid_expired', null, 'Cancelado').label).toBe('No se pagó a tiempo')
  })

  it('un estado desconocido no rompe la agenda: muestra el valor tal cual', () => {
    expect(getAppointmentStatusConfig('estado_nuevo' as never).label).toBe('estado_nuevo')
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
