// ============================================================
// TIPOS — Módulo Dashboard
// ============================================================

export type PeriodFilter = 'day' | 'week' | 'month' | 'year';

export interface RevenueDataPoint {
  label: string;   // "Lun", "Semana 1", "Ene", etc.
  revenue: number;
  appointments: number;
}

export interface ServiceStat {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

export interface ProfessionalStat {
  name: string;
  appointments: number;
  revenue: number;
  cancellations: number;
  color: string;
}

export interface AppointmentStatusStat {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface PaymentStat {
  label: string;
  amount: number;
  color: string;
}

export interface DashboardData {
  totalRevenue: number;
  prevRevenue: number;        // período anterior para comparar
  totalAppointments: number;
  prevAppointments: number;
  newClients: number;
  prevNewClients: number;
  avgTicket: number;
  prevAvgTicket: number;
  revenueChart: RevenueDataPoint[];
  serviceStats: ServiceStat[];
  professionalStats: ProfessionalStat[];
  appointmentStatus: AppointmentStatusStat[];
  paymentStats: PaymentStat[];
}