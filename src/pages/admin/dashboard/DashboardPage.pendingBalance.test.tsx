import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardPage } from './DashboardPage'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn() } }))
// Los gráficos usan recharts, que no aporta a esta prueba.
vi.mock('./TopProductsChart', () => ({ TopProductsChart: () => null }))
vi.mock('./RevenueByCategoryChart', () => ({ RevenueByCategoryChart: () => null }))
vi.mock('./PromotionConversionChart', () => ({ PromotionConversionChart: () => null }))
vi.mock('./PeakHoursHeatmap', () => ({ PeakHoursHeatmap: () => null }))
vi.mock('./ServiceProfitabilityTable', () => ({ ServiceProfitabilityTable: () => null }))
vi.mock('./ProfessionalPerformanceTable', () => ({ ProfessionalPerformanceTable: () => null }))

describe('DashboardPage — saldo pendiente', () => {
  it('la tarjeta aclara que es precio menos seña menos lo ya cobrado en el local', async () => {
    // Sin datos del servidor la página usa su estado vacío, que alcanza para ver la tarjeta.
    vi.mocked(api.get).mockRejectedValue(new Error('sin datos'))
    render(<DashboardPage />)
    expect(await screen.findByText('Saldo pendiente a cobrar en local')).toBeInTheDocument()
    expect(screen.getByText('Precio menos seña y menos lo ya cobrado en el local')).toBeInTheDocument()
  })
})
