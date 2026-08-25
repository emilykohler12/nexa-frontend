import type { DashboardData } from './types';

export const monthData: DashboardData = {
  totalRevenue: 156000,    prevRevenue: 132000,
  totalAppointments: 98,   prevAppointments: 84,
  newClients: 22,          prevNewClients: 18,
  avgTicket: 1591,         prevAvgTicket: 1571,
  revenueChart: [
    { label: 'Sem 1', revenue: 32000, appointments: 20 },
    { label: 'Sem 2', revenue: 41000, appointments: 26 },
    { label: 'Sem 3', revenue: 45000, appointments: 28 },
    { label: 'Sem 4', revenue: 38000, appointments: 24 },
  ],
  serviceStats: [
    { name: 'Coloración',          count: 24, revenue: 192000, color: '#7986cb' },
    { name: 'Corte y peinado',     count: 32, revenue: 160000, color: '#069494' },
    { name: 'Manicura',            count: 20, revenue: 60000,  color: '#e57373' },
    { name: 'Maquillaje',          count: 12, revenue: 72000,  color: '#a1887f' },
    { name: 'Pedicura',            count: 16, revenue: 56000,  color: '#f06292' },
    { name: 'Depilación',          count: 8,  revenue: 32000,  color: '#90a4ae' },
    { name: 'Tratamiento capilar', count: 12, revenue: 54000,  color: '#4db6ac' },
  ],
  professionalStats: [
    { name: 'Ana López',      appointments: 32, revenue: 160000, cancellations: 3, color: '#d4af37' },
    { name: 'María García',   appointments: 24, revenue: 72000,  cancellations: 1, color: '#e57373' },
    { name: 'Laura Pérez',    appointments: 20, revenue: 160000, cancellations: 3, color: '#7986cb' },
    { name: 'Sofía Ruiz',     appointments: 16, revenue: 72000,  cancellations: 1, color: '#4db6ac' },
    { name: 'Valentina Sosa', appointments: 12, revenue: 42000,  cancellations: 5, color: '#f06292' },
    { name: 'Camila Torres',  appointments: 16, revenue: 96000,  cancellations: 1, color: '#a1887f' },
    { name: 'Lucía Méndez',   appointments: 12, revenue: 48000,  cancellations: 0, color: '#90a4ae' },
    { name: 'Administrador',  appointments: 8,  revenue: 40000,  cancellations: 0, color: '#069494' },
  ],
  appointmentStatus: [
    { status: 'confirmed', label: 'Confirmados', count: 78, color: '#069494' },
    { status: 'pending',   label: 'Pendientes',  count: 10, color: '#d4af37' },
    { status: 'cancelled', label: 'Cancelados',  count: 7,  color: '#e57373' },
    { status: 'no_show',   label: 'No asistió',  count: 3,  color: '#90a4ae' },
  ],
  paymentStats: [
    { label: 'Señas cobradas',   amount: 98000, color: '#069494' },
    { label: 'Señas pendientes', amount: 20000, color: '#d4af37' },
    { label: 'Señas devueltas',  amount: 8000,  color: '#e57373' },
  ],
};