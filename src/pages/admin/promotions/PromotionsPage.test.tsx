import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromotionsPage } from './PromotionsPage'
import { ToastProvider } from '@/shared/ui/molecules/ToastProvider'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const promotion = {
  id: 'p1', type: 'service', kind: 'discount', title: 'Brushing a mitad de precio',
  description: 'Solo esta semana', image: null, price: 5000, originalPrice: 10000, status: 'active',
  items: [{ id: 's1', name: 'Brushing', price: 10000 }], buyQty: null, payQty: null,
  startDate: null, endDate: null,
}

function setup() {
  render(
    <ToastProvider>
      <PromotionsPage />
    </ToastProvider>,
  )
}

// El backend eliminó las campañas automáticas: el administrador solo carga promociones
// de servicios, de productos y eventos especiales.
describe('PromotionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/api/admin/promotions') return { data: { promotions: [promotion] } } as never
      return { data: {} } as never
    })
  })

  it('no ofrece campañas: solo promociones de servicios, de productos y eventos especiales', async () => {
    setup()

    expect(await screen.findByText('Brushing a mitad de precio')).toBeInTheDocument()
    const tabs = screen.getAllByRole('button').filter(b => b.textContent && ['Servicios', 'Productos', 'Eventos especiales'].includes(b.textContent))
    expect(tabs.map(b => b.textContent)).toEqual(['Servicios', 'Productos', 'Eventos especiales'])
    expect(screen.queryByText(/campañas?/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/cumpleaños/i)).not.toBeInTheDocument()
  })

  it('no pide al backend las rutas de campañas automáticas', async () => {
    const user = userEvent.setup()
    setup()
    await screen.findByText('Brushing a mitad de precio')

    await user.click(screen.getByRole('button', { name: 'Productos' }))
    await user.click(screen.getByRole('button', { name: 'Eventos especiales' }))

    const urls = vi.mocked(api.get).mock.calls.map(([url]) => url)
    expect(urls).toContain('/api/admin/promotions')
    expect(urls.some(url => url.includes('auto-promotions'))).toBe(false)
  })

  it('conserva las promociones que carga el administrador', async () => {
    const user = userEvent.setup()
    setup()

    expect(await screen.findByText('Brushing a mitad de precio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nueva promoción/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Productos' }))
    expect(screen.getByText('Todavía no hay promociones de productos')).toBeInTheDocument()
  })
})
