import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Schedule } from './Schedule'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn(), patch: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37' } }),
}))

async function abrir(startTime: string, endTime: string) {
  vi.mocked(api.get).mockResolvedValue({
    data: { profile: { availability: [{ dayOfWeek: 0, startTime, endTime }] } },
  })
  render(<Schedule />)
  await screen.findByText('Horarios')
  return userEvent.setup()
}

describe('Schedule (horarios de la profesional)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no envía si el inicio no es menor al fin y muestra el error', async () => {
    const user = await abrir('08:00', '20:00')
    const desde = document.querySelector('input[type="time"]') as HTMLInputElement
    fireEvent.change(desde, { target: { value: '21:00' } })
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(api.patch).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('Lunes: la hora de inicio tiene que ser anterior a la de fin.')
  })

  it('si el servidor responde 400 VALIDATION_ERROR igual, muestra su mensaje sin la ruta técnica', async () => {
    const user = await abrir('08:00', '20:00')
    vi.mocked(api.patch).mockRejectedValue({
      response: { status: 400, data: { code: 'VALIDATION_ERROR', error: 'La hora de inicio tiene que ser anterior a la de fin (availability.monday.0)' } },
    })
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/^La hora de inicio tiene que ser anterior a la de fin$/)
  })
})
