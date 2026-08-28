export type AppointmentStatus = 'confirmed' | 'pending' | 'finished' | 'cancelled' | 'no_show'
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
  accompanied:      boolean
  companionName:    string | null
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
  paymentStatus:  PaymentStatus
  internalNotes:  string
  isSimultaneous: boolean
  details?:       AppointmentDetails | null
  comboGroupId?:  string | null
  // Solo para turnos de un servicio especial — qué zonas/paquetes eligió el cliente.
  selectedZones?:    { name: string; price: number; duration: number }[]
  selectedPackages?: { name: string; price: number; duration: number }[]
}