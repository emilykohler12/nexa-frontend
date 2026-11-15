import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppointmentModal } from './AppointmentModal'
import type { Appointment, Professional } from './types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn(), patch: vi.fn() },
}))
vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
}))

const professionals: Professional[] = [{ id: 'p1', name: 'Lucía', color: '#069494' }]
const base: Appointment = {
  id: 'a1', title: 'Ana Pérez', clientName: 'Ana Pérez', clientPhone: '3764000000', clientEmail: 'ana@test.local',
  professionalId: 'p1', professionalName: 'Lucía', serviceId: 's1', serviceName: 'Corte',
  serviceDuration: 60, servicePrice: 10000,
  start: '2030-11-03T16:00:00', end: '2030-11-03T17:00:00',
  status: 'confirmed', paymentStatus: 'paid',
}

function setup(appointment: Appointment) {
  render(
    <AppointmentModal
      appointment={appointment} professionals={professionals} onClose={vi.fn()}
      onCancel={vi.fn().mockResolvedValue(null)} onReactivate={vi.fn().mockResolvedValue(null)}
      onSave={vi.fn().mockResolvedValue(null)} onRegisterBalancePayment={vi.fn().mockResolvedValue(null)}
      onRegisterPolishRemoval={vi.fn().mockResolvedValue(null)} onMarkDepositPaid={vi.fn().mockResolvedValue(null)}
      onChangeStatus={vi.fn().mockResolvedValue(null)}
    />,
  )
}

// R-27 (PM-09, 13/11/2026): no se puede finalizar un turno que todavía no empezó.
describe('PM-09 AppointmentModal (administrador): finalizar antes de la hora de inicio', () => {
  it('PM-09 con un turno futuro, «Marcar finalizado» está apagado', () => {
    setup(base)
    expect(screen.getByRole('button', { name: 'Marcar finalizado' })).toBeDisabled()
  })

  it('PM-09 con un turno que ya empezó, «Marcar finalizado» está habilitado', () => {
    setup({ ...base, start: '2020-11-03T16:00:00', end: '2020-11-03T17:00:00' })
    expect(screen.getByRole('button', { name: 'Marcar finalizado' })).toBeEnabled()
  })
})
