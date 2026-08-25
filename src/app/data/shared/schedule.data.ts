// ============================================================
// HORARIOS — horarios generales del negocio
// ============================================================

export interface ScheduleDay {
  day: string;
  label: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export const businessSchedule: ScheduleDay[] = [
  { day: 'monday',    label: 'Lunes',     open: '09:00', close: '20:00', isOpen: true  },
  { day: 'tuesday',   label: 'Martes',    open: '09:00', close: '20:00', isOpen: true  },
  { day: 'wednesday', label: 'Miércoles', open: '09:00', close: '20:00', isOpen: true  },
  { day: 'thursday',  label: 'Jueves',    open: '09:00', close: '20:00', isOpen: true  },
  { day: 'friday',    label: 'Viernes',   open: '09:00', close: '20:00', isOpen: true  },
  { day: 'saturday',  label: 'Sábado',    open: '09:00', close: '18:00', isOpen: true  },
  { day: 'sunday',    label: 'Domingo',   open: '00:00', close: '00:00', isOpen: false },
];

// Bloque mínimo de reserva en minutos
export const SLOT_DURATION = 60;

// Hora de apertura y cierre por defecto (para el calendario)
export const CALENDAR_START = '08:00';
export const CALENDAR_END   = '21:00';