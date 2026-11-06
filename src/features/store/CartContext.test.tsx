import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn() } }))

function Probe() {
  const { items, removedNames } = useCart()
  return <div><span data-testid="ids">{items.map(i => i.productId).join(',')}</span><span data-testid="gone">{removedNames.join(',')}</span></div>
}

describe('CartProvider: productos que dejaron de estar disponibles', () => {
  beforeEach(() => {
    localStorage.setItem('nexa_cart', JSON.stringify([
      { productId: 'p1', name: 'Esmalte', price: 10, image: null, quantity: 1 },
      { productId: 'p2', name: 'Crema', price: 20, image: null, quantity: 2 },
    ]))
    vi.mocked(api.get).mockResolvedValue({ data: { products: [{ id: 'p1' }] } } as never)
  })

  it('saca del carrito lo que ya no figura en la lista pública y guarda su nombre para avisar', async () => {
    render(<CartProvider><Probe /></CartProvider>)
    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('p1'))
    expect(screen.getByTestId('gone').textContent).toBe('Crema')
  })
})
