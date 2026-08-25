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
}

export type ServiceFormValues = Omit<AdminService, 'id'>;