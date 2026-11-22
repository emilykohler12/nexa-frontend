import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComboRescheduleModal } from './ComboRescheduleModal'
import { api } from '@/shared/utils/api'
import { generateSlots } from '@/features/professional/onboarding/types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37' } }),
}))

const DATE = '2030-06-12'
const legs = [
  { id: 'a1', serviceId: 's1', serviceName: 'Corte',    professionalId: 'p1', professionalName: 'Lucía' },
  { id: 'a2', serviceId: 's2', serviceName: 'Brushing', professionalId: 'p2', professionalName: 'Marta' },
]

// Lucía trabaja de 09:00 a 20:00 y Marta de 09:00 a 13:00, todos los días.
const week = (startTime: string, endTime: string) => [0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => ({ dayOfWeek, startTime, endTime }))
const wide   = generateSlots({ start: '09:00', end: '20:00' })
const narrow = generateSlots({ start: '09:00', end: '13:00' })

function mockAvailability(extra: Record<string, Record<string, unknown>> = {}) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    const proId = url.split('/')[3]
    const rows = proId === 'p1' ? week('09:00', '20:00') : week('09:00', '13:00')
    return Promise.resolve({ data: { availability: rows, bookedTimes: [], earliestStart: '00:00', reopenedStarts: [], ...(extra[proId] ?? {}) } }) as never
  })
}

const renderModal = (onSuccess = vi.fn()) =>
  render(<ComboRescheduleModal legs={legs} initialDate={DATE} initialTime="09:00" onClose={vi.fn()} onSuccess={onSuccess} />)

describe('ComboRescheduleModal', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('ofrece solo los horarios en que están libres todas las profesionales', async () => {
    mockAvailability()
    renderModal()

    await screen.findByRole('button', { name: narrow[0] })
    for (const t of narrow) expect(screen.getByRole('button', { name: t })).toBeInTheDocument()
    const onlyLucia = wide.filter(t => !narrow.includes(t))
    expect(onlyLucia.length).toBeGreaterThan(0)
    for (const t of onlyLucia) expect(screen.queryByRole('button', { name: t })) .not.toBeInTheDocument()
  })

  it('un horario ocupado de una sola profesional deja de ofrecerse', async () => {
    const taken = narrow[narrow.length - 1]
    mockAvailability({ p2: { bookedTimes: [taken] } })
    renderModal()

    await screen.findByRole('button', { name: narrow[0] })
    expect(screen.queryByRole('button', { name: taken })).not.toBeInTheDocument()
  })

  it('si una profesional está de vacaciones lo dice y no ofrece horarios', async () => {
    mockAvailability({ p2: { onVacation: true, vacationFrom: '2030-06-10', vacationTo: '2030-06-14' } })
    renderModal()

    expect(await screen.findByText(/Marta está de vacaciones ese día/)).toBeInTheDocument()
  })

  it('confirma mandando solo el día y la hora nuevos', async () => {
    mockAvailability()
    vi.mocked(api.patch).mockResolvedValue({ data: { appointment: { id: 'a1' }, appointments: [{ id: 'a1' }, { id: 'a2' }] } } as never)
    const onSuccess = vi.fn()
    renderModal(onSuccess)

    const pick = narrow.find(t => t !== '09:00')!
    await userEvent.click(await screen.findByRole('button', { name: pick }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar cambios' }))

    expect(api.patch).toHaveBeenCalledWith('/api/client/appointments/a1/reschedule', { date: DATE, time: pick })
    expect(onSuccess).toHaveBeenCalledWith([{ id: 'a1' }, { id: 'a2' }])
  })
})
