//src/features/professional/utils/appointmentStatus.ts

import type { AppointmentStatus } from '@/features/professional/types/appointment'

export const appointmentStatusConfig: Record<AppointmentStatus, { label: string; bg: string; color: string }> = {
  confirmed:  { label: 'Confirmado',  bg: '#dcfce7', color: '#16a34a' },
  pending:    { label: 'Pendiente',   bg: '#fef9c3', color: '#ca8a04' },
  finished:   { label: 'Finalizado',  bg: '#f3f4f6', color: '#6b7280' },
  cancelled:  { label: 'Cancelado',   bg: '#fee2e2', color: '#dc2626' },
  cancelled_no_show:    { label: 'No asistió',  bg: '#fff7ed', color: '#ea580c' },
  no_show_auto:         { label: 'No asistió (automático)', bg: '#fef3c7', color: '#b45309' },
}

// Un turno "cancelado" por falta de pago nunca llegó a confirmarse — mostrarlo
// como "Cancelado" a secas hace pensar que el cliente/staff lo canceló a propósito.
// RF-02 — 'pending_deposit' (displayStatus del backend) = confirmado con la seña sin pagar.
// `statusLabel` es la etiqueta que arma el backend para el estado visible: si viene, manda sobre
// la de este mapa (así un estado nuevo del servidor no queda con la etiqueta cruda).
export function getAppointmentStatusConfig(status: AppointmentStatus, cancelReason?: string | null, displayStatus?: string | null, statusLabel?: string | null) {
  if (status === 'cancelled' && cancelReason === 'unpaid_expired') {
    return { label: 'No se pagó a tiempo', bg: '#f3f4f6', color: '#6b7280' }
  }
  if (displayStatus === 'pending_deposit') {
    return { label: statusLabel || 'Pendiente de seña', bg: '#fef9c3', color: '#ca8a04' }
  }
  const config = appointmentStatusConfig[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' }
  return statusLabel ? { ...config, label: statusLabel } : config
}

// Estados en los que el turno se dio por no asistido (por el sistema o por el personal).
export const NO_SHOW_STATUSES: readonly AppointmentStatus[] = ['no_show_auto', 'cancelled_no_show']
export const isNoShowStatus = (status: string): boolean => (NO_SHOW_STATUSES as readonly string[]).includes(status)
