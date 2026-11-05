import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpecialServiceBookingFlow } from './SpecialServiceBookingFlow'
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
// El paso de detalles post-reserva no es lo que se prueba acá.
vi.mock('./PostBookingDetails', () => ({
  PostBookingDetails: () => <div>Detalles post reserva</div>,
}))

const service: Service = {
  id: 'svc-especial', name: 'Depilación definitiva', categoryId: 'cuerpo', description: '',
  duration: 0, price: 0, image: null, status: 'active', isSpecial: true, specialDate: '2099-03-10',
  zones: [{ id: 'z1', name: 'Axilas', duration: 30, price: 20000, active: true }],
  packages: [],
  specialSlots: [{ id: 's1', time: '10:00', professionalId: 'p1', professionalName: 'Ana', active: true }],
}

async function reachConfirm(user: ReturnType<typeof userEvent.setup>) {
  render(<SpecialServiceBookingFlow service={service} onBack={vi.fn()} onSuccess={vi.fn()} />)
  await user.click(await screen.findByRole('button', { name: /Axilas/ }))
  await user.click(screen.getByRole('button', { name: 'Siguiente' }))
  await user.click(await screen.findByRole('button', { name: /10:00/ }))
  await user.click(screen.getByRole('button', { name: 'Siguiente' }))
  await screen.findByText('Confirmá tu reserva')
}

function mockApi(opts: { deposit: number; verify?: string }) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/business/payments/public') return Promise.resolve({ data: { settings: { depositAmount: opts.deposit, depositPercent: false } } }) as never
    return Promise.resolve({ data: { services: [service] } }) as never
  })
  vi.mocked(api.post).mockImplementation((url: string) => {
    if (url === '/api/client/appointments/special') return Promise.resolve({ data: { appointment: { id: 'a1', depositAmount: opts.deposit, paymentStatus: 'pending' } } }) as never
    if (url === '/api/client/appointments/a1/payment') return Promise.resolve({ data: { checkoutUrl: 'https://mp.test/checkout' } }) as never
    if (url === '/api/client/appointments/a1/verify-payment') return Promise.resolve({ data: { paymentStatus: opts.verify ?? 'pending' } }) as never
    return Promise.reject(new Error(`url inesperada ${url}`))
  })
}

// RF-03 y RF-17: la reserva de un servicio especial tiene que cobrar la seña de verdad.
describe('SpecialServiceBookingFlow: pago de la seña', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'open').mockReturnValue(null)
  })
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

  it('después de reservar abre el checkout de Mercado Pago y espera el pago, sin dar el turno por pagado', async () => {
    mockApi({ deposit: 5000 })
    const user = userEvent.setup()
    await reachConfirm(user)

    await user.click(screen.getByRole('button', { name: /Pagar seña/ }))

    expect(await screen.findByText('Esperando la confirmación del pago')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/api/client/appointments/a1/payment')
    expect(window.open).toHaveBeenCalledWith('https://mp.test/checkout', '_blank', 'noopener,noreferrer')
    expect(screen.queryByText('Detalles post reserva')).not.toBeInTheDocument()
  })

  it('«Ya pagué, verificar» avanza solo cuando el backend informa la seña paga', async () => {
    mockApi({ deposit: 5000, verify: 'pending' })
    const user = userEvent.setup()
    await reachConfirm(user)
    await user.click(screen.getByRole('button', { name: /Pagar seña/ }))
    await screen.findByText('Esperando la confirmación del pago')

    await user.click(screen.getByRole('button', { name: /Ya pagué, verificar/ }))
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/client/appointments/a1/verify-payment'))
    expect(screen.queryByText('Detalles post reserva')).not.toBeInTheDocument()

    mockApi({ deposit: 5000, verify: 'partial' })
    await user.click(screen.getByRole('button', { name: /Ya pagué, verificar/ }))
    expect(await screen.findByText('Detalles post reserva')).toBeInTheDocument()
  })

  it('si no se paga en 15 minutos avisa que se liberó el horario', async () => {
    mockApi({ deposit: 5000 })
    const user = userEvent.setup()
    await reachConfirm(user)
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await user.click(screen.getByRole('button', { name: /Pagar seña/ }))
    await screen.findByText('Esperando la confirmación del pago')

    await act(async () => { await vi.advanceTimersByTimeAsync(15 * 60 * 1000 + 2000) })
    expect(await screen.findByText('Se acabó el tiempo')).toBeInTheDocument()
  })

  it('sin seña que pagar sigue directo a los detalles y no abre Mercado Pago', async () => {
    mockApi({ deposit: 0 })
    const user = userEvent.setup()
    await reachConfirm(user)

    await user.click(screen.getByRole('button', { name: /Pagar seña/ }))

    expect(await screen.findByText('Detalles post reserva')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalledWith('/api/client/appointments/a1/payment')
    expect(window.open).not.toHaveBeenCalled()
  })
})
