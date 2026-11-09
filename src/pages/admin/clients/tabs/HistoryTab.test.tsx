import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HistoryTab } from './HistoryTab'
import { api } from '@/shared/utils/api'
import type { AdminClient } from '../types'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn() } }))

const client = { id: 'c1' } as AdminClient
const row = (id: string, extra: Record<string, unknown>) => ({
  id, clientId: 'c1', service: 'Manicura', professional: 'Lucía', date: '2026-10-20', time: '10:00', price: 9000, status: 'cancelled', ...extra,
})

describe('HistoryTab (administrador): motivo de cancelación', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        history: [
          row('h1', { cancelReason: 'user_cancelled', cancelledBy: 'client' }),
          row('h2', { cancelReason: 'user_cancelled', cancelledBy: 'studio' }),
          row('h3', { cancelReason: 'unpaid_expired', cancelledBy: 'system' }),
          row('h4', { status: 'cancelled_no_show', cancelReason: null }),
          row('h5', { status: 'finished', cancelReason: null }),
        ],
      },
    } as never)
  })

  it('muestra un texto claro en español para cada motivo, sin códigos', async () => {
    render(<HistoryTab client={client} />)

    expect(await screen.findByText('Cancelado por la clienta')).toBeInTheDocument()
    expect(screen.getByText('Cancelado por el estudio')).toBeInTheDocument()
    expect(screen.getByText('No se pagó la seña a tiempo: el turno se liberó solo')).toBeInTheDocument()
    expect(screen.getByText('La clienta no se presentó al turno')).toBeInTheDocument()
    expect(screen.queryByText(/user_cancelled|unpaid_expired/)).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Motivo' })).toBeInTheDocument()
  })
})
