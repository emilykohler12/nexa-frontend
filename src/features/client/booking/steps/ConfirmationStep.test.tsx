import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationStep, type ConfirmedSummary } from './ConfirmationStep'
import { TenantProvider } from '@/features/tenant/TenantContext'
import { EMPTY_BOOKING } from '../types'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn() },
}))

const SERVICE = { id: 'svc-1', name: 'Manicura', price: 10000, categoryId: 'unas', description: 'Manicura clásica' }
const PROFESSIONAL = { id: 'pro-1', name: 'Juana' }
const PAYMENT_SETTINGS = { depositAmount: 5000, depositPercent: false }
const PROMOTION = { id: 'promo-1', price: 6000, items: [{ id: 'svc-1' }] }

function mockApiGet(promotions: typeof PROMOTION[] = []) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/services')                return Promise.resolve({ data: { services: [SERVICE] } } as any)
    if (url === '/api/professional/public')      return Promise.resolve({ data: { professionals: [PROFESSIONAL] } } as any)
    if (url === '/api/business/payments/public') return Promise.resolve({ data: { settings: PAYMENT_SETTINGS } } as any)
    if (url === '/api/promotions/public')        return Promise.resolve({ data: { promotions } } as any)
    // /api/business/public (TenantProvider) — sin override, se queda con la base estática.
    return Promise.reject(new Error('not mocked'))
  })
}

function renderStep(selection = EMPTY_BOOKING, onConfirm = vi.fn()) {
  render(
    <TenantProvider>
      <ConfirmationStep selection={selection} onConfirm={onConfirm} />
    </TenantProvider>,
  )
  return { onConfirm }
}

describe('ConfirmationStep', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin promoción, cobra el precio de catálogo del servicio', async () => {
    mockApiGet()
    renderStep({ ...EMPTY_BOOKING, serviceId: 'svc-1', professionalId: 'pro-1', date: '2026-06-20', time: '10:00' })

    await waitFor(() => expect(screen.getByText('$10.000')).toBeInTheDocument())
    expect(screen.queryByText('$6.000')).not.toBeInTheDocument()
    // Sin promoción no debería mostrar ningún precio tachado.
    expect(document.querySelector('.line-through')).toBeNull()
  })

  it('con una promoción vigente para ese servicio, cobra el precio promocional y tacha el original', async () => {
    mockApiGet([PROMOTION])
    renderStep({ ...EMPTY_BOOKING, serviceId: 'svc-1', professionalId: 'pro-1', date: '2026-06-20', time: '10:00', promotionId: 'promo-1' })

    await waitFor(() => expect(screen.getByText('$6.000')).toBeInTheDocument())
    expect(screen.getByText('$10.000')).toBeInTheDocument() // el original, tachado
    expect(document.querySelector('.line-through')?.textContent).toBe('$10.000')
  })

  it('al confirmar, manda el precio promocional y el promotionId — nunca el de catálogo', async () => {
    mockApiGet([PROMOTION])
    const { onConfirm } = renderStep(
      { ...EMPTY_BOOKING, serviceId: 'svc-1', professionalId: 'pro-1', date: '2026-06-20', time: '10:00', promotionId: 'promo-1' },
    )

    const button = await screen.findByRole('button', { name: /confirmar reserva/i })
    await waitFor(() => expect(button).not.toBeDisabled())
    await userEvent.click(button)

    expect(onConfirm).toHaveBeenCalledTimes(1)
    const summary = onConfirm.mock.calls[0][0] as ConfirmedSummary
    expect(summary.price).toBe(6000)
    expect(summary.originalPrice).toBe(10000)
    expect(summary.promotionId).toBe('promo-1')
  })

  it('si la promoción ya no corresponde a ese servicio, la ignora y cobra el precio de catálogo', async () => {
    mockApiGet([{ ...PROMOTION, items: [{ id: 'otro-servicio' }] }])
    renderStep({ ...EMPTY_BOOKING, serviceId: 'svc-1', professionalId: 'pro-1', date: '2026-06-20', time: '10:00', promotionId: 'promo-1' })

    await waitFor(() => expect(screen.getByText('$10.000')).toBeInTheDocument())
    expect(screen.queryByText('$6.000')).not.toBeInTheDocument()
  })
})
