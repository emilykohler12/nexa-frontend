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
}
