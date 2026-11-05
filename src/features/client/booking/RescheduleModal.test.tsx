import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RescheduleModal } from './RescheduleModal'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494' } }),
}))
// Servicio y profesional ya vienen elegidos: lo que se prueba acá es el paso de fecha y hora.
vi.mock('./steps/ServiceStep', () => ({ ServiceStep: () => null }))
vi.mock('./steps/ProviderStep', () => ({ ProviderStep: () => null, ANY_PROFESSIONAL_ID: 'any' }))

const DATE = '2099-03-10'
const BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5][new Date(`${DATE}T00:00:00`).getDay()]
const apiError = (status: number, data: { error?: string; code?: string }) => ({ response: { status, data } })

const availabilityBody = (extra: Record<string, unknown> = {}) => ({
  data: {
    availability: [{ dayOfWeek: BACKEND_DAY, startTime: '08:00', endTime: '20:00' }],
    earliestStart: '00:00',
    reopenedStarts: ['16:45', '16:50'],
    ...extra,
  },
})

function setup() {
  const onSuccess = vi.fn()
  render(
    <RescheduleModal
      appointmentId="a1" initialServiceId="s1" initialProfessionalId="p1"
      initialDate={DATE} initialTime="" onClose={vi.fn()} onSuccess={onSuccess}
    />,
  )
  return { onSuccess, user: userEvent.setup() }
}

const confirmBtn = () => screen.getByRole('button', { name: 'Confirmar cambios' })

describe('RescheduleModal: horarios del servidor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue(availabilityBody() as never)
  })

  it('pide los horarios del servicio y ofrece los de último momento con su etiqueta', async () => {
    setup()

    const group = await screen.findByRole('group', { name: 'Horario de último momento' })
    expect(within(group).getByRole('button', { name: '16:45' })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/api/professional/p1/availability', { params: { date: DATE, serviceId: 's1' } })
  })

  it('reprograma a un horario de último momento', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { appointment: { id: 'a1' } } } as never)
    const { user, onSuccess } = setup()

    await user.click(within(await screen.findByRole('group', { name: 'Horario de último momento' })).getByRole('button', { name: '16:45' }))
    await user.click(confirmBtn())

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 'a1' }))
    expect(api.patch).toHaveBeenCalledWith('/api/client/appointments/a1/reschedule', {
      serviceId: 's1', professionalId: 'p1', date: DATE, time: '16:45',
    })
  })

  it('si el horario reabierto ya cerró (REOPENED_SLOT_CLOSED) avisa, limpia la elección y vuelve a pedir los horarios', async () => {
    vi.mocked(api.patch).mockRejectedValue(apiError(409, { error: 'texto del servidor', code: 'REOPENED_SLOT_CLOSED' }))
    const { user, onSuccess } = setup()

    await user.click(within(await screen.findByRole('group', { name: 'Horario de último momento' })).getByRole('button', { name: '16:50' }))
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1)
    await user.click(confirmBtn())

    expect(await screen.findByText('Ese horario de último momento ya cerró. Elegí otro horario.')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
    await waitFor(() => expect(vi.mocked(api.get)).toHaveBeenCalledTimes(2))
    expect(confirmBtn()).toBeDisabled()
  })

  it('si el servicio no entra (SERVICE_DOES_NOT_FIT) explica por qué y pide elegir otro', async () => {
    vi.mocked(api.patch).mockRejectedValue(apiError(409, { error: 'x', code: 'SERVICE_DOES_NOT_FIT' }))
    const { user } = setup()

    await user.click(within(await screen.findByRole('group', { name: 'Horario de último momento' })).getByRole('button', { name: '16:45' }))
    await user.click(confirmBtn())

    expect(await screen.findByText(/El servicio no entra en ese horario/)).toBeInTheDocument()
    await waitFor(() => expect(confirmBtn()).toBeDisabled())
  })

  it('si el turno figura como «No asistió» y el servidor no deja reprogramarlo, muestra qué hacer', async () => {
    vi.mocked(api.patch).mockRejectedValue(apiError(400, { error: 'x', code: 'INVALID_STATUS_TRANSITION' }))
    const { user } = setup()

    await user.click(within(await screen.findByRole('group', { name: 'Horario de último momento' })).getByRole('button', { name: '16:45' }))
    await user.click(confirmBtn())

    expect(await screen.findByText(/corregí primero su estado/)).toBeInTheDocument()
  })
})
