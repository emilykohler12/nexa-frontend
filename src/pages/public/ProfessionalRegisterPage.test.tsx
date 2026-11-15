import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProfessionalRegisterPage } from './ProfessionalRegisterPage'
import { api } from '@/shared/utils/api'

const order: string[] = []
const refreshUser = vi.fn(async () => { order.push('refreshUser') })

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({ useTenant: () => ({ business: { name: 'Estudio', logo: '' } }) }))
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ refreshUser }) }))
vi.mock('@/shared/hooks/usePageMeta', () => ({ usePageMeta: () => undefined }))

function PanelMarker() { order.push('panel'); return <p>PANEL DE LA PROFESIONAL</p> }

// PM-03 (13/11/2026): tras registrarse con el enlace, la profesional va a SU panel (no al del administrador).
describe('PM-03 registro de la profesional por la invitación', () => {
  it('PM-03 vuelve a leer la sesión antes de ir al panel de la profesional', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { valid: true, email: 'nueva@test.local' } } as never)
    vi.mocked(api.post).mockResolvedValue({ data: { user: {} } } as never)

    render(
      <MemoryRouter initialEntries={['/registro-profesional?token=abc']}>
        <Routes>
          <Route path="/registro-profesional" element={<ProfessionalRegisterPage />} />
          <Route path="/professional/panel" element={<PanelMarker />} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.type(await screen.findByPlaceholderText('Nombre completo'), 'Profesional Nueva')
    await userEvent.type(screen.getByPlaceholderText('Teléfono'), '3764111111')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'female')
    await userEvent.type(screen.getByPlaceholderText('Contraseña (mínimo 8 caracteres)'), 'ClaveNueva123')
    await userEvent.type(screen.getByPlaceholderText('Repetí la contraseña'), 'ClaveNueva123')
    await userEvent.click(screen.getByRole('button', { name: 'COMPLETAR REGISTRO' }))

    await waitFor(() => expect(screen.getByText('PANEL DE LA PROFESIONAL')).toBeInTheDocument())
    expect(api.post).toHaveBeenCalledWith('/api/invitations/register', expect.objectContaining({ token: 'abc' }))
    expect(order).toEqual(['refreshUser', 'panel'])
  })
})
