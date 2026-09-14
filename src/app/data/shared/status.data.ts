export const appointmentStatus = {
  confirmed:  { label: "Confirmado",  color: "#069494" },
  pending:    { label: "Pendiente",   color: "#d4af37" },
  cancelled:  { label: "Cancelado",   color: "#e57373" },
  finished:   { label: "Finalizado",  color: "#4caf50" },
  noShow:     { label: "No asistió",  color: "#9e9e9e" },
} as const;

export type AppointmentStatus = keyof typeof appointmentStatus;

// Un turno "cancelado" por falta de pago nunca llegó a confirmarse de verdad —
// mostrarlo como "Cancelado" a secas hace pensar que alguien lo canceló a
// propósito. `cancelReason` viene del backend (releaseUnpaidAppointments.job.ts).
export function getAppointmentStatusDisplay(status: AppointmentStatus, cancelReason?: string | null) {
  if (status === 'cancelled' && cancelReason === 'unpaid_expired') {
    return { label: 'No se pagó a tiempo', color: '#9e9e9e' };
  }
  return appointmentStatus[status];
}