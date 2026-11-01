import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

// Son las 10:00 del 3/11/2026 en Argentina y el combo es ese mismo día a las 16:00 (faltan 6 h, el plazo es de 12 h).
const NOW = new Date('2026-11-03T10:00:00-03:00')

const appointment = (extra: Record<string, unknown> = {}) => ({
  id: 'a1', serviceId: 's1', serviceName: 'Corte', categoryId: 'cabello',
  professionalId: 'p1', professionalName: 'Lucía',
  date: '2026-11-03', time: '16:00', duration: 60, price: 10000, depositAmount: 3000,
  status: 'confirmed', paymentStatus: 'paid',
  ...extra,
})
type Appt = ReturnType<typeof appointment>

const combo = (): Appt[] => [
  appointment({ comboGroupId: 'g1' }),
  appointment({ id: 'a2', serviceName: 'Brushing', professionalName: 'Marta', comboGroupId: 'g1' }),
]

const patchCalls = () => vi.mocked(api.patch).mock.calls

async function openDetail(list: Appt[]) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/client/appointments') return Promise.resolve({ data: { appointments: list } }) as never
    if (url === '/api/business/payments/public') {
      return Promise.resolve({ data: { settings: { depositAmount: 3000, depositPercent: false, cancellationHours: 12, refundPolicy: 'full' } } }) as never
    }
    return Promise.resolve({ data: { pending: [] } }) as never
  })
  vi.mocked(api.patch).mockResolvedValue({ data: { refunded: false, partialCombo: true } } as never)
  const user = userEvent.setup()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><MemoryRouter><AppointmentsPage /></MemoryRouter></QueryClientProvider>)
  // Con las dos patas activas el combo es una sola fila; con una sola activa queda como un turno común.
  await user.click(await screen.findByText(/Simultáneo|^Corte$/))
  return user
}

describe('Mis turnos: cancelar un servicio suelto de un combo desde el detalle pide confirmación', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })
  afterEach(() => { vi.useRealTimers() })

  it('al tocar «Cancelar» de un servicio no se cancela: primero aparece la confirmación', async () => {
    const user = await openDetail(combo())

    await user.click(screen.getAllByRole('button', { name: 'Cancelar' })[1])

    expect(await screen.findByText('¿Cancelar este servicio?')).toBeInTheDocument()
    expect(screen.getByText(/Brushing con Marta\. Los demás servicios del combo siguen en pie/)).toBeInTheDocument()
    expect(patchCalls()).toHaveLength(0)
  })

  it('«Volver» deja todo como estaba', async () => {
    const user = await openDetail(combo())
    await user.click(screen.getAllByRole('button', { name: 'Cancelar' })[1])

    await user.click(await screen.findByRole('button', { name: 'Volver' }))

    expect(screen.queryByText('¿Cancelar este servicio?')).not.toBeInTheDocument()
    expect(patchCalls()).toHaveLength(0)
  })

  it('«Sí, cancelar» cancela solo ese servicio', async () => {
    const user = await openDetail(combo())
    await user.click(screen.getAllByRole('button', { name: 'Cancelar' })[1])

    await user.click(await screen.findByRole('button', { name: 'Sí, cancelar' }))

    await waitFor(() => expect(patchCalls()).toEqual([['/api/client/appointments/a2/cancel']]))
    await waitFor(() => expect(screen.queryByText('¿Cancelar este servicio?')).not.toBeInTheDocument())
  })

  it('si es el último servicio activo, avisa que se cancela el turno completo y muestra qué pasa con la seña', async () => {
    const [first, second] = combo()
    const user = await openDetail([first, { ...second, status: 'cancelled' }])

    // El primer «Cancelar» es el de la tarjeta (queda un solo servicio activo); el segundo, el del detalle.
    await user.click(screen.getAllByRole('button', { name: 'Cancelar' })[1])

    expect(await screen.findByText(/Es el último servicio del combo: al cancelarlo se cancela el turno completo/)).toBeInTheDocument()
    expect(await screen.findByText(/Faltan 6 h 0 min para el turno.*la seña queda retenida/)).toBeInTheDocument()
    expect(patchCalls()).toHaveLength(0)
  })
})
