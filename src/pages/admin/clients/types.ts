export type ClientGender = 'female' | 'male' | 'other' | 'prefer_not_to_say'
export type AppointmentHistoryStatus = 'confirmed' | 'finished' | 'cancelled' | 'no_show'

export interface ClientClinical {
  allergies: string
  preferences: string
  observations: string
}

export interface ClientLoyalty {
  totalVisits: number
  totalSpent: number
  lastVisit: string | null
  points: number
  availablePromos: string[]
}

export interface AdminClient {
  id: string
  name: string
  photo: string | null
  phone: string
  email: string
  birthDate: string | null
  gender: ClientGender | null
  clinical: ClientClinical
  loyalty: ClientLoyalty
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
}
