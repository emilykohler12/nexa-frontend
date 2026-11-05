export const appointmentStatus = {
  confirmed:  { label: "Confirmado",  color: "#069494" },
  pending:    { label: "Pendiente",   color: "#d4af37" },
  cancelled:  { label: "Cancelado",   color: "#e57373" },
  finished:   { label: "Finalizado",  color: "#4caf50" },
  noShow:     { label: "No asistió",  color: "#9e9e9e" },
  // Lo marca solo el sistema (más de 30 minutos sin llegada): el personal puede corregirlo.
  noShowAuto: { label: "No asistió (automático)", color: "#b45309" },
} as const;

export type AppointmentStatus = keyof typeof appointmentStatus;

// "Mis turnos": un turno en «No asistió (automático)» no se cancela ni se reprograma — solo el
// personal puede corregir su estado.
export const NO_SHOW_AUTO_NOTICE =
  'Este turno figura como «No asistió (automático)» porque no se registró tu llegada. No se puede cancelar ni reprogramar. Si viniste, avisale al estudio para que lo corrijan.';

// Estados que manda el backend (columna status) y su clave en el mapa de arriba.
const BACKEND_STATUS_KEY: Record<string, AppointmentStatus> = {
  cancelled_no_show: 'noShow',
  no_show_auto:      'noShowAuto',
};

// Un turno "cancelado" por falta de pago nunca llegó a confirmarse de verdad —
// mostrarlo como "Cancelado" a secas hace pensar que alguien lo canceló a
// propósito. `cancelReason` viene del backend (releaseUnpaidAppointments.job.ts).
//
// RF-02 — `displayStatus` también viene del backend: un turno confirmado cuya
// seña todavía no se pagó llega como 'pending_deposit' ("Pendiente de seña").
//
// `status` puede ser la clave de este mapa o el valor crudo del backend ('cancelled_no_show',
// 'no_show_auto'). `statusLabel` es la etiqueta que arma el backend: si viene, manda sobre la del mapa.
export function getAppointmentStatusDisplay(status: string, cancelReason?: string | null, displayStatus?: string | null, statusLabel?: string | null) {
  if (status === 'cancelled' && cancelReason === 'unpaid_expired') {
    return { label: 'No se pagó a tiempo', color: '#9e9e9e' };
  }
  const key = (BACKEND_STATUS_KEY[status] ?? status) as AppointmentStatus;
  if (displayStatus === 'pending_deposit') {
    return { label: statusLabel || 'Pendiente de seña', color: '#d4af37' };
  }
  const base = appointmentStatus[key] ?? { label: status, color: '#9e9e9e' };
  return statusLabel ? { ...base, label: statusLabel } : base;
}
