//src/features/professional/utils/appointmentStatus.ts

import type { AppointmentStatus } from '@/features/professional/types/appointment'

export const appointmentStatusConfig: Record<AppointmentStatus, { label: string; bg: string; color: string }> = {
  confirmed:  { label: 'Confirmado',  bg: '#dcfce7', color: '#16a34a' },
  pending:    { label: 'Pendiente',   bg: '#fef9c3', color: '#ca8a04' },
  finished:   { label: 'Finalizado',  bg: '#f3f4f6', color: '#6b7280' },
  cancelled:  { label: 'Cancelado',   bg: '#fee2e2', color: '#dc2626' },
  no_show:    { label: 'No asistió',  bg: '#fff7ed', color: '#ea580c' },
}