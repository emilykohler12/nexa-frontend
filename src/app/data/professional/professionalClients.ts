import type { ProfessionalClient } from '@/features/professional/types/client'

// Datos de ejemplo — reemplazar por fetch real al backend
export const mockClients: ProfessionalClient[] = [
  {
    id: 'c1', name: 'María García', email: 'maria@gmail.com', phone: '+54 376 401-2345',
    photo: null, allergies: 'Alérgica al amoniaco', preferences: 'Prefiere corte en capas',
    cancellations: 1, nextAppointment: new Date().toISOString().split('T')[0],
    visits: [
      { id: 'v1', date: '2026-06-01', serviceName: 'Corte y peinado', price: 4500, notes: '' },
      { id: 'v2', date: '2026-05-01', serviceName: 'Corte y peinado', price: 4000, notes: '' },
      { id: 'v3', date: '2026-04-01', serviceName: 'Coloración', price: 7500, notes: 'Primera vez con mechas' },
    ],
  },
  {
    id: 'c2', name: 'Sofía Medina', email: 'sofia@gmail.com', phone: '+54 376 433-1122',
    photo: null, allergies: '', preferences: 'Balayage natural',
    cancellations: 0, nextAppointment: new Date().toISOString().split('T')[0],
    visits: [
      { id: 'v4', date: '2026-06-15', serviceName: 'Coloración', price: 8000, notes: '' },
      { id: 'v5', date: '2026-03-10', serviceName: 'Tratamiento capilar', price: 4500, notes: '' },
    ],
  },
  {
    id: 'c3', name: 'Carolina Fernández', email: 'carolina@gmail.com', phone: '+54 376 412-3456',
    photo: null, allergies: '', preferences: '',
    cancellations: 2, nextAppointment: null,
    visits: [
      { id: 'v6', date: '2026-05-20', serviceName: 'Corte y peinado', price: 4500, notes: '' },
    ],
  },
]