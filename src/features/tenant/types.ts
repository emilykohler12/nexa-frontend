// ============================================================
// TIPOS — Tenant (negocio)
// Deben coincidir exactamente con tenant.data.ts
// ============================================================

export interface Business {
  name: string;
  logo: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSubtitle2: string;
  primaryColor: string;
  accentColor: string;
  whatsapp: string;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  tiktok: string | null;
  ubicacion: string | null;
  footer: { slogan: string; copyright: string };
  stats: { label: string; value: number; suffix?: string }[];
  testimonials: { name: string; stars: number; comment: string }[];
  nav: { id: string; label: string }[];
  kologic: { logo: string; email: string };
  servicesTitle: string;
  servicesSubtitle: string;
  serviceCategories: ServiceCategory[];
  services: Service[];
  professionalsTitle: string;
  professionalsSubtitle: string;
  professionals: Professional[];
  tiendaTitle: string;
  tiendaSubtitle: string;
  products: Product[];
  nosotrosTitle: string;
  nosotrosSubtitle: string;
  aboutText: string[];
  values: BusinessValue[];
  contactInfo: ContactInfo;
  policies: string[];
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  instagram: string | null;
  services: string[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  inStock: boolean;
}

export interface BusinessValue {
  icon: 'shield' | 'heart' | 'users' | 'award';
  title: string;
  desc: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  schedule: string;
}