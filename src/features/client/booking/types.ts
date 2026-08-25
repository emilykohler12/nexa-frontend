//src/features/client/booking/types.ts

export type BookingStep = 'service' | 'professional' | 'datetime' | 'confirmation'

export interface BookingSelection {
  serviceId: string | null
  professionalId: string | null
  date: string | null
  time: string | null
}

export const EMPTY_BOOKING: BookingSelection = {
  serviceId: null,
  professionalId: null,
  date: null,
  time: null,
}

export const BOOKING_STEPS: { id: BookingStep; label: string }[] = [
  { id: 'service', label: 'Servicio' },
  { id: 'professional', label: 'Profesional' },
  { id: 'datetime', label: 'Fecha' },
  { id: 'confirmation', label: 'Confirmar' },
]