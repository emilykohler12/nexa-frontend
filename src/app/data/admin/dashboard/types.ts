// ============================================================
// TIPOS — Dashboard admin
// Compartidos entre los archivos de datos y los componentes
// ============================================================

export interface RevenueDataPoint {
  label: string;
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
  prevRevenue: number;
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

export type PeriodFilter = 'day' | 'week' | 'month' | 'year';