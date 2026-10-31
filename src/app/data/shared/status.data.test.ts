import { describe, it, expect } from 'vitest'
import { getAppointmentStatusDisplay } from './status.data'

describe('getAppointmentStatusDisplay', () => {
  it('devuelve el label/color normal para cada estado', () => {
    expect(getAppointmentStatusDisplay('confirmed').label).toBe('Confirmado')
    expect(getAppointmentStatusDisplay('finished').label).toBe('Finalizado')
    expect(getAppointmentStatusDisplay('noShow').label).toBe('No asistió')
  })

  // «Mis turnos» recibe el estado crudo del backend: antes 'cancelled_no_show' no estaba en el mapa.
  it('entiende los estados crudos del backend para la inasistencia', () => {
    expect(getAppointmentStatusDisplay('cancelled_no_show').label).toBe('No asistió')
    expect(getAppointmentStatusDisplay('no_show_auto').label).toBe('No asistió (automático)')
    expect(getAppointmentStatusDisplay('no_show_auto').color).not.toBe(getAppointmentStatusDisplay('cancelled_no_show').color)
  })

  it('la etiqueta statusLabel del backend manda sobre la del mapa', () => {
    expect(getAppointmentStatusDisplay('no_show_auto', null, 'no_show_auto', 'No asistió (automático)').label).toBe('No asistió (automático)')
    expect(getAppointmentStatusDisplay('finished', null, null, 'Etiqueta nueva').label).toBe('Etiqueta nueva')
  })

  it('un estado desconocido no rompe la pantalla', () => {
    expect(getAppointmentStatusDisplay('estado_nuevo').label).toBe('estado_nuevo')
  })

  it('un turno cancelado por falta de pago se muestra distinto de uno cancelado a mano', () => {
    const autoCancelled   = getAppointmentStatusDisplay('cancelled', 'unpaid_expired')
    const manualCancelled = getAppointmentStatusDisplay('cancelled', 'user_cancelled')

    expect(autoCancelled.label).toBe('No se pagó a tiempo')
    expect(manualCancelled.label).toBe('Cancelado')
    expect(autoCancelled.label).not.toBe(manualCancelled.label)
  })

  it('sin cancelReason, un cancelado se ve como "Cancelado" a secas', () => {
    expect(getAppointmentStatusDisplay('cancelled').label).toBe('Cancelado')
    expect(getAppointmentStatusDisplay('cancelled', null).label).toBe('Cancelado')
  })

  // RF-02 — confirmado con la seña sin pagar se muestra "Pendiente de seña".
  it('con displayStatus pending_deposit muestra "Pendiente de seña"', () => {
    expect(getAppointmentStatusDisplay('confirmed', null, 'pending_deposit').label).toBe('Pendiente de seña')
    expect(getAppointmentStatusDisplay('confirmed', null, 'confirmed').label).toBe('Confirmado')
  })
})
