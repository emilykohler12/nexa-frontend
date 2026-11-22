import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Services } from './Services'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37' } }),
}))

const catalog = [
  { id: 's1', name: 'Esmaltado semipermanente', categoryId: 'unas', description: 'Incluye limado y cutículas.', duration: 90, price: 12000, image: null, status: 'active' },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/services') return Promise.resolve({ data: { services: catalog } }) as never
    return Promise.resolve({ data: { services: [{ serviceId: 's1', status: 'active' }] } }) as never
  })
  vi.mocked(api.patch).mockResolvedValue({ data: {} } as never)
})

describe('Servicios de la profesional', () => {
  it('la tarjeta muestra solo el nombre y el precio', async () => {
    render(<Services />)

    expect(await screen.findByText('Esmaltado semipermanente')).toBeInTheDocument()
    expect(screen.getByText('$12.000')).toBeInTheDocument()
    expect(screen.queryByText(/Incluye limado/)).not.toBeInTheDocument()
    expect(screen.queryByText('90 min')).not.toBeInTheDocument()
  })

  it('al tocar el servicio se abre el detalle con toda la información', async () => {
    const user = userEvent.setup()
    render(<Services />)

    await user.click(await screen.findByText('Esmaltado semipermanente'))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Incluye limado y cutículas.')).toBeInTheDocument()
    expect(within(dialog).getByText('90 min')).toBeInTheDocument()
    expect(within(dialog).getByText('$12.000')).toBeInTheDocument()
    await user.click(within(dialog).getAllByRole('button', { name: 'Cerrar' })[0])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('desde el detalle se puede desactivar el servicio', async () => {
    const user = userEvent.setup()
    render(<Services />)
    await user.click(await screen.findByText('Esmaltado semipermanente'))

    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Lo ofrezco/ }))

    expect(api.patch).toHaveBeenCalledWith('/api/professional/services', { services: [{ serviceId: 's1', status: 'inactive' }] })
  })
})
