import type { CompanionRelation } from '@/shared/utils/companion'
// 'no_show_auto' ("No asistió (automático)") lo asigna solo el sistema; 'cancelled_no_show' ("No asistió") lo marca el personal.
export type AppointmentStatus = 'confirmed' | 'pending' | 'finished' | 'cancelled' | 'cancelled_no_show' | 'no_show_auto'
export type PaymentStatus     = 'pending' | 'partial' | 'paid' | 'refunded'

export interface AppointmentClient {
  id:       string
  name:     string
  phone:    string
  email:    string
  photo:    string | null
  allergies: string
  notes:    string
}

export interface DesignPreference {
  type:  'image' | 'text'
  value: string | null
}

// Info que el cliente carga al reservar — alergias del turno, si viene
// acompañado y el diseño que quiere hacerse (si aplica al servicio).
export interface AppointmentDetails {
  allergies:        string | null
  hasCompanion:      boolean
  companionRelation: CompanionRelation | null
  designPreference: DesignPreference | null
  hasOtherSalonPolish?:     boolean | null
  isNailReconstruction?:    boolean | null
  nailReconstructionCount?: number | null
  hairLength?:      string | null
  wantsExtensions?: boolean | null
  skinType?:        string | null
}

export interface Appointment {
  id:             string
  client:         AppointmentClient
  serviceName:    string
  servicePrice:   number
  duration:       number
  date:           string
  time:           string
  status:         AppointmentStatus
  cancelReason?:  string | null
  displayStatus?: string
  // Etiqueta del estado visible armada por el backend (ej: «No asistió (automático)»).
  statusLabel?:   string
  paymentStatus:  PaymentStatus
  // Cuándo se registró que la clienta llegó al local — la propia clienta desde su
  // app, o la profesional por ella. En null y pasados más de 30 min de la hora
  // pactada, el turno se marca 'no_show_auto' solo (ver autoNoShow.job.ts en el backend).
  arrivedAt?:     string | null
  internalNotes:  string
  isSimultaneous: boolean
  // Las otras profesionales del combo simultáneo, con su servicio, duración y precio.
  simultaneousWith?: { appointmentId: string; serviceName: string; professionalId: string; professionalName: string; duration: number; price: number }[]
  details?:       AppointmentDetails | null
  comboGroupId?:  string | null
  // Solo para turnos de un servicio especial — qué zonas/paquetes eligió el cliente.
  selectedZones?:    { name: string; price: number; duration: number }[]
  selectedPackages?: { name: string; price: number; duration: number }[]
}