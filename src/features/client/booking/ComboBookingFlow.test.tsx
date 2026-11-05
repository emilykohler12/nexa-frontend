import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComboBookingFlow } from './ComboBookingFlow'
import type { Service } from './steps/ServiceStep'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({
    business: {
      primaryColor: '#069494', accentColor: '#d4af37', whatsapp: '',
      ubicacion: null, contactInfo: { address: '', phone: '', email: '', schedule: '' },
    },
  }),
}))

// Fecha lejana: nunca es "hoy" para el servidor de la prueba.
const DATE = '2099-03-10'
const BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5][new Date(`${DATE}T00:00:00`).getDay()]

const combo: Service = {
  id: 'combo-1', name: 'Manos y pies', categoryId: 'unas', description: '', duration: 120, price: 20000,
  image: null, status: 'active', isCombo: true, simultaneous: true, comboServiceIds: ['s-manos', 's-pies'],
}

const services = [
  { id: 's-manos', name: 'Manos', categoryId: 'unas', description: '', duration: 60, price: 10000 },
  { id: 's-pies', name: 'Pies', categoryId: 'unas', description: '', duration: 60, price: 10000 },
]

// Cada servicio lo hace una sola profesional, así la asignación es la única opción.
const professionalsFor: Record<string, { id: string; name: string; photo: null }[]> = {
  's-manos': [{ id: 'p-ana', name: 'Ana', photo: null }],
  's-pies':  [{ id: 'p-bea', name: 'Bea', photo: null }],
}

type Availability = { earliestStart?: string | null; reopenedStarts?: string[] }

function mockApi(byProfessional: Record<string, Availability>) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/services') return Promise.resolve({ data: { services } }) as never
    if (url === '/api/business/payments/public') return Promise.resolve({ data: { settings: { depositAmount: 30, depositPercent: true } } }) as never
    if (url.startsWith('/api/professional/public')) {
      const serviceId = decodeURIComponent(url.split('serviceId=')[1] ?? '')
      return Promise.resolve({ data: { professionals: professionalsFor[serviceId] ?? [] } }) as never
    }
    const proId = url.split('/')[3]
    return Promise.resolve({
      data: {
        availability: [{ dayOfWeek: BACKEND_DAY, startTime: '08:00', endTime: '20:00' }],
        bookedTimes: [],
        earliestStart: '00:00',
        reopenedStarts: [],
        ...byProfessional[proId],
      },
    }) as never
  })
}

async function reachDateStep(user: ReturnType<typeof userEvent.setup>) {
  render(<ComboBookingFlow combo={combo} onBack={vi.fn()} onSuccess={vi.fn()} />)
  // El nombre accesible del botón incluye la inicial del avatar ("AAna").
  await user.click(await screen.findByRole('button', { name: /Ana$/ }))
  await user.click(await screen.findByRole('button', { name: /Bea$/ }))
  await user.click(screen.getByRole('button', { name: 'Siguiente' }))
  await screen.findByText('¿Cuándo?')
  return document.querySelector('input[type="date"]') as HTMLInputElement
}

describe('ComboBookingFlow: horarios del servidor', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { vi.useRealTimers() })

  it('pide los horarios de cada profesional con el servicio de su parte del combo', async () => {
    mockApi({})
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)

    fireEvent.change(dateInput, { target: { value: DATE } })

    await screen.findByRole('button', { name: '08:00' })
    expect(api.get).toHaveBeenCalledWith('/api/professional/p-ana/availability', { params: { date: DATE, serviceId: 's-manos' } })
    expect(api.get).toHaveBeenCalledWith('/api/professional/p-bea/availability', { params: { date: DATE, serviceId: 's-pies' } })
  })

  it('no filtra con el reloj del navegador: a las 23:30 UTC un día futuro conserva sus horarios', async () => {
    mockApi({})
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)
    // Con el reloj del navegador, "hoy" en UTC sería el 10/03/2099 y se ocultarían los horarios de la mañana.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2099-03-10T23:30:00Z'))

    fireEvent.change(dateInput, { target: { value: DATE } })

    expect(await screen.findByRole('button', { name: '08:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10:00' })).toBeInTheDocument()
  })

  it('respeta earliestStart de las dos profesionales: queda el más tardío', async () => {
    mockApi({ 'p-ana': { earliestStart: '12:00' }, 'p-bea': { earliestStart: '14:00' } })
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)

    fireEvent.change(dateInput, { target: { value: DATE } })

    expect(await screen.findByRole('button', { name: '14:00' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '12:00' })).not.toBeInTheDocument()
  })

  it('ofrece con la etiqueta «Horario de último momento» solo el horario reabierto que sirve a las dos', async () => {
    mockApi({
      'p-ana': { reopenedStarts: ['16:45', '16:50'] },
      'p-bea': { reopenedStarts: ['16:45'] },
    })
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)

    fireEvent.change(dateInput, { target: { value: DATE } })

    const group = await screen.findByRole('group', { name: 'Horario de último momento' })
    expect(within(group).getByRole('button', { name: '16:45' })).toBeInTheDocument()
    expect(within(group).queryByRole('button', { name: '16:50' })).not.toBeInTheDocument()
  })

  it('con un horario de último momento elegido se puede seguir al siguiente paso', async () => {
    mockApi({ 'p-ana': { reopenedStarts: ['16:45'] }, 'p-bea': { reopenedStarts: ['16:45'] } })
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)

    fireEvent.change(dateInput, { target: { value: DATE } })
    const group = await screen.findByRole('group', { name: 'Horario de último momento' })
    await user.click(within(group).getByRole('button', { name: '16:45' }))

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()
  })

  it('si la fecha ya pasó según el servidor lo dice', async () => {
    mockApi({ 'p-ana': { earliestStart: null }, 'p-bea': { earliestStart: null } })
    const user = userEvent.setup()
    const dateInput = await reachDateStep(user)

    fireEvent.change(dateInput, { target: { value: DATE } })

    expect(await screen.findByText('Esa fecha ya pasó. Elegí otra fecha.')).toBeInTheDocument()
  })
})
