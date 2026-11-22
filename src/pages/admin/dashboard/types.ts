// ============================================================
// TIPOS — Módulo Dashboard
// ============================================================

export type PeriodFilter = 'day' | 'week' | 'month' | 'year';

export interface TopProductStat {
  name: string;
  quantity: number;
  revenue: number;
  color: string;
}

export interface CategoryRevenueStat {
  categoryId: string;
  revenue: number;
  color: string;
}

export interface HeatmapRow {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

export interface PromotionConversionStat {
  label: string;
  count: number;
}

export interface ServiceProfitabilityStat {
  name: string;
  categoryId: string;
  realized: number;
  depositRevenue: number;
  totalRevenue: number;
  cancelled: number;
}

export interface ProfessionalPerformanceStat {
  name: string;
  attended: number;
  hoursWorked: number;
  revenue: number;
  cancelled: number;
}

export interface DashboardData {
  // KPIs superiores
  depositRevenueTotal: number;
  attendedAppointments: number;
  newClients: number;
  occupancyPercent: number;

  // Gráficos
  topProducts: TopProductStat[];
  categoryRevenue: CategoryRevenueStat[];
  heatmap: HeatmapRow[];
  promotionConversion: PromotionConversionStat[];

  // Tablas
  serviceProfitability: ServiceProfitabilityStat[];
  professionalPerformance: ProfessionalPerformanceStat[];

  // KPIs inferiores
  noShowAppointments: number;
  returningClients: number;
  returningWindowDays: number;
  pendingBalance: number;
  refundedDeposits: number;
  // Señas pagadas por Mercado Pago que el sistema marcó como devueltas y todavía falta devolver (no depende del período).
  pendingRefunds: PendingRefundStat[];
  // Pagos de Mercado Pago en los que la clienta pagó y no se reservó nada (monto menor, otra moneda, llegó tarde): hay que devolverlos.
  paymentsToRefund: PaymentToRefundStat[];
}

export interface PaymentToRefundStat {
  id:             string;
  outcome:        'underpaid' | 'wrong_currency' | 'late';
  reason:         string;
  paidAmount:     number | null;
  expectedAmount: number | null;
  currency:       string | null;
  receivedAt:     string;
  clientName:     string | null;
  label:          string | null;
  date:           string | null;
  time:           string | null;
}

export interface PendingRefundStat {
  appointmentId: string;
  clientName:    string;
  serviceName:   string;
  date:          string;
  time:          string;
  amount:        number;
}
