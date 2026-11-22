import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PendingRefundsChart } from './PendingRefundsChart'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { patch: vi.fn() } }))

const rows = [
  { appointmentId: 'a1', clientName: 'Ana Pérez',  serviceName: 'Corte',    date: '2026-11-25', time: '10:00', amount: 3000 },
  { appointmentId: 'a2', clientName: 'Lucía Gómez', serviceName: 'Brushing', date: '2026-11-26', time: '16:30', amount: 5000 },
]

beforeEach(() => { vi.clearAllMocks() })

describe('Señas por devolver (Mercado Pago)', () => {
  it('muestra el total y cada clienta con su monto y la fecha en día/mes/año', () => {
    render(<PendingRefundsChart data={rows} onRefunded={vi.fn()} />)

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.getByText(/Corte · 25\/11\/2026 10:00/)).toBeInTheDocument()
    expect(screen.getByText(/a 2 clientas/)).toBeInTheDocument()
  })

  it('sin señas pendientes lo dice', () => {
    render(<PendingRefundsChart data={[]} onRefunded={vi.fn()} />)

    expect(screen.getByText('No hay señas pendientes de devolver')).toBeInTheDocument()
  })

  it('«Marcar devuelta» llama al backend y avisa para sacarla de la lista', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} } as never)
    const onRefunded = vi.fn()
    render(<PendingRefundsChart data={rows} onRefunded={onRefunded} />)

    await userEvent.click(screen.getByRole('button', { name: 'Marcar devuelta la seña de Ana Pérez' }))

    expect(api.patch).toHaveBeenCalledWith('/api/admin/appointments/a1/refund-done')
    expect(onRefunded).toHaveBeenCalledWith('a1')
  })

  it('si falla muestra el error y no la saca', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('x'))
    const onRefunded = vi.fn()
    render(<PendingRefundsChart data={rows} onRefunded={onRefunded} />)

    await userEvent.click(screen.getByRole('button', { name: 'Marcar devuelta la seña de Ana Pérez' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(onRefunded).not.toHaveBeenCalled()
  })
})
