import { useState, useEffect } from 'react'
import { Bell, Calendar, X, MessageSquare, DollarSign, Clock, Settings, RefreshCw } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ProfessionalNotification, NotificationType } from '@/features/professional/types/notification'

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  new_appointment:      { icon: Calendar,    color: '#069494' },
  cancelled_appointment:{ icon: X,           color: '#e53935' },
  rescheduled_appointment: { icon: RefreshCw, color: '#7986cb' },
  new_message:          { icon: MessageSquare, color: '#4db6ac' },
  payment_confirmed:    { icon: DollarSign,  color: '#4caf50' },
  reminder:             { icon: Clock,       color: '#d4af37' },
  admin_change:         { icon: Settings,    color: '#a1887f' },
  system:               { icon: Bell,        color: '#000'    },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days > 0)  return `hace ${days} día${days !== 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
  if (mins > 0)  return `hace ${mins} min`
  return 'ahora'
}

export function Notifications() {
  const { business } = useTenant()
  const [notifs, setNotifs] = useState<ProfessionalNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ notifications: ProfessionalNotification[] }>('/api/professional/notifications')
      .then(res => setNotifs(res.data.notifications ?? []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor: primary } = business

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    api.patch('/api/professional/notifications/read-all').catch(() => {})
  }
  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    api.patch(`/api/professional/notifications/${id}/read`).catch(() => {})
  }
  const unread = notifs.filter(n => !n.read).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Notificaciones</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>{unread > 0 ? `${unread} sin leer` : 'Todo al día'}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: '#000', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>Cargando...</p>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#aaa' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Sin notificaciones</p>
          </div>
        ) : notifs.map(n => {
          const cfg  = TYPE_CONFIG[n.type]
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                background: n.read ? '#fff' : `${primary}06`,
                border: `1px solid ${n.read ? '#f0f0f0' : `${primary}25`}`,
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${cfg.color}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                <Icon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ margin: 0, fontWeight: n.read ? 400 : 700, fontSize: '16px', color: '#000' }}>{n.title}</p>
                  <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '12px' }}>{timeAgo(n.createdAt)}</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#000' }}>{n.body}</p>
              </div>
              {!n.read && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primary, flexShrink: 0, marginTop: '6px' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}