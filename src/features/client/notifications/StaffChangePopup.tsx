// Aviso emergente para la clienta: apenas entra a la app se entera de lo que el personal cambió en sus turnos
// (cancelación, reprogramación o cambio de profesional en un combo). Se muestra una sola vez: al cerrarlo, los avisos
// quedan marcados como leídos. No se cierra al tocar afuera; solo con el botón.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarX, CalendarClock, Repeat } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import type { ClientNotification, ClientNotificationType } from './types'

const STAFF_CHANGE_TYPES: ClientNotificationType[] = ['appointment_cancelled', 'appointment_rescheduled', 'professional_changed']

const ICONS = {
  appointment_cancelled:   { icon: CalendarX,     color: '#c62828' },
  appointment_rescheduled: { icon: CalendarClock, color: '#8a6800' },
  professional_changed:    { icon: Repeat,        color: '#069494' },
} as const

export function StaffChangePopup({ primaryColor }: { primaryColor: string }) {
  const navigate = useNavigate()
  const [pending, setPending] = useState<ClientNotification[]>([])

  useEffect(() => {
    let cancelled = false
    api.get<{ notifications: ClientNotification[] }>('/api/client/notifications')
      .then(res => {
        if (cancelled) return
        const unread = (res.data.notifications ?? []).filter(n => !n.read && STAFF_CHANGE_TYPES.includes(n.type))
        setPending(unread)
      })
      .catch(() => { /* sin avisos: no se muestra nada */ })
    return () => { cancelled = true }
  }, [])

  if (pending.length === 0) return null

  const close = (goToAppointments: boolean) => {
    for (const n of pending) api.patch(`/api/client/notifications/${n.id}/read`).catch(() => {})
    setPending([])
    if (goToAppointments) navigate(ROUTES.CLIENT_APPOINTMENTS)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-change-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: "'Lato', sans-serif" }}>
        <div style={{ padding: '22px 24px 8px' }}>
          <h2 id="staff-change-title" style={{ margin: 0, fontSize: '20px', color: primaryColor, fontFamily: "'Playfair Display', serif" }}>
            {pending.length === 1 ? 'Hay un cambio en tu turno' : 'Hay cambios en tus turnos'}
          </h2>
        </div>
        <div style={{ padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pending.map(n => {
            const cfg = ICONS[n.type as keyof typeof ICONS]
            const Icon = cfg.icon
            return (
              <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #eee', borderRadius: '12px', background: '#fafafa' }}>
                <span style={{ color: cfg.color, flexShrink: 0, marginTop: '2px' }}><Icon size={20} /></span>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>{n.title}</p>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#555' }}>{n.body}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '16px 24px 22px', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => close(false)}
            style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', color: '#333', fontWeight: 600, cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: primaryColor, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
          >
            Ver mis turnos
          </button>
        </div>
      </div>
    </div>
  )
}
