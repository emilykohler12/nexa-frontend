// ============================================================
// TENANT CONFIG — ensamblado del negocio desde app/data
// Cambiar datos: editar los archivos en app/data/tenant/
// ============================================================

import { tenant }                        from '@/app/data/tenant/tenant.data';
import { navigation }                    from '@/app/data/tenant/navigation.data';
import { testimonials }                  from '@/app/data/tenant/testimonials.data';
import { TENANT_SERVICES }               from '@/app/data/tenant/services.data'
import { professionals }                 from '@/app/data/tenant/professionals.data';
import { products }                      from '@/app/data/tenant/products.data';
import { about }                         from '@/app/data/tenant/about.data';
import { contact }                       from '@/app/data/tenant/contact.data';
import { policies }                      from '@/app/data/tenant/policies.data';
import { statistics }                    from '@/app/data/tenant/statistics.data';
import type { Business }                 from '@/features/tenant/types';

// Ensambla todos los datos sueltos en un objeto Business completo
export const tenantConfig: Business = {
  name:             tenant.name,
  logo:             tenant.logo,
  heroImage:        tenant.heroImage,
  heroTitle:        tenant.heroTitle,
  heroSubtitle:     tenant.heroSubtitle,
  heroSubtitle2:    tenant.heroSubtitle2,
  primaryColor:     tenant.primaryColor,
  accentColor:      tenant.accentColor,
  whatsapp:         tenant.whatsapp,
  instagram:        tenant.instagram,
  facebook:         tenant.facebook,
  twitter:          tenant.twitter,
  tiktok:           tenant.tiktok,
  ubicacion:        tenant.ubicacion,
  footer:           { slogan: tenant.slogan, copyright: tenant.copyright },
  kologic:          tenant.kologic,
  stats:            statistics,
  testimonials,
  nav:              navigation,
  servicesTitle:    TENANT_SERVICES.title,
  servicesSubtitle: TENANT_SERVICES.subtitle,
  services:         TENANT_SERVICES.items,
  serviceCategories: TENANT_SERVICES.categories,
  professionalsTitle:    'Nuestro Equipo',
  professionalsSubtitle: 'Profesionales capacitadas y apasionadas por la belleza',
  professionals,
  tiendaTitle:    'Nuestra Tienda',
  tiendaSubtitle: 'Productos profesionales para cuidar tu belleza en casa',
  products,
  nosotrosTitle:    about.title,
  nosotrosSubtitle: 'Conocé más sobre nosotros',
  aboutText:        about.paragraphs,
  values:           about.values,
  contactInfo:      contact,
  policies,
};

// TODO backend: reemplazar por fetch(`/api/tenants/${appConfig.tenantSlug}`)
export function getActiveTenant() {
  return tenant;
}

