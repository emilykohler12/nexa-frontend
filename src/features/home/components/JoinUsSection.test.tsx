import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JoinUsSection } from './JoinUsSection'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { post: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37' } }),
}))

const apiError = (status: number, data: { error?: string; code?: string }) => ({ response: { status, data } })

async function enviar(mensaje = 'Quiero sumarme') {
  const user = userEvent.setup()
  render(<JoinUsSection />)
  await user.type(screen.getByLabelText('Mensaje'), mensaje)
  await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
  return user
}

describe('JoinUsSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('los campos opcionales vacíos se mandan como null y la postulación se envía', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })
    await enviar()
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/contact/job-interest', {
      name: null, email: null, phone: null, message: 'Quiero sumarme',
    }))
    expect(await screen.findByText(/Recibimos tu mensaje/)).toBeInTheDocument()
  })

  it('400: muestra el mensaje del servidor sobre los campos inválidos', async () => {
    vi.mocked(api.post).mockRejectedValue(apiError(400, { error: 'Ingresá un correo válido', code: 'VALIDATION_ERROR' }))
    await enviar()
    expect(await screen.findByRole('alert')).toHaveTextContent('Ingresá un correo válido')
  })

  it('400 sin texto usable: muestra un aviso de datos inválidos', async () => {
    vi.mocked(api.post).mockRejectedValue(apiError(400, { code: 'VALIDATION_ERROR' }))
    await enviar()
    expect(await screen.findByRole('alert')).toHaveTextContent(/no son válidos/)
  })

  it('429: avisa que envió demasiadas postulaciones', async () => {
    vi.mocked(api.post).mockRejectedValue(apiError(429, { error: 'Enviaste demasiadas postulaciones. Probá de nuevo en un rato.' }))
    await enviar()
    expect(await screen.findByRole('alert')).toHaveTextContent(/demasiadas postulaciones/)
  })

  it('error de envío (500): muestra el mensaje genérico y deja reintentar', async () => {
    vi.mocked(api.post).mockRejectedValue(apiError(500, { error: 'Prisma exploded' }))
    await enviar()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar tu mensaje. Intentá de nuevo.')
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeEnabled()
  })
})
