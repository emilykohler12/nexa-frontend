import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppointmentDialog } from './AppointmentDialog'
import type { Appointment } from '@/features/professional/types/appointment'

vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
}))

const base: Appointment = {
  id: 'a1',
  client: { id: 'c1', name: 'Ana Pérez', phone: '3764000000', email: 'ana@test.local', photo: null, allergies: '', notes: '' },
  serviceName: 'Corte', servicePrice: 10000, duration: 60,
  date: '2030-11-03', time: '16:00',
  status: 'confirmed', paymentStatus: 'paid', arrivedAt: null,
  internalNotes: '', isSimultaneous: false,
}

function setup(appointment: Partial<Appointment>) {
  render(
    <AppointmentDialog
      appointment={{ ...base, ...appointment }} primary="#069494" accent="#d4af37"
      onClose={vi.fn()} onSave={vi.fn()}
      onChangeStatus={vi.fn().mockResolvedValue(null)} onCancel={vi.fn().mockResolvedValue(null)}
      onReschedule={vi.fn().mockResolvedValue(null)} onMarkDepositPaid={vi.fn().mockResolvedValue(null)}
    />,
  )
}

// R-27 (PM-09, 13/11/2026): la profesional tampoco puede finalizar un turno que todavía no empezó.
describe('PM-09 AppointmentDialog (profesional): finalizar antes de la hora de inicio', () => {
  it('PM-09 con un turno futuro, «Finalizado» está apagado', () => {
    setup({})
    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeDisabled()
  })

  it('PM-09 con un turno que ya empezó, «Finalizado» está habilitado', () => {
    setup({ date: '2020-11-03' })
    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeEnabled()
  })
})
