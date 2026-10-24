import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SecuritySection } from './SecuritySection'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { post: vi.fn() },
}))

// Orden de los campos: contraseña actual, nueva y confirmación.
function fields(container: HTMLElement) {
  return Array.from(container.querySelectorAll('input')) as HTMLInputElement[]
}

describe('SecuritySection (cambiar contraseña del admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } } as never)
  })

  it('muestra los tres campos, empezando por la contraseña actual', () => {
    const { container } = render(<SecuritySection />)

    expect(screen.getByText('Contraseña actual')).toBeInTheDocument()
    expect(screen.getByText('Nueva contraseña')).toBeInTheDocument()
    expect(screen.getByText('Confirmar nueva contraseña')).toBeInTheDocument()
    expect(fields(container)).toHaveLength(3)
  })

  it('manda la contraseña actual junto con la nueva', async () => {
    const user = userEvent.setup()
    const { container } = render(<SecuritySection />)
    const [current, next, confirm] = fields(container)

    await user.type(current, 'ClaveVieja123')
    await user.type(next, 'ClaveNueva123')
    await user.type(confirm, 'ClaveNueva123')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(api.post).toHaveBeenCalledWith('/api/auth/change-password', {
      currentPassword: 'ClaveVieja123', password: 'ClaveNueva123',
    })
    expect(await screen.findByText('✓ Guardado')).toBeInTheDocument()
    expect(fields(container).every(f => f.value === '')).toBe(true)
  })

  it('no manda nada si falta la contraseña actual', async () => {
    const user = userEvent.setup()
    const { container } = render(<SecuritySection />)
    const [, next, confirm] = fields(container)

    await user.type(next, 'ClaveNueva123')
    await user.type(confirm, 'ClaveNueva123')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(api.post).not.toHaveBeenCalled()
    expect(await screen.findByText('Ingresá tu contraseña actual')).toBeInTheDocument()
  })

  it('no manda nada si la confirmación no coincide', async () => {
    const user = userEvent.setup()
    const { container } = render(<SecuritySection />)
    const [current, next, confirm] = fields(container)

    await user.type(current, 'ClaveVieja123')
    await user.type(next, 'ClaveNueva123')
    await user.type(confirm, 'OtraClave1234')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(api.post).not.toHaveBeenCalled()
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('muestra el error del backend si la contraseña actual es incorrecta', async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { status: 400, data: { error: 'La contraseña actual no es correcta', code: 'INVALID_CURRENT_PASSWORD' } },
    })
    const user = userEvent.setup()
    const { container } = render(<SecuritySection />)
    const [current, next, confirm] = fields(container)

    await user.type(current, 'NoEsLaClave1')
    await user.type(next, 'ClaveNueva123')
    await user.type(confirm, 'ClaveNueva123')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('La contraseña actual no es correcta')).toBeInTheDocument()
    expect(screen.queryByText('✓ Guardado')).not.toBeInTheDocument()
  })
})
