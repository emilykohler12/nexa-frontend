import type { DashboardData } from './types';

export const weekData: DashboardData = {
  totalRevenue: 38500,    prevRevenue: 32000,
  totalAppointments: 24,  prevAppointments: 20,
  newClients: 6,          prevNewClients: 4,
  avgTicket: 1604,        prevAvgTicket: 1600,
  revenueChart: [
    { label: 'Lun', revenue: 5000, appointments: 3 },
    { label: 'Mar', revenue: 7500, appointments: 4 },
    { label: 'Mié', revenue: 4000, appointments: 2 },
    { label: 'Jue', revenue: 8000, appointments: 5 },
    { label: 'Vie', revenue: 9000, appointments: 6 },
    { label: 'Sáb', revenue: 5000, appointments: 4 },
    { label: 'Dom', revenue: 0,    appointments: 0 },
  ],
  serviceStats: [
    { name: 'Coloración',          count: 6, revenue: 48000, color: '#7986cb' },
    { name: 'Corte y peinado',     count: 8, revenue: 40000, color: '#069494' },
    { name: 'Manicura',            count: 5, revenue: 15000, color: '#e57373' },
    { name: 'Maquillaje',          count: 3, revenue: 18000, color: '#a1887f' },
    { name: 'Pedicura',            count: 4, revenue: 14000, color: '#f06292' },
    { name: 'Depilación',          count: 2, revenue: 8000,  color: '#90a4ae' },
    { name: 'Tratamiento capilar', count: 3, revenue: 13500, color: '#4db6ac' },
  ],
  professionalStats: [
    { name: 'Ana López',      appointments: 8, revenue: 40000, cancellations: 1, color: '#d4af37' },
    { name: 'María García',   appointments: 6, revenue: 18000, cancellations: 0, color: '#e57373' },
    { name: 'Laura Pérez',    appointments: 5, revenue: 40000, cancellations: 1, color: '#7986cb' },
    { name: 'Sofía Ruiz',     appointments: 4, revenue: 18000, cancellations: 0, color: '#4db6ac' },
    { name: 'Valentina Sosa', appointments: 3, revenue: 10500, cancellations: 2, color: '#f06292' },
    { name: 'Camila Torres',  appointments: 4, revenue: 24000, cancellations: 0, color: '#a1887f' },
    { name: 'Lucía Méndez',   appointments: 3, revenue: 12000, cancellations: 0, color: '#90a4ae' },
    { name: 'Administrador',  appointments: 2, revenue: 10000, cancellations: 0, color: '#069494' },
  ],
  appointmentStatus: [
    { status: 'confirmed', label: 'Confirmados', count: 18, color: '#069494' },
    { status: 'pending',   label: 'Pendientes',  count: 3,  color: '#d4af37' },
    { status: 'cancelled', label: 'Cancelados',  count: 2,  color: '#e57373' },
    { status: 'no_show',   label: 'No asistió',  count: 1,  color: '#90a4ae' },
  ],
  paymentStats: [
    { label: 'Señas cobradas',   amount: 24000, color: '#069494' },
    { label: 'Señas pendientes', amount: 6000,  color: '#d4af37' },
    { label: 'Señas devueltas',  amount: 2000,  color: '#e57373' },
  ],
};