import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PaymentStep } from './PaymentStep'
import type { ConfirmedSummary } from './steps/ConfirmationStep'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({
    business: {
      primaryColor: '#069494',
      accentColor: '#d4af37',
      whatsapp: '',
      ubicacion: null,
      contactInfo: { address: 'Calle 123', phone: '', email: '', schedule: '' },
    },
  }),
}))

const SUMMARY: ConfirmedSummary = {
  serviceId: 'serv-1',
  categoryId: 'cat-1',
  professionalId: 'pro-1',
  date: '2099-03-10',
  serviceName: 'Corte',
  serviceDescription: '',
  professionalName: 'Ana',
  dateLabel: 'martes 10 de marzo',
  time: '10:00',
  price: 10000,
  originalPrice: null,
  depositAmount: 3000,
  promotionId: null,
}

// Error con la forma de uno de axios: lo único que se lee es status y data.{error,code}.
const apiError = (status: number, data: { error?: string; code?: string }) => ({ response: { status, data } })

function renderStep() {
  const onExpire = vi.fn()
  const onSuccess = vi.fn()
  render(
    <MemoryRouter>
      <PaymentStep summary={SUMMARY} onExpire={onExpire} onSuccess={onSuccess} />
    </MemoryRouter>,
  )
  return { onExpire, onSuccess, user: userEvent.setup() }
}

const payButton = () => screen.getByRole('button', { name: /^Pagar \$/ })

describe('PaymentStep', () => {
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // La pantalla de confirmación consulta los datos de la profesional (recomendaciones y políticas).
    vi.mocked(api.get).mockResolvedValue({ data: { professionals: [] } } as never)
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('muestra el monto de la seña', () => {
    renderStep()

    expect(payButton()).toHaveTextContent(`Pagar $${SUMMARY.depositAmount.toLocaleString('es-AR')}`)
  })

  it('no reserva si no se aceptaron los términos', async () => {
    const { user } = renderStep()

    await user.click(payButton())

    expect(await screen.findByText(/Tenés que aceptar los Términos/)).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('crea el turno, pide el checkout y abre Mercado Pago en una pestaña nueva', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { appointment: { id: 'turno-1' } } } as never)
      .mockResolvedValueOnce({ data: { checkoutUrl: 'https://mp.test/checkout' } } as never)
    const { user } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('Esperando la confirmación del pago')).toBeInTheDocument()
    expect(api.post).toHaveBeenNthCalledWith(1, '/api/client/appointments', {
      serviceId: 'serv-1',
      professionalId: 'pro-1',
      date: '2099-03-10',
      time: '10:00',
      termsAccepted: true,
      promotionId: null,
    })
    expect(api.post).toHaveBeenNthCalledWith(2, '/api/client/appointments/turno-1/payment')
    expect(openSpy).toHaveBeenCalledWith('https://mp.test/checkout', '_blank', 'noopener,noreferrer')
  })

  it('si el servidor no devuelve el id del turno pasa directo a la confirmación', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as never)
    const { user } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('¡Turno reservado!')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledTimes(1)
    expect(openSpy).not.toHaveBeenCalled()
  })

  it('409 PROFESSIONAL_SLOT_TAKEN: avisa que el horario se ocupó y permite elegir otro', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(apiError(409, { error: 'ocupado', code: 'PROFESSIONAL_SLOT_TAKEN' }))
    const { user, onExpire } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('Ese horario ya se ocupó')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Elegir otro horario' }))
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('400 OUT_OF_HOURS: avisa que el horario no está disponible y permite elegir otro', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      apiError(400, { error: 'Ese horario está fuera de la disponibilidad de la profesional. Elegí otro horario.', code: 'OUT_OF_HOURS' }),
    )
    const { user, onExpire } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('Ese horario no está disponible')).toBeInTheDocument()
    expect(screen.getByText(/fuera de la disponibilidad de la profesional/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Elegir otro horario' }))
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('otro error 4xx muestra el mensaje del servidor y deja volver a intentar', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(apiError(400, { error: 'Servicio no disponible', code: 'SERVICE_INACTIVE' }))
    const { user } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument()
    expect(payButton()).toBeEnabled()
  })

  it('un error 500 no muestra el texto técnico del servidor sino un mensaje genérico', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(apiError(500, { error: 'Invalid `prisma.appointment.create()` invocation' }))
    const { user } = renderStep()

    await user.click(screen.getByRole('checkbox'))
    await user.click(payButton())

    expect(await screen.findByText('No pudimos iniciar el pago. Intentá de nuevo.')).toBeInTheDocument()
    expect(screen.queryByText(/prisma/i)).not.toBeInTheDocument()
  })
})
