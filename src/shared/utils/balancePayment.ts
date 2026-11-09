export type BalanceMethod = 'cash' | 'transfer' | 'card' | 'other'

export interface BalancePaymentInfo {
  method:           BalanceMethod
  amount:           number
  collectedByName?: string | null
}

export const BALANCE_METHOD_LABEL: Record<BalanceMethod, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro',
}

// Lo que falta cobrar en el local: precio - seña (si está paga) - lo ya cobrado. Es el monto sugerido.
export function suggestedBalance(p: {
  servicePrice: number; depositAmount?: number; paymentStatus?: string; balancePayment?: BalancePaymentInfo | null
}): number {
  const deposit = p.paymentStatus === 'partial' ? (p.depositAmount ?? 0) : 0
  return Math.max(0, p.servicePrice - deposit - (p.balancePayment?.amount ?? 0))
}
