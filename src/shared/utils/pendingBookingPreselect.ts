// src/shared/utils/pendingBookingPreselect.ts
//
// Cuando un visitante sin sesión toca "Reservar turno" desde la ficha de un
// servicio o de un profesional en el home, lo mandamos a loguearse/registrarse
// y guardamos acá qué había elegido — así, apenas entra, lo llevamos directo
// al wizard de reserva con eso precargado en vez de a "Mis turnos".
const KEY = 'nexa_pending_booking_preselect'

export interface BookingPreselect {
  serviceId?:      string
  professionalId?: string
}

export function setPendingBookingPreselect(preselect: BookingPreselect) {
  try { sessionStorage.setItem(KEY, JSON.stringify(preselect)) } catch { /* almacenamiento no disponible */ }
}

export function consumePendingBookingPreselect(): BookingPreselect | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    sessionStorage.removeItem(KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}
