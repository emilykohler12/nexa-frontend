import { describe, it, expect, vi, beforeEach } from 'vitest'
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

  it('un estado desconocido del servidor no rompe la pantalla', async () => {
    mockAppointments([appointment({ status: 'estado_nuevo' })])
    const user = userEvent.setup()
    render(<MemoryRouter><AppointmentsPage /></MemoryRouter>)

    expect(await screen.findByRole('button', { name: 'Historial' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Historial' }))
  })
})
