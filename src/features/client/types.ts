//src/features/client/types.ts

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'finished'

export interface Appointment {
  id: string
  serviceName: string
  professionalName: string
  date: string
  time: string
  duration: number
  price: number
  status: AppointmentStatus
}

export type FavoriteType = 'professional' | 'service'

export interface FavoriteItem {
  id: string
  type: FavoriteType
  name: string
  detail: string
}

export interface ClientProfile {
  name: string
  email: string
  phone: string
  photo: string | null
}