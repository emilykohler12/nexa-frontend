export type ActivityLevel   = 'info' | 'warning' | 'error' | 'success'
export type ActivityModule  = 'appointments' | 'clients' | 'professionals' | 'services' | 'store' | 'payments' | 'config' | 'auth' | 'system' | 'jobs' | 'reviews'

export interface ActivityLog {
  id:        string
  timestamp: string        // ISO
  user:      string        // nombre del usuario o 'Sistema'
  action:    string        // descripción breve
  module:    ActivityModule
  level:     ActivityLevel
  detail?:   string        // info adicional opcional
  // Solo para module: 'reviews' — permite aceptar/rechazar el comentario
  // desde acá mismo para que se muestre (o no) en "Opiniones de clientes".
  reviewId?:     string
  reviewStatus?: 'pending' | 'approved' | 'rejected'
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
  system:        'Sistema',
  jobs:          'Postulaciones',
  reviews:       'Reseñas',
}

export const ACTIVITY_LEVEL_CONFIG: Record<ActivityLevel, { label: string; color: string }> = {
  info:    { label: 'Info',      color: '#069494' },
  success: { label: 'Éxito',     color: '#4caf50' },
  warning: { label: 'Aviso',     color: '#d4af37' },
  error:   { label: 'Error',     color: '#e53935' },
}

// Colores por tipo de evento — más específico que el nivel genérico, así se
// distingue de un vistazo un turno nuevo de uno cancelado, de una compra, etc.
const MODULE_COLOR: Partial<Record<ActivityModule, string>> = {
  clients:       '#5c6bc0', // índigo
  professionals: '#8e24aa', // violeta
  services:      '#0097a7', // celeste
  payments:      '#d4af37', // dorado (marca)
  config:        '#8d6e63', // marrón
  auth:          '#607d8b', // gris azulado
  system:        '#546e7a', // gris oscuro
  jobs:          '#00897b', // verde azulado
  reviews:       '#d4af37', // dorado (marca)
}

export function getActivityColor(log: Pick<ActivityLog, 'module' | 'action' | 'level'>): string {
  const action = log.action?.toLowerCase() ?? ''

  if (log.module === 'appointments') {
    if (action.includes('cancel'))               return '#e53935' // rojo
    if (action.includes('reprogram'))             return '#1b5e20' // verde oscuro
    if (action.includes('nuevo') || action.includes('reserv')) return '#43a047' // verde
    return '#069494'
  }

  if (log.module === 'store') {
    if (action.includes('compra'))  return '#f57c00' // naranja
    if (action.includes('stock'))   return '#ef6c00'
    return '#fb8c00'
  }

  return MODULE_COLOR[log.module] ?? ACTIVITY_LEVEL_CONFIG[log.level].color
}
