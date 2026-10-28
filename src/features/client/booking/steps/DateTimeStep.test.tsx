import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTimeStep } from './DateTimeStep'
import { ANY_PROFESSIONAL_ID } from './ProviderStep'
import { generateSlots } from '@/features/professional/onboarding/types'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494' } }),
}))

// Fecha lejana: nunca es "hoy", así los horarios no se filtran por la hora actual.
const DATE = '2099-03-10'
// El backend numera 0=lunes...6=domingo; Date#getDay() 0=domingo...6=sábado.
const BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5][new Date(`${DATE}T00:00:00`).getDay()]
const SLOTS = generateSlots({ start: '08:00', end: '20:00' })

const availability = (dayOfWeek = BACKEND_DAY) => [{ dayOfWeek, startTime: '08:00', endTime: '20:00' }]

function renderStep(props: Partial<React.ComponentProps<typeof DateTimeStep>> = {}) {
  const onSelectTime = vi.fn()
  render(
    <DateTimeStep
      professionalId="pro-1"
      selectedDate={DATE}
      selectedTime={null}
      onSelectDate={vi.fn()}
      onSelectTime={onSelectTime}
      {...props}
    />,
  )
  return { onSelectTime }
}

describe('DateTimeStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('con una profesional elegida muestra los horarios de su disponibilidad', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { availability: availability() } } as never)
    renderStep()

    for (const slot of SLOTS) expect(await screen.findByRole('button', { name: slot })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/api/professional/pro-1/availability', { params: { date: DATE } })
  })

  it('muestra "Cargando horarios..." hasta que llega la respuesta', async () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}) as never)
    renderStep()

    expect(await screen.findByText('Cargando horarios...')).toBeInTheDocument()
    expect(screen.queryByText('Horarios disponibles')).not.toBeInTheDocument()
  })

  it('no ofrece los horarios que ya están ocupados', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { availability: availability(), bookedTimes: [SLOTS[0]] } } as never)
    renderStep()

    expect(await screen.findByRole('button', { name: SLOTS[1] })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: SLOTS[0] })).not.toBeInTheDocument()
  })

  it('al tocar un horario avisa cuál se eligió', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { availability: availability() } } as never)
    const { onSelectTime } = renderStep()

    await userEvent.setup().click(await screen.findByRole('button', { name: SLOTS[1] }))

    expect(onSelectTime).toHaveBeenCalledWith(SLOTS[1])
  })

  it('si la profesional no atiende ese día lo dice', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { availability: availability((BACKEND_DAY + 1) % 7) } } as never)
    renderStep()

    expect(await screen.findByText('El profesional no tiene horarios disponibles este día.')).toBeInTheDocument()
  })

  it('si falla la consulta no deja la pantalla cargando: muestra que no hay horarios', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('red caída'))
    renderStep()

    expect(await screen.findByText('El profesional no tiene horarios disponibles este día.')).toBeInTheDocument()
    expect(screen.queryByText('Cargando horarios...')).not.toBeInTheDocument()
  })

  it('sin fecha elegida no consulta nada', () => {
    renderStep({ selectedDate: null })

    expect(api.get).not.toHaveBeenCalled()
    expect(screen.queryByText('Cargando horarios...')).not.toBeInTheDocument()
  })

  it('sin profesional elegida no consulta nada', () => {
    renderStep({ professionalId: null })

    expect(api.get).not.toHaveBeenCalled()
  })

  it('vuelve a consultar cuando cambia refreshSignal (por ejemplo tras un 409)', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { availability: availability() } } as never)
    const props = { professionalId: 'pro-1', selectedDate: DATE, selectedTime: null, onSelectDate: vi.fn(), onSelectTime: vi.fn() }
    const { rerender } = render(<DateTimeStep {...props} refreshSignal={0} />)
    await screen.findByRole('button', { name: SLOTS[0] })
    expect(api.get).toHaveBeenCalledTimes(1)

    rerender(<DateTimeStep {...props} refreshSignal={1} />)

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  })

  it('con "Cualquiera" junta los horarios libres de todas las profesionales del servicio', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith('/api/professional/public')) {
        return Promise.resolve({ data: { professionals: [{ id: 'a' }, { id: 'b' }] } }) as never
      }
      // La profesional "a" tiene ocupado el primer horario y la "b" el segundo: entre las dos queda todo.
      const booked = url.includes('/a/') ? [SLOTS[0]] : [SLOTS[1]]
      return Promise.resolve({ data: { availability: availability(), bookedTimes: booked } }) as never
    })
    renderStep({ professionalId: ANY_PROFESSIONAL_ID, serviceId: 'serv-1' })

    expect(await screen.findByRole('button', { name: SLOTS[0] })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: SLOTS[1] })).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/api/professional/public?serviceId=serv-1')
  })

  it('con "Cualquiera" un horario ocupado en todas las profesionales no se ofrece', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith('/api/professional/public')) {
        return Promise.resolve({ data: { professionals: [{ id: 'a' }, { id: 'b' }] } }) as never
      }
      return Promise.resolve({ data: { availability: availability(), bookedTimes: [SLOTS[0]] } }) as never
    })
    renderStep({ professionalId: ANY_PROFESSIONAL_ID })

    expect(await screen.findByRole('button', { name: SLOTS[1] })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: SLOTS[0] })).not.toBeInTheDocument()
  })

  it('con "Cualquiera" y sin ninguna profesional con horarios lo dice', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith('/api/professional/public')) return Promise.resolve({ data: { professionals: [] } }) as never
      return Promise.reject(new Error('no debería consultarse')) as never
    })
    renderStep({ professionalId: ANY_PROFESSIONAL_ID })

    expect(await screen.findByText('Ningún profesional tiene horarios disponibles este día.')).toBeInTheDocument()
  })
})
