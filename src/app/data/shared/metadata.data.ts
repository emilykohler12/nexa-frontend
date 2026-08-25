// ============================================================
// METADATA — títulos y descripciones de páginas
// Usado para <title> y meta description
// ============================================================

export const pageMetadata = {
  home:          { title: 'Inicio',           description: 'Bienvenida al estudio' },
  services:      { title: 'Servicios',         description: 'Todos nuestros servicios' },
  professionals: { title: 'Profesionales',     description: 'Nuestro equipo' },
  store:         { title: 'Tienda',            description: 'Productos disponibles' },
  about:         { title: 'Nosotros',          description: 'Conocé más sobre nosotros' },
  login:         { title: 'Iniciar sesión',    description: 'Accedé a tu cuenta' },
  adminDashboard:{ title: 'Dashboard',         description: 'Métricas del negocio' },
  adminCalendar: { title: 'Turnos',            description: 'Gestión de turnos' },
} as const;

export type PageKey = keyof typeof pageMetadata;