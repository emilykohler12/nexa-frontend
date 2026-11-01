// src/features/client/appointments/pendingReminderLink.ts
//
// Cuando alguien sin sesión toca un botón del mail de recordatorio (/mis-turnos?turno=…&accion=…), lo mandamos a
// iniciar sesión y dejamos esta marca: apenas entra, lo devolvemos al mismo enlace. Se guarda solo el id y la acción
// (ya validados) y vence a la hora, así un enlace viejo no reaparece en un login posterior.
import { parseReminderLink, type ReminderLink } from './reminderLink'

export const PENDING_REMINDER_LINK_KEY = 'nexa_pending_reminder_link'
const MAX_AGE_MS = 60 * 60 * 1000

export function setPendingReminderLink(link: ReminderLink, now: number = Date.now()) {
  try { sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, JSON.stringify({ ...link, at: now })) } catch { /* almacenamiento no disponible */ }
}

// Devuelve el enlace guardado (y lo borra) o null. Siempre se consume: un enlace que no se usa no queda para después.
export function consumePendingReminderLink(now: number = Date.now()): ReminderLink | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_REMINDER_LINK_KEY)
    const saved = JSON.parse(raw) as { turno?: string; accion?: string; at?: number }
    if (typeof saved.at !== 'number' || now - saved.at > MAX_AGE_MS) return null
    return parseReminderLink(new URLSearchParams({ turno: saved.turno ?? '', accion: saved.accion ?? '' }))
  } catch {
    return null
  }
}
