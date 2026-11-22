import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateAppointmentModal } from './CreateAppointmentModal'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

const ANA = { id: 'u1', name: 'Ana Pérez', email: 'ana@test.local', phone: '3764111111' }

function setup(found: typeof ANA[]) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/admin/clients/search') return Promise.resolve({ data: { clients: found } }) as never
    if (url === '/api/services') return Promise.resolve({ data: { services: [] } }) as never
    return Promise.resolve({ data: { availability: [] } }) as never
  })
  render(<CreateAppointmentModal professionals={[{ id: 'p1', name: 'Lucía', color: '#069494' }]} onClose={vi.fn()} onCreated={vi.fn()} />)
}

beforeEach(() => { vi.clearAllMocks() })

describe('turno manual del administrador: buscar la cuenta de la clienta al escribir el nombre', () => {
  it('muestra la cuenta existente y al elegirla completa nombre, teléfono y correo (el correo queda fijo)', async () => {
    setup([ANA])
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'Ana')
    await user.click(await screen.findByRole('option', { name: /Ana Pérez/ }))

    expect(api.get).toHaveBeenCalledWith('/api/admin/clients/search', { params: { q: 'Ana' } })
    expect(screen.getByPlaceholderText('Nombre y apellido')).toHaveValue('Ana Pérez')
    expect(screen.getByDisplayValue('ana@test.local')).toHaveAttribute('readonly')
    expect(screen.getByDisplayValue('3764111111')).toBeInTheDocument()
    expect(screen.getByText(/Cuenta existente/)).toBeInTheDocument()
  })

  it('«Quitar» deja de usar esa cuenta y libera el correo', async () => {
    setup([ANA])
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'Ana')
    await user.click(await screen.findByRole('option', { name: /Ana Pérez/ }))

    await user.click(screen.getByRole('button', { name: 'Quitar' }))

    expect(screen.queryByText(/Cuenta existente/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('readonly')
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('si no hay cuenta con ese nombre avisa que se va a crear una nueva', async () => {
    setup([])
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'Zulema')

    expect(await screen.findByText(/se va a crear una nueva/)).toBeInTheDocument()
  })

  it('con una sola letra no busca', async () => {
    setup([ANA])
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'A')
    await new Promise(r => setTimeout(r, 400))

    expect(api.get).not.toHaveBeenCalledWith('/api/admin/clients/search', expect.anything())
  })
})
