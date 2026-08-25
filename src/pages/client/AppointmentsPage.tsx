// src/pages/client/AppointmentsPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate }    from 'react-router-dom'
import { useTenant }      from '@/features/tenant/TenantContext'
import { useAuth, isFirstVisit } from '@/features/auth/AuthContext'
import { api }            from '@/shared/utils/api'
import { ROUTES }         from '@/app/config/routes.config'
import { appointmentStatus } from '@/app/data/shared/status.data'
import { Calendar, Clock, User, ChevronRight, X, CalendarClock } from 'lucide-react'
import type { AppointmentStatus } from '@/features/client/types'
import { RescheduleModal } from '@/features/client/booking/RescheduleModal'
import { AppointmentDetailModal } from './AppointmentDetailModal'
import './AppointmentsPage.css'

type Filter = 'upcoming' | 'history' | 'cancelled'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'upcoming',  label: 'Próximos'  },
  { id: 'history',   label: 'Historial' },
  { id: 'cancelled', label: 'Cancelados' },
]

interface Appointment {
  id:               string
  serviceId:        string
  serviceName:      string
  professionalId:   string
  professionalName: string
  date:             string
  time:             string
  duration:         number
  price:            number
  depositAmount:    number
  status:           AppointmentStatus
  paymentStatus:    'pending' | 'partial' | 'paid' | 'refunded'
}

export function AppointmentsPage() {
  const { business }           = useTenant()
  const { user }               = useAuth()
  const navigate               = useNavigate()
  const [filter, setFilter]    = useState<Filter>('upcoming')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]  = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [message, setMessage]  = useState<string | null>(null)
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null)
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null)

  useEffect(() => {
    api.get<{ appointments: Appointment[] }>('/api/client/appointments')
      .then(res => setAppointments(res.data.appointments ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business || !user) return null
  const { primaryColor, accentColor } = business

  const firstName = user.name.split(' ')[0]
  const firstTime = isFirstVisit(user)

  // Compara fecha + hora reales, no solo la fecha — un turno de hoy a una hora
  // que ya pasó debe verse como historial, no como próximo.
  const isPast = (a: Appointment) => new Date(`${a.date}T${a.time}`).getTime() <= Date.now()

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming')  return !isPast(a) && a.status !== 'cancelled'
    if (filter === 'history')   return isPast(a) || a.status === 'finished'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  })

  const handleCancel = async (appt: Appointment) => {
    const ok = window.confirm(`¿Cancelar el turno de ${appt.serviceName} del ${appt.date}?`)
    if (!ok) return

    setCancellingId(appt.id)
    setMessage(null)
    try {
      const res = await api.patch<{ appointment: Appointment; refunded: boolean }>(
        `/api/client/appointments/${appt.id}/cancel`
      )
      setAppointments(prev => prev.map(a => a.id === appt.id ? res.data.appointment : a))
      setMessage(
        res.data.refunded
          ? 'Turno cancelado. La seña se reembolsa según la política del negocio.'
          : 'Turno cancelado. La seña no se reembolsa por cancelarse fuera del plazo permitido.'
      )
    } catch (err: any) {
      setMessage(err?.response?.data?.error ?? 'No se pudo cancelar el turno.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="appointments-page">

      {/* Mensaje de bienvenida */}
      <div className="appointments-welcome">
        <h1 style={{ color: primaryColor }}>
          {firstTime ? `¡Bienvenida/o, ${firstName}!` : `Hola de nuevo, ${firstName} 👋`}
        </h1>
        <p>{firstTime ? 'Un gusto que nos hayas elegido.' : 'Gestioná tus reservas.'}</p>
      </div>

      <button
        onClick={() => navigate(ROUTES.CLIENT_BOOK)}
        className="appointments-new-btn"
        style={{ backgroundColor: primaryColor }}
      >
        + Reservar nuevo turno
      </button>

      {message && (
        <p style={{ fontSize: '14px', color: '#000', fontWeight: 600, margin: '0 0 12px' }}>{message}</p>
      )}

      {/* Filtros */}
      <div className="appointments-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="appointments-filter-btn"
            style={{
              backgroundColor: filter === f.id ? primaryColor : '#f3f4f6',
              color:           filter === f.id ? '#fff' : '#6b7280',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="appointments-empty">
          <p>Cargando turnos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="appointments-empty">
          <Calendar size={48} className="appointments-empty-icon" />
          <p>No hay turnos en esta sección</p>
        </div>
      ) : (
        <div className="appointments-list">
          {filtered.map(appt => {
            const status = appointmentStatus[appt.status]
            return (
              <div
                key={appt.id}
                className="appointment-card"
                onClick={() => setDetailAppt(appt)}
                role="button"
                tabIndex={0}
              >
                <div className="appointment-card-top">
                  <div>
                    <h3 style={{ color: primaryColor }}>{appt.serviceName}</h3>
                    <div className="appointment-professional">
                      <User size={14} />
                      <span>{appt.professionalName}</span>
                    </div>
                  </div>
                  <span
                    className="appointment-status"
                    style={{ backgroundColor: `${status.color}1a`, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="appointment-meta">
                  <span><Calendar size={14} />{new Date(appt.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span><Clock size={14} />{appt.time}</span>
                  <span><Clock size={14} />{appt.duration} min</span>
                </div>

                <div className="appointment-footer">
                  <span className="appointment-price" style={{ color: accentColor }}>
                    ${appt.price.toLocaleString('es-AR')}
                  </span>
                  {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast(appt) ? (
                    <div className="appointment-actions">
                      <button
                        className="appointment-reschedule-btn"
                        onClick={e => { e.stopPropagation(); setReschedulingAppt(appt) }}
                        disabled={cancellingId === appt.id}
                      >
                        <CalendarClock size={14} /> Reprogramar
                      </button>
                      <button
                        className="appointment-cancel-btn"
                        onClick={e => { e.stopPropagation(); handleCancel(appt) }}
                        disabled={cancellingId === appt.id}
                      >
                        <X size={14} /> {cancellingId === appt.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(ROUTES.CLIENT_BOOK) }}
                      className="appointment-rebook-btn"
                      style={{ color: primaryColor }}
                    >
                      Reservar de nuevo <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reschedulingAppt && (
        <RescheduleModal
          appointmentId={reschedulingAppt.id}
          initialServiceId={reschedulingAppt.serviceId}
          initialProfessionalId={reschedulingAppt.professionalId}
          initialDate={reschedulingAppt.date}
          initialTime={reschedulingAppt.time}
          onClose={() => setReschedulingAppt(null)}
          onSuccess={updated => {
            setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a))
            setReschedulingAppt(null)
            setMessage('Turno reprogramado con éxito.')
          }}
        />
      )}

      {detailAppt && (
        <AppointmentDetailModal appointment={detailAppt} onClose={() => setDetailAppt(null)} />
      )}
    </div>
  )
}
