import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentModal } from './AppointmentModal'
import type { Appointment, Professional } from './types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn(), patch: vi.fn() },
}))
vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
}))

const professionals: Professional[] = [{ id: 'p1', name: 'Lucía', color: '#069494' }]
const appointment: Appointment = {
  id: 'a1', title: 'Ana Pérez', clientName: 'Ana Pérez', clientPhone: '3764000000', clientEmail: 'ana@test.local',
  professionalId: 'p1', professionalName: 'Lucía', serviceId: 's1', serviceName: 'Corte',
  serviceDuration: 60, servicePrice: 10000,
  start: '2030-11-03T16:00:00', end: '2030-11-03T17:00:00',
  status: 'confirmed', paymentStatus: 'paid',
}

function setup() {
  const onClose = vi.fn()
  const { container } = render(
    <AppointmentModal
      appointment={appointment} professionals={professionals} onClose={onClose}
      onCancel={vi.fn().mockResolvedValue(null)} onReactivate={vi.fn().mockResolvedValue(null)}
      onSave={vi.fn().mockResolvedValue(null)} onRegisterBalancePayment={vi.fn().mockResolvedValue(null)}
      onRegisterPolishRemoval={vi.fn().mockResolvedValue(null)} onMarkDepositPaid={vi.fn().mockResolvedValue(null)}
      onChangeStatus={vi.fn().mockResolvedValue(null)}
    />,
  )
  return { onClose, backdrop: container.firstElementChild as HTMLElement }
}

describe('AppointmentModal (administrador): cierre del formulario', () => {
  it('tocar fuera del formulario NO lo cierra', async () => {
    const { onClose, backdrop } = setup()
    await userEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('la cruz de arriba lo cierra', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
