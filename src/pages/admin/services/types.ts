//src/pages/admin/services/types.ts

export type ServiceStatus = 'active' | 'inactive';

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
}

export type ServiceFormValues = Omit<AdminService, 'id'>;