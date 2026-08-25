// ============================================================
// DATOS DE EJEMPLO — Configuración de pagos
// REEMPLAZAR cuando se conecte al backend
// ============================================================

import type { PaymentSettings } from './types';

export const mockPaymentSettings: PaymentSettings = {
  depositAmount:      2000,
  depositPercent:     false,
  cancellationHours:  24,
  refundPolicy:       'full',
};
