import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateAppointmentModal } from './CreateAppointmentModal'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

const SERVICE = { id: 's1', name: 'Corte', duration: 60, price: 10000 }

// Antes la hora solo se podía elegir de la franja de la profesional: una profesional sin horarios cargados (o un día
// fuera de franja) dejaba el botón «Crear turno» deshabilitado para siempre. La hora ahora se escribe a mano.
describe('turno manual del administrador: la hora no depende de la franja de la profesional', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-22T12:00:00-03:00'))
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/api/services') return Promise.resolve({ data: { services: [SERVICE] } }) as never
      return Promise.resolve({ data: { availability: [] } }) as never // sin horarios cargados
    })
    vi.mocked(api.post).mockResolvedValue({ data: { appointment: { id: 'a1' } } } as never)
  })
  afterEach(() => { vi.useRealTimers() })

  async function fill(date: string) {
    const user = userEvent.setup({ advanceTimers: () => {} })
    render(<CreateAppointmentModal professionals={[{ id: 'p1', name: 'Lucía', color: '#069494' }]} onClose={vi.fn()} onCreated={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'Ana Pérez')
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[0], 's1')
    await user.selectOptions(selects[1], 'p1')
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: date } })
    return user
  }

  it('con una profesional sin horarios cargados se puede escribir la hora y crear el turno', async () => {
    const user = await fill('2026-11-25')
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '22:30' } })

    const create = screen.getByRole('button', { name: 'Crear turno' })
    expect(create).toBeEnabled()
    await user.click(create)

    expect(api.post).toHaveBeenCalledWith('/api/admin/appointments', expect.objectContaining({ date: '2026-11-25', time: '22:30', professionalId: 'p1' }))
  })

  it('si el día y la hora ya pasaron avisa que el turno se carga como finalizado', async () => {
    await fill('2026-11-20')
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '10:00' } })

    expect(screen.getByText(/se va a cargar como finalizado/)).toBeInTheDocument()
  })

  it('un horario futuro no muestra ese aviso', async () => {
    await fill('2026-11-25')
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '10:00' } })

    expect(screen.queryByText(/se va a cargar como finalizado/)).not.toBeInTheDocument()
  })
})
