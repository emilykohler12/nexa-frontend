export const appointmentStatus = {
  confirmed:  { label: "Confirmado",  color: "#069494" },
  pending:    { label: "Pendiente",   color: "#d4af37" },
  cancelled:  { label: "Cancelado",   color: "#e57373" },
  finished:   { label: "Finalizado",  color: "#4caf50" },
  noShow:     { label: "No asistió",  color: "#9e9e9e" },
} as const;

export type AppointmentStatus = keyof typeof appointmentStatus;