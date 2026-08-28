import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Sparkles, ShoppingBag, Tag, CalendarClock, Clock } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ClientNotification, ClientNotificationType } from './types'

const TYPE_CONFIG: Record<ClientNotificationType, { icon: typeof Bell; color: string }> = {
  new_service:          { icon: Sparkles,     color: '#069494' },
  new_product:          { icon: ShoppingBag,  color: '#8e24aa' },
  new_promotion:        { icon: Tag,          color: '#d4af37' },
  special_service:      { icon: CalendarClock, color: '#8a6800' },
  appointment_reminder: { icon: Clock,        color: '#4caf50' },
  system:               { icon: Bell,         color: '#000'    },
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
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState<ClientNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ notifications: ClientNotification[] }>('/api/client/notifications')
      .then(res => setNotifs(res.data.notifications ?? []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor: primary } = business

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    api.patch('/api/client/notifications/read-all').catch(() => {})
  }

  const handleClick = (n: ClientNotification) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    api.patch(`/api/client/notifications/${n.id}/read`).catch(() => {})
    if (n.link) navigate(n.link)
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Avisos</h1>
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
            <p style={{ fontSize: '16px' }}>Todavía no tenés avisos</p>
          </div>
        ) : notifs.map(n => {
          const cfg  = TYPE_CONFIG[n.type]
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                background: n.read ? '#fff' : `${primary}06`,
                border: `1px solid ${n.read ? '#f0f0f0' : `${primary}25`}`,
                borderRadius: '12px', padding: '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                cursor: n.link ? 'pointer' : 'default', transition: 'all 0.15s',
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
