export type ActivityLevel   = 'info' | 'warning' | 'error' | 'success'
export type ActivityModule  = 'appointments' | 'clients' | 'professionals' | 'services' | 'store' | 'payments' | 'config' | 'auth' | 'chatbot' | 'system'

export interface ActivityLog {
  id:        string
  timestamp: string        // ISO
  user:      string        // nombre del usuario o 'Sistema'
  action:    string        // descripción breve
  module:    ActivityModule
  level:     ActivityLevel
  detail?:   string        // info adicional opcional
}

export const ACTIVITY_MODULE_LABEL: Record<ActivityModule, string> = {
  appointments:  'Turnos',
  clients:       'Clientes',
  professionals: 'Profesionales',
  services:      'Servicios',
  store:         'Tienda',
  payments:      'Pagos',
  config:        'Configuración',
  auth:          'Sesiones',
  chatbot:       'Chatbot',
  system:        'Sistema',
}

export const ACTIVITY_LEVEL_CONFIG: Record<ActivityLevel, { label: string; color: string }> = {
  info:    { label: 'Info',      color: '#069494' },
  success: { label: 'Éxito',     color: '#4caf50' },
  warning: { label: 'Aviso',     color: '#d4af37' },
  error:   { label: 'Error',     color: '#e53935' },
}
