import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Sparkles, ShoppingBag, Tag, CalendarClock, Clock } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { ClientReviewsList } from '@/features/client/reviews/ClientReviewsList'
import type { ClientNotification, ClientNotificationType } from './types'
import '@/pages/client/AppointmentsPage.css'

type Tab = 'avisos' | 'reviews'

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
  const [tab, setTab] = useState<Tab>('avisos')
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
    <div className="appointments-page">

      <div className="appointments-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: primary }}>Avisos</h1>
          <p>{tab === 'avisos' ? (unread > 0 ? `${unread} sin leer` : 'Todo al día') : 'Tus reseñas enviadas'}</p>
        </div>
        {tab === 'avisos' && unread > 0 && (
          <button
            onClick={markAllRead}
            style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', color: '#555', fontSize: '14px', fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Marcar todo como leído
          </button>
        )}
      </div>

      <div className="appointments-filters" style={{ maxWidth: '280px' }}>
        {([{ id: 'avisos' as Tab, label: 'Avisos' }, { id: 'reviews' as Tab, label: 'Reseñas' }]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="appointments-filter-btn"
            style={{ backgroundColor: tab === t.id ? primary : '#f3f4f6', color: tab === t.id ? '#fff' : '#6b7280' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reviews' ? (
        <ClientReviewsList primaryColor={primary} />
      ) : loading ? (
        <div className="appointments-empty">
          <p>Cargando...</p>
        </div>
      ) : notifs.length === 0 ? (
        <div className="appointments-empty">
          <Bell size={48} className="appointments-empty-icon" />
          <p>Todavía no tenés avisos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifs.map(n => {
            const cfg  = TYPE_CONFIG[n.type]
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="appointment-card"
                style={{
                  background: n.read ? '#fff' : `${primary}06`,
                  borderColor: n.read ? '#f0f0f0' : `${primary}25`,
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  cursor: n.link ? 'pointer' : 'default',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${cfg.color}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontWeight: n.read ? 600 : 700, color: '#1a1a1a' }}>{n.title}</h3>
                    <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif" }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666', fontFamily: "'Lato', sans-serif" }}>{n.body}</p>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primary, flexShrink: 0, marginTop: '6px' }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
