//src/pages/admin/services/types.ts

export type ServiceStatus = 'active' | 'inactive';

// Un horario puntual del servicio especial: hora + quién atiende ese día.
// Una vez que un cliente reserva ese horario, el backend completa
// clientName/appointmentId — el admin no los carga a mano.
export interface SpecialSlot {
  id?: string;
  time: string;
  professionalId: string;
  professionalName?: string;
  active: boolean;
  clientName?: string | null;
  appointmentId?: string | null;
}

export interface ServiceZone {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  zoneIds: string[];
  duration: number;
  price: number;
  active: boolean;
}

export interface AdminService {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  duration: number;
  price: number;
  image: string | null;
  status: ServiceStatus;
  isCombo: boolean;
  // Servicios que componen el combo (ids de otros servicios) y si se pueden
  // realizar en simultáneo con profesionales distintos (ej: cejas + uñas).
  comboServiceIds?: string[];
  simultaneous?: boolean;
  // Servicio especial: un solo día fijo, con horarios puntuales asignados
  // cada uno a un profesional, y precio/duración armados por zonas/paquetes
  // que elige el cliente al reservar (en vez de un precio/duración fijos).
  isSpecial?: boolean;
  specialDate?: string | null;
  specialSlots?: SpecialSlot[];
  zones?: ServiceZone[];
  packages?: ServicePackage[];
}

export type ServiceFormValues = Omit<AdminService, 'id'>;