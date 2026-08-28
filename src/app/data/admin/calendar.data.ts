// ============================================================
// TIPOS — Calendario de turnos (admin)
// ============================================================

export type AppointmentStatus = 'confirmed' | 'pending' | 'finished' | 'cancelled' | 'no_show';

export interface CalendarProfessional {
  id: string;
  name: string;
  color: string;
}

export interface DesignPreference {
  type:  'image' | 'text';
  value: string | null;
}

// Info que el cliente carga al reservar — alergias del turno, si viene
// acompañado y el diseño que quiere hacerse (si aplica al servicio).
export interface AppointmentDetails {
  allergies:        string | null;
  accompanied:      boolean;
  companionName:    string | null;
  designPreference: DesignPreference | null;
  hasOtherSalonPolish?:     boolean | null;
  isNailReconstruction?:    boolean | null;
  nailReconstructionCount?: number | null;
  hairLength?:      string | null;
  wantsExtensions?: boolean | null;
  skinType?:        string | null;
}

export interface CalendarAppointment {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  start: string;
  end: string;
  status: AppointmentStatus;
  clientNotes?: string;
  professionalNotes?: string;
  backgroundColor?: string;
  borderColor?: string;
  details?: AppointmentDetails | null;
  comboGroupId?: string | null;
  // Solo para turnos de un servicio especial — qué zonas/paquetes eligió el cliente.
  selectedZones?: { name: string; price: number; duration: number }[];
  selectedPackages?: { name: string; price: number; duration: number }[];
}

