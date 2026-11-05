export type ClientGender = 'female' | 'male' | 'other' | 'prefer_not_to_say'
export type AppointmentHistoryStatus = 'confirmed' | 'finished' | 'cancelled' | 'cancelled_no_show' | 'no_show_auto'

export interface ClientClinical {
  allergies: string
  preferences: string
  observations: string
}

// Solo cuenta los turnos finalizados (lo calcula el backend).
export interface ClientVisits {
  totalVisits: number
  totalSpent: number
  lastVisit: string | null
}

export interface AdminClient {
  id: string
  name: string
  photo: string | null
  phone: string
  email: string
  gender: ClientGender | null
  clinical: ClientClinical
  visits: ClientVisits
  createdAt: string
  blocked?: boolean
}

export interface ClientAppointmentHistory {
  id: string
  clientId: string
  service: string
  professional: string
  date: string
  time: string
  price: number
  status: AppointmentHistoryStatus
  cancelReason?: string | null
}
