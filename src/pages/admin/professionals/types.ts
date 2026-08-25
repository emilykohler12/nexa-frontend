//src/pages/admin/professionals/types.ts

export type ProfessionalStatus = 'active' | 'inactive' | 'vacation';
export type ProfessionalRole   = 'professional' | 'admin';
export type CommissionType     = 'earned' | 'to_owner';
// 'earned'   → el profesional SE QUEDA X% (comisión tradicional)
// 'to_owner' → el profesional LE DA X% al negocio (caso Loren: 20%)

export interface SocialLinks {
  instagram: string | null;
  facebook:  string | null;
  tiktok:    string | null;
  twitter:   string | null;
  [key: string]: string | null
}

export interface AdminProfessional {
  id:             string;
  name:           string;
  photo:          string | null;
  specialty:      string;
  services:       string[];   // ids de servicios activos asignados
  commissionType: CommissionType;
  commissionPct:  number;
  status:         ProfessionalStatus;
  role:           ProfessionalRole;
  phone:          string;
  email:          string;
  socials:        SocialLinks;
  schedule: {
    monday:    { start: string; end: string } | null;
    tuesday:   { start: string; end: string } | null;
    wednesday: { start: string; end: string } | null;
    thursday:  { start: string; end: string } | null;
    friday:    { start: string; end: string } | null;
    saturday:  { start: string; end: string } | null;
    sunday:    { start: string; end: string } | null;
  };
  daysOff:       string[];
  vacationFrom:  string | null;
  vacationTo:    string | null;
  createdAt:     string;       // ISO — para calcular métricas "desde el inicio"
  metrics: {
    totalAppointments: number; // total desde createdAt
    totalClients:      number;
    totalRevenue:      number; // facturación desde createdAt
    rating:            number; // promedio de reseñas de clientes
  };
}

export interface ProfessionalAppointmentHistory {
  id:         string;
  service:    string;
  client:     string;
  date:       string;
  time:       string;
  price:      number;
  status:     'finished';
}

export interface InvitationLink {
  id:        string;
  email:     string;
  token:     string;
  expiresAt: string;
  used:      boolean;
  createdAt: string;
}