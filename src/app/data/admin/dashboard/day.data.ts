import type { DashboardData } from './types';

export const dayData: DashboardData = {
  totalRevenue: 9000,     prevRevenue: 7500,
  totalAppointments: 6,   prevAppointments: 5,
  newClients: 2,          prevNewClients: 1,
  avgTicket: 1500,        prevAvgTicket: 1500,
  revenueChart: [
    { label: '08:00', revenue: 0,    appointments: 0 },
    { label: '09:00', revenue: 5000, appointments: 1 },
    { label: '10:00', revenue: 3000, appointments: 2 },
    { label: '11:00', revenue: 0,    appointments: 0 },
    { label: '12:00', revenue: 8000, appointments: 1 },
    { label: '13:00', revenue: 0,    appointments: 0 },
    { label: '14:00', revenue: 4500, appointments: 1 },
    { label: '15:00', revenue: 6000, appointments: 1 },
    { label: '16:00', revenue: 0,    appointments: 0 },
    { label: '17:00', revenue: 0,    appointments: 0 },
  ],
  serviceStats: [
    { name: 'Corte y peinado', count: 2, revenue: 10000, color: '#069494' },
    { name: 'Manicura',        count: 2, revenue: 6000,  color: '#e57373' },
    { name: 'Coloración',      count: 1, revenue: 8000,  color: '#7986cb' },
    { name: 'Pedicura',        count: 1, revenue: 3500,  color: '#f06292' },
  ],
  professionalStats: [
    { name: 'Ana López',    appointments: 2, revenue: 10000, cancellations: 0, color: '#d4af37' },
    { name: 'María García', appointments: 2, revenue: 6000,  cancellations: 0, color: '#e57373' },
    { name: 'Laura Pérez',  appointments: 1, revenue: 8000,  cancellations: 0, color: '#7986cb' },
    { name: 'Sofía Ruiz',   appointments: 1, revenue: 4500,  cancellations: 0, color: '#4db6ac' },
  ],
  appointmentStatus: [
    { status: 'confirmed', label: 'Confirmados', count: 5, color: '#069494' },
    { status: 'pending',   label: 'Pendientes',  count: 1, color: '#d4af37' },
    { status: 'cancelled', label: 'Cancelados',  count: 0, color: '#e57373' },
    { status: 'no_show',   label: 'No asistió',  count: 0, color: '#90a4ae' },
  ],
  paymentStats: [
    { label: 'Señas cobradas',   amount: 6000, color: '#069494' },
    { label: 'Señas pendientes', amount: 1500, color: '#d4af37' },
    { label: 'Señas devueltas',  amount: 0,    color: '#e57373' },
  ],
};