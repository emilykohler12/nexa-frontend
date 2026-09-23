import { describe, it, expect } from 'vitest'
import { getAppointmentStatusDisplay } from './status.data'

describe('getAppointmentStatusDisplay', () => {
  it('devuelve el label/color normal para cada estado', () => {
    expect(getAppointmentStatusDisplay('confirmed').label).toBe('Confirmado')
    expect(getAppointmentStatusDisplay('finished').label).toBe('Finalizado')
    expect(getAppointmentStatusDisplay('noShow').label).toBe('No asistió')
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
})
