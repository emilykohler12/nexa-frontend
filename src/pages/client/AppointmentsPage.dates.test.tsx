import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppointmentsPage } from './AppointmentsPage'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({
    business: {
      primaryColor: '#069494', accentColor: '#d4af37', whatsapp: '',
      policies: [], contactInfo: { address: 'Calle 123', phone: '', email: '', schedule: '' },
    },
  }),
}))
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Ana Pérez', role: 'client' } }),
  isFirstVisit: () => false,
}))

const appointment = (extra: Record<string, unknown> = {}) => ({
  id: 'a1', serviceId: 's1', serviceName: 'Corte', categoryId: 'cabello',
  professionalId: 'p1', professionalName: 'Lucía',
  date: '2026-11-03', time: '16:00', duration: 60, price: 10000, depositAmount: 3000,
  status: 'confirmed', paymentStatus: 'paid',
  ...extra,
})

function renderAt(now: string, list: ReturnType<typeof appointment>[]) {
  vi.setSystemTime(new Date(now))
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/client/appointments') return Promise.resolve({ data: { appointments: list } }) as never
    return Promise.resolve({ data: { pending: [] } }) as never
  })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter><AppointmentsPage /></MemoryRouter></QueryClientProvider>)
}

describe('Mis turnos: «hoy» es el día de Argentina (cerca de las 21:00)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
  })
  afterEach(() => { vi.useRealTimers() })

  it('a las 21:30 de Argentina (00:30 UTC del día siguiente) «Ya llegué» sigue disponible para un turno de hoy', async () => {
    renderAt('2026-11-03T21:30:00-03:00', [appointment({ time: '22:00' })])

    expect(await screen.findByRole('button', { name: 'Ya llegué' })).toBeInTheDocument()
  })

  it('a las 21:30 de Argentina un turno de mañana no ofrece «Ya llegué»', async () => {
    renderAt('2026-11-03T21:30:00-03:00', [appointment({ date: '2026-11-04', time: '10:00' })])

    expect(await screen.findByText('Corte')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ya llegué' })).not.toBeInTheDocument()
  })

  it('un turno de hoy a las 22:00 sigue en «Próximos» a las 21:30', async () => {
    renderAt('2026-11-03T21:30:00-03:00', [appointment({ time: '22:00' })])

    expect(await screen.findByText('Corte')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reprogramar' })).toBeInTheDocument()
  })
})
