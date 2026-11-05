import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
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
      policies: {}, contactInfo: { address: 'Calle 123', phone: '', email: '', schedule: '' },
    },
  }),
}))
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Ana Pérez' } }),
  isFirstVisit: () => false,
}))

const NOTICE = /No se puede cancelar ni reprogramar/

const appointment = (extra: Record<string, unknown>) => ({
  id: 'a1', serviceId: 's1', serviceName: 'Corte', categoryId: 'cabello',
  professionalId: 'p1', professionalName: 'Lucía',
  date: '2020-01-10', time: '16:00', duration: 60, price: 10000, depositAmount: 3000,
  status: 'confirmed', paymentStatus: 'paid',
  ...extra,
})

function mockAppointments(list: ReturnType<typeof appointment>[]) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/client/appointments') return Promise.resolve({ data: { appointments: list } }) as never
    return Promise.resolve({ data: { pending: [] } }) as never
  })
}

async function openHistory() {
  const user = userEvent.setup()
  render(<MemoryRouter><AppointmentsPage /></MemoryRouter>)
  await user.click(await screen.findByRole('button', { name: 'Historial' }))
  return user
}

describe('Mis turnos: turnos que figuran como «No asistió»', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('un turno «No asistió (automático)» aparece en el Historial con su etiqueta', async () => {
    mockAppointments([appointment({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })])
    await openHistory()

    expect(await screen.findByText('Corte')).toBeInTheDocument()
    expect(screen.getByText('No asistió (automático)')).toBeInTheDocument()
  })

  it('no se puede cancelar ni reprogramar: no hay botones y se explica por qué', async () => {
    mockAppointments([appointment({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })])
    await openHistory()

    expect(await screen.findByText(NOTICE)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reprogramar/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Si viniste, avisale al estudio/)).toBeInTheDocument()
  })

  it('al abrir el detalle del turno repite el mensaje', async () => {
    mockAppointments([appointment({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })])
    const user = await openHistory()

    await user.click(await screen.findByText('Corte'))

    expect(await screen.findAllByText(NOTICE)).toHaveLength(2)
  })

  it('un turno «No asistió» marcado por el personal se ve en el Historial, sin el aviso de corrección', async () => {
    mockAppointments([appointment({ status: 'cancelled_no_show', statusLabel: 'No asistió' })])
    await openHistory()

    expect(await screen.findByText('No asistió')).toBeInTheDocument()
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar/ })).not.toBeInTheDocument()
  })

  describe('cancelar: resultado de la seña antes de confirmar', () => {
    const START = new Date('2026-11-03T16:00:00-03:00')
    const hoursBefore = (h: number) => new Date(START.getTime() - h * 3_600_000)

    // Mis turnos usa Date.now() para decidir qué es «próximo»: se fija la hora y se dejan correr los timers reales.
    function mockWithRules(list: ReturnType<typeof appointment>[], rules = { cancellationHours: 12, refundPolicy: 'full' }) {
      vi.mocked(api.get).mockImplementation((url: string) => {
        if (url === '/api/client/appointments') return Promise.resolve({ data: { appointments: list } }) as never
        if (url === '/api/business/payments/public') return Promise.resolve({ data: { settings: { depositAmount: 3000, depositPercent: false, ...rules } } }) as never
        return Promise.resolve({ data: { pending: [] } }) as never
      })
    }

    async function openCancel(at: Date, extra: Record<string, unknown> = {}, tab?: 'Historial') {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(at)
      mockWithRules([appointment({ date: '2026-11-03', time: '16:00', ...extra })])
      const user = userEvent.setup()
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      render(<QueryClientProvider client={client}><MemoryRouter><AppointmentsPage /></MemoryRouter></QueryClientProvider>)
      if (tab) await user.click(await screen.findByRole('button', { name: tab }))
      await user.click(await screen.findByRole('button', { name: /^Cancelar$/ }))
      return user
    }

    afterEach(() => { vi.useRealTimers() })

    it('con 13 horas de anticipación dice que se devuelve la seña y que el dinero se devuelve por fuera', async () => {
      await openCancel(hoursBefore(13))

      expect(await screen.findByText('Faltan 13 h 0 min para el turno: se te devuelve la seña.')).toBeInTheDocument()
      expect(screen.getByText(/se devuelve por fuera de la aplicación/)).toBeInTheDocument()
    })

    it('con 11 horas dice que la seña queda retenida', async () => {
      await openCancel(hoursBefore(11))

      expect(await screen.findByText(/Faltan 11 h 0 min para el turno y el plazo para recuperar la seña es de 12 h: la seña queda retenida\./)).toBeInTheDocument()
    })

    it('se puede cancelar con el turno ya empezado: la seña queda retenida', async () => {
      // Un turno que ya empezó figura en «Historial» pero se puede cancelar igual.
      await openCancel(new Date(START.getTime() + 10 * 60_000), {}, 'Historial')

      expect(await screen.findByText('El turno ya empezó: la seña queda retenida.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sí, cancelar' })).toBeEnabled()
      expect(screen.queryByRole('button', { name: /Reprogramar/ })).not.toBeInTheDocument()
    })

    it('sin seña paga no hay nada para devolver', async () => {
      await openCancel(hoursBefore(30), { paymentStatus: 'pending' })

      expect(await screen.findByText(/no tiene seña paga, así que no hay nada para devolver/)).toBeInTheDocument()
    })
  })

  it('un estado desconocido del servidor no rompe la pantalla', async () => {
    mockAppointments([appointment({ status: 'estado_nuevo' })])
    const user = userEvent.setup()
    render(<MemoryRouter><AppointmentsPage /></MemoryRouter>)

    expect(await screen.findByRole('button', { name: 'Historial' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Historial' }))
  })
})
