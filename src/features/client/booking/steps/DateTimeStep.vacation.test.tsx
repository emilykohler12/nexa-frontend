import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DateTimeStep } from './DateTimeStep'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494' } }),
}))

const DATE = '2099-03-10'
const BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5][new Date(`${DATE}T00:00:00`).getDay()]

describe('DateTimeStep: vacaciones de la profesional', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('en un día de vacaciones no ofrece horarios y explica que está de vacaciones', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      availability: [{ dayOfWeek: BACKEND_DAY, startTime: '08:00', endTime: '20:00' }],
      earliestStart: '00:00', vacationFrom: '2099-03-09', vacationTo: '2099-03-12', onVacation: true,
    } } as never)
    render(<DateTimeStep professionalId="pro-1" selectedDate={DATE} selectedTime={null} onSelectDate={vi.fn()} onSelectTime={vi.fn()} />)

    expect(await screen.findByText('La profesional está de vacaciones del 09/03/2099 al 12/03/2099. Elegí otra fecha.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '08:00' })).not.toBeInTheDocument()
  })

  it('fuera de las vacaciones ofrece los horarios normales', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {
      availability: [{ dayOfWeek: BACKEND_DAY, startTime: '08:00', endTime: '20:00' }],
      earliestStart: '00:00', vacationFrom: '2099-03-20', vacationTo: '2099-03-22', onVacation: false,
    } } as never)
    render(<DateTimeStep professionalId="pro-1" selectedDate={DATE} selectedTime={null} onSelectDate={vi.fn()} onSelectTime={vi.fn()} />)

    expect(await screen.findByRole('button', { name: '08:00' })).toBeInTheDocument()
    expect(screen.queryByText(/vacaciones/)).not.toBeInTheDocument()
  })
})
