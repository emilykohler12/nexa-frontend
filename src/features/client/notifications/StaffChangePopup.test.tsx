import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { api } from '@/shared/utils/api'
import { StaffChangePopup } from './StaffChangePopup'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn().mockResolvedValue({}) },
}))

const note = (over: Record<string, unknown>) => ({
  id: 'n1', type: 'appointment_cancelled', title: 'Tu turno fue cancelado', body: 'El estudio canceló tu turno.',
  read: false, createdAt: new Date().toISOString(), link: '/mis-turnos', ...over,
})

function renderPopup() {
  return render(<MemoryRouter><StaffChangePopup primaryColor="#069494" /></MemoryRouter>)
}

describe('StaffChangePopup: avisos del personal al entrar', () => {
  beforeEach(() => { vi.mocked(api.get).mockReset(); vi.mocked(api.patch).mockClear() })

  it('muestra los cambios sin leer del personal y los marca como leídos al cerrar', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { notifications: [
      note({}),
      note({ id: 'n2', type: 'professional_changed', title: 'Cambió la profesional de tu turno', body: 'Ahora te atiende Ana.' }),
      note({ id: 'n3', type: 'new_promotion', title: 'Promo', body: 'Una promo' }),
      note({ id: 'n4', read: true, title: 'Ya leído' }),
    ] } } as never)
    renderPopup()

    expect(await screen.findByText('Hay cambios en tus turnos')).toBeInTheDocument()
    expect(screen.getByText('Tu turno fue cancelado')).toBeInTheDocument()
    expect(screen.getByText('Cambió la profesional de tu turno')).toBeInTheDocument()
    expect(screen.queryByText('Promo')).not.toBeInTheDocument()
    expect(screen.queryByText('Ya leído')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Entendido' }))
    expect(api.patch).toHaveBeenCalledWith('/api/client/notifications/n1/read')
    expect(api.patch).toHaveBeenCalledWith('/api/client/notifications/n2/read')
    expect(api.patch).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('sin avisos del personal no muestra nada', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { notifications: [note({ type: 'new_service' })] } } as never)
    renderPopup()
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
