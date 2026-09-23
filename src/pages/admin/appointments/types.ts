// ============================================================
// TIPOS — Módulo de turnos del admin
// Re-exporta desde app/data para mantener una sola fuente de verdad
// ============================================================

export type {
  CalendarAppointment as Appointment,
  CalendarProfessional as Professional,
  AppointmentStatus,
  BalancePaymentMethod,
  BalancePayment,
} from '@/app/data/admin/calendar.data';