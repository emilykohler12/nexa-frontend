// src/app/config/routes.config.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  CLIENT:              '/client',
  CLIENT_APPOINTMENTS: '/client/appointments',
  CLIENT_BOOK:         '/client/book',
  CLIENT_PROFILE:      '/client/profile',
  CLIENT_FAVORITES:    '/client/favorites',

  PROFESSIONAL:               '/professional',
  PROFESSIONAL_PANEL:         '/professional/panel',
  PROFESSIONAL_AGENDA:        '/professional/agenda',
  PROFESSIONAL_CLIENTS:       '/professional/clients',
  PROFESSIONAL_SERVICES:      '/professional/services',
  PROFESSIONAL_SCHEDULE:      '/professional/schedule',
  PROFESSIONAL_NOTIFICATIONS: '/professional/notifications',
  PROFESSIONAL_SETTINGS:      '/professional/settings',
  PROFESSIONAL_ONBOARDING:    '/professional/onboarding',
  PROFESSIONAL_STATISTICS:    '/professional/statistics',

  ADMIN:               '/admin',
  ADMIN_DASHBOARD:     '/admin/dashboard',
  ADMIN_APPOINTMENTS:  '/admin/appointments',
  ADMIN_SERVICES:      '/admin/services',
  ADMIN_STORE:         '/admin/store',
  ADMIN_CLIENTS:       '/admin/clients',
  ADMIN_PROFESSIONALS: '/admin/professionals',
  ADMIN_ACTIVITY:      '/admin/activity',
  ADMIN_SETTINGS:      '/admin/settings',
} as const