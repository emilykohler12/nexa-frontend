import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentsToRefundCard } from './PaymentsToRefundCard'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { patch: vi.fn() } }))

const rows = [
  { id: 'p1', outcome: 'underpaid' as const, reason: 'Monto menor a la seña', paidAmount: 1000, expectedAmount: 5000, currency: 'ARS',
    receivedAt: '2026-11-22T20:00:00Z', clientName: 'Ana Pérez', label: 'Manicura', date: '2026-11-25', time: '10:00' },
  { id: 'p2', outcome: 'late' as const, reason: 'Llegó después de que se liberó el turno', paidAmount: 5000, expectedAmount: 5000, currency: 'ARS',
    receivedAt: '2026-11-22T21:00:00Z', clientName: 'Lucía Gómez', label: 'Corte', date: null, time: null },
]

beforeEach(() => { vi.clearAllMocks() })

describe('Pagos para devolver (Mercado Pago)', () => {
  it('muestra cada pago con la clienta, el motivo y el monto', () => {
    render(<PaymentsToRefundCard data={rows} onRefunded={vi.fn()} />)

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Monto menor a la seña')).toBeInTheDocument()
    expect(screen.getByText(/Manicura · 25\/11\/2026 10:00/)).toBeInTheDocument()
    expect(screen.getByText('Llegó después de que se liberó el turno')).toBeInTheDocument()
  })

  it('sin pagos pendientes lo dice', () => {
    render(<PaymentsToRefundCard data={[]} onRefunded={vi.fn()} />)
    expect(screen.getByText('No hay pagos pendientes de devolver')).toBeInTheDocument()
  })

  it('«Marcar devuelto» llama al backend y avisa para sacarlo de la lista', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} } as never)
    const onRefunded = vi.fn()
    render(<PaymentsToRefundCard data={rows} onRefunded={onRefunded} />)

    await userEvent.click(screen.getByRole('button', { name: 'Marcar devuelto el pago de Ana Pérez' }))

    expect(api.patch).toHaveBeenCalledWith('/api/admin/payments/p1/refund-done')
    expect(onRefunded).toHaveBeenCalledWith('p1')
  })

  it('si falla muestra el error y no lo saca', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('x'))
    const onRefunded = vi.fn()
    render(<PaymentsToRefundCard data={rows} onRefunded={onRefunded} />)

    await userEvent.click(screen.getByRole('button', { name: 'Marcar devuelto el pago de Ana Pérez' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(onRefunded).not.toHaveBeenCalled()
  })
})
