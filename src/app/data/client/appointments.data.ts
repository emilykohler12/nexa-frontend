import type { AppointmentStatus } from "@/app/data/shared/status.data";

export interface Appointment {
  id: string
  serviceName: string
  professionalName: string
  date: string
  time: string
  duration: number
  price: number
  status: AppointmentStatus
}

// Ejemplo — reemplazar por fetch real al backend
export const mockAppointments: Appointment[] = [
  { id: "a1", serviceName: "Corte y peinado", professionalName: "Lucía Martínez", date: "2026-07-10", time: "10:00", duration: 60, price: 4500, status: "confirmed" },
  { id: "a2", serviceName: "Manicura", professionalName: "Sofía López", date: "2026-07-15", time: "14:30", duration: 30, price: 2000, status: "pending" },
  { id: "a3", serviceName: "Limpieza facial", professionalName: "Lucía Martínez", date: "2026-06-20", time: "11:00", duration: 45, price: 3500, status: "finished" },
  { id: "a4", serviceName: "Manicura", professionalName: "Sofía López", date: "2026-06-10", time: "09:00", duration: 30, price: 2000, status: "cancelled" },
];