// ============================================================
// TenantContext — provee los datos del negocio a toda la app
// Base estática en app/data/tenant/, con overrides en vivo desde
// /api/business/public (lo que el admin edita en Configuración).
// Si ese endpoint todavía no existe en el backend, se usa solo la base
// estática — la home nunca se rompe por esto.
// ============================================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Business } from './types';
import { tenantConfig } from '@/app/config/tenant.config';
import { api } from '@/shared/utils/api';

interface TenantContextValue {
  business: Business | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue>({
  business: null,
  loading: true,
  error: null,
});

interface PublicBusinessOverride {
  name?:        string;
  logo?:        string | null;
  description?: string | null;
  address?:     string;
  phone?:       string;
  email?:       string;
  socials?: {
    instagram?: string | null;
    facebook?:  string | null;
    whatsapp?:  string | null;
    twitter?:   string | null;
    tiktok?:    string | null;
  };
  policies?: string[];
  schedule?: string;
}

function applyOverride(base: Business, override: PublicBusinessOverride): Business {
  return {
    ...base,
    name:      override.name ?? base.name,
    logo:      override.logo ?? base.logo,
    whatsapp:  override.socials?.whatsapp ?? base.whatsapp,
    instagram: override.socials?.instagram ?? base.instagram,
    facebook:  override.socials?.facebook  ?? base.facebook,
    twitter:   override.socials?.twitter   ?? base.twitter,
    tiktok:    override.socials?.tiktok    ?? base.tiktok,
    // La descripción del admin va a "Nuestra Historia" (Nosotros), no al footer —
    // el slogan del footer se mantiene fijo.
    aboutText: override.description
      ? override.description.split('\n').map(l => l.trim()).filter(Boolean)
      : base.aboutText,
    contactInfo: {
      ...base.contactInfo,
      address:  override.address  ?? base.contactInfo.address,
      phone:    override.phone    ?? base.contactInfo.phone,
      email:    override.email    ?? base.contactInfo.email,
      schedule: override.schedule ?? base.contactInfo.schedule,
    },
    policies: override.policies?.length ? override.policies : base.policies,
  };
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error]                 = useState<string | null>(null);

  useEffect(() => {
    // Base estática desde app/data/tenant/
    setBusiness(tenantConfig);

    document.documentElement.style.setProperty('--tenant-primary', tenantConfig.primaryColor);
    document.documentElement.style.setProperty('--tenant-accent',  tenantConfig.accentColor);

    setLoading(false);

    // Overrides en vivo — lo que el admin guardó en Configuración.
    // Si el endpoint no existe todavía (404) o falla, se ignora en silencio.
    api.get<{ business: PublicBusinessOverride }>('/api/business/public')
      .then(res => {
        setBusiness(prev => prev ? applyOverride(prev, res.data.business) : prev);
      })
      .catch(() => { /* backend sin este endpoint todavía — se usa la base estática */ });
  }, []);

  return (
    <TenantContext.Provider value={{ business, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant debe usarse dentro de <TenantProvider>');
  return ctx;
}
