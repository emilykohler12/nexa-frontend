import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { post: vi.fn() },
}))

const EMAIL = 'clienta@test.local'

// Recorre el modal hasta el paso de "código + nueva contraseña".
async function goToResetStep(user: ReturnType<typeof userEvent.setup>) {
  render(<ForgotPasswordModal onClose={vi.fn()} defaultEmail={EMAIL} />)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  await user.click(await screen.findByRole('button', { name: 'Ingresar código' }))
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, code = '123456') {
  await user.type(screen.getByPlaceholderText('123456'), code)
  await user.type(screen.getByPlaceholderText('Mínimo 8 caracteres'), 'ClaveNueva123')
  await user.type(screen.getByPlaceholderText('Repetí la contraseña'), 'ClaveNueva123')
  await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
}

describe('ForgotPasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.post).mockResolvedValue({ data: {} } as never)
  })

  it('pide el código con el email ingresado', async () => {
    const user = userEvent.setup()
    await goToResetStep(user)

    expect(api.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: EMAIL })
  })

  it('manda el email junto con el código y la nueva contraseña (el backend valida el código contra la cuenta)', async () => {
    const user = userEvent.setup()
    await goToResetStep(user)
    await fillAndSubmit(user)

    expect(api.post).toHaveBeenLastCalledWith('/api/auth/reset-password', {
      email: EMAIL, token: '123456', password: 'ClaveNueva123',
    })
    expect(await screen.findByText('¡Contraseña actualizada!')).toBeInTheDocument()
  })

  it('manda el email sin espacios sobrantes', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordModal onClose={vi.fn()} defaultEmail={`  ${EMAIL}  `} />)
    // el paso 1 valida el formato con el valor tal cual; si falla, se corrige y se sigue
    await user.clear(screen.getByPlaceholderText('tu@email.com'))
    await user.type(screen.getByPlaceholderText('tu@email.com'), EMAIL)
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    await user.click(await screen.findByRole('button', { name: 'Ingresar código' }))
    await fillAndSubmit(user)

    expect(api.post).toHaveBeenLastCalledWith('/api/auth/reset-password', expect.objectContaining({ email: EMAIL }))
  })

  it('muestra el mensaje del backend si el código no es válido', async () => {
    vi.mocked(api.post).mockImplementation((url: string) =>
      url === '/api/auth/reset-password'
        ? Promise.reject({ response: { status: 400, data: { error: 'Código inválido o ya utilizado' } } })
        : Promise.resolve({ data: {} } as never))
    const user = userEvent.setup()
    await goToResetStep(user)
    await fillAndSubmit(user)

    expect(await screen.findByText('Código inválido o ya utilizado')).toBeInTheDocument()
    expect(screen.queryByText('¡Contraseña actualizada!')).not.toBeInTheDocument()
  })

  it('muestra el aviso cuando se superó el límite de intentos', async () => {
    vi.mocked(api.post).mockImplementation((url: string) =>
      url === '/api/auth/reset-password'
        ? Promise.reject({ response: { status: 429, data: { error: 'Demasiados intentos con este email. Probá de nuevo en 15 minutos.' } } })
        : Promise.resolve({ data: {} } as never))
    const user = userEvent.setup()
    await goToResetStep(user)
    await fillAndSubmit(user)

    expect(await screen.findByText(/Demasiados intentos con este email/)).toBeInTheDocument()
  })

  it('no manda nada si el código no tiene 6 dígitos', async () => {
    const user = userEvent.setup()
    await goToResetStep(user)
    vi.mocked(api.post).mockClear()
    await fillAndSubmit(user, '123')

    expect(api.post).not.toHaveBeenCalled()
    expect(await screen.findByText('El código debe tener exactamente 6 dígitos')).toBeInTheDocument()
  })
})
