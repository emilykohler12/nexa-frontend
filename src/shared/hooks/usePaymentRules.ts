// Plazo y política de devolución de la seña que configura la administradora. El endpoint es público
// (no requiere sesión), por eso lo pueden leer también la clienta y la profesional.
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/utils/api'
import type { RefundRule } from '@/shared/utils/cancellation'

export function usePaymentRules(): RefundRule | null {
  const { data } = useQuery({
    queryKey: ['payment-rules'],
    queryFn: async (): Promise<RefundRule> => {
      const res = await api.get<{ settings: { cancellationHours: number; refundPolicy: string } }>('/api/business/payments/public')
      const { cancellationHours, refundPolicy } = res.data.settings
      // Un valor viejo como 'partial' se trata como 'full', igual que el backend.
      return { cancellationHours, refundPolicy: refundPolicy === 'none' ? 'none' : 'full' }
    },
  })
  return data ?? null
}
