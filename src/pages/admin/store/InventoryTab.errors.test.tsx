import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventoryTab } from './InventoryTab'
import { api } from '@/shared/utils/api'

const showToast = vi.fn()
vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn(), delete: vi.fn() } }))
vi.mock('@/shared/ui/molecules/ToastProvider', () => ({ useToast: () => ({ showToast }) }))

describe('InventoryTab — borrar una entrada de stock ya vendida', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra el 400 INSUFFICIENT_STOCK del servidor y restituye la fila', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { movements: [
      { id: 'm1', productId: 'p1', productName: 'Esmalte', type: 'entry', quantity: 5, note: 'Compra', date: '2026-11-01' },
    ] } })
    const server = 'No se puede borrar esa entrada: parte de ese stock de Esmalte ya se vendió'
    vi.mocked(api.delete).mockRejectedValue({ response: { status: 400, data: { code: 'INSUFFICIENT_STOCK', error: server } } })

    render(<InventoryTab products={[]} onProductStockChange={vi.fn()} />)
    await screen.findByText('Compra')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(showToast).toHaveBeenCalledWith(server, 'error'))
    expect(screen.getByText('Compra')).toBeInTheDocument()
  })
})
