export interface BusinessSettings {
  name: string;
  logo: string | null;
  description: string;
  address: string;
  phone: string;
  email: string;
  socials: {
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    twitter: string | null;
  };
  policies: string[];
}

export interface ScheduleDay {
  day: string;
  label: string;
  isOpen: boolean;
  open: string;
  close: string;
}

export interface Holiday {
  id: string;
  date: string;
  description: string;
}

export interface PaymentSettings {
  depositAmount: number;
  depositPercent: boolean;
  cancellationHours: number;
  refundPolicy: 'full' | 'partial' | 'none';
}
