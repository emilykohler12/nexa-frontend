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
import type { AppointmentDetailsValue } from '@/features/client/booking/PostBookingDetails'
import { AppointmentDetailModal } from './AppointmentDetailModal'
import './AppointmentsPage.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { ConfirmModal } from '@/shared/ui/molecules/ConfirmModal'
import { Toast, type ToastType } from '@/shared/ui/molecules/Toast'
import { InfoModal } from '@/shared/ui/molecules/InfoModal'
import { ReviewPromptModal } from '@/features/client/reviews/ReviewPromptModal'

type Filter = 'upcoming' | 'history' | 'cancelled'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'upcoming',  label: 'Próximos'  },
  { id: 'history',   label: 'Historial' },
  { id: 'cancelled', label: 'Cancelados' },
]

interface Appointment {
  id:                string
  serviceId:         string
  serviceName:       string
  categoryId:        string
  professionalId:    string
  professionalName:  string
  date:              string
  time:              string
  duration:          number
  price:             number
  depositAmount:     number
  status:            AppointmentStatus
  paymentStatus:     'pending' | 'partial' | 'paid' | 'refunded'
  details?:          AppointmentDetailsValue | null
  comboGroupId?:     string | null
  // Presente cuando el turno se reprogramó y el cliente todavía no vio el aviso.
  rescheduleNoticePending?: boolean
  previousDate?:            string | null
  previousTime?:            string | null
  // Solo para turnos de un servicio especial — qué zonas/paquetes eligió.
  selectedZones?:    { name: string; price: number; duration: number }[]
  selectedPackages?: { name: string; price: number; duration: number }[]
}

export function AppointmentsPage() {
  const { business }           = useTenant()
  const { user }               = useAuth()
  const navigate               = useNavigate()
  const [filter, setFilter]    = useState<Filter>('upcoming')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]  = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ text: string; type: ToastType } | null>(null)
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null)
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null)
  const [confirmCancelAppt, setConfirmCancelAppt] = useState<Appointment | null>(null)
  const [rescheduleNoticeQueue, setRescheduleNoticeQueue] = useState<Appointment[]>([])
  const [reviewQueue, setReviewQueue] = useState<{ appointmentId: string; serviceName: string }[]>([])

  useEffect(() => {
    api.get<{ appointments: Appointment[] }>('/api/client/appointments')
      .then(res => {
        const list = res.data.appointments ?? []
        setAppointments(list)
        setRescheduleNoticeQueue(list.filter(a => a.rescheduleNoticePending))
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))

    // Turnos ya finalizados que todavía no tienen reseña — se pregunta una
    // sola vez, la primera vez que el cliente vuelve a entrar.
    api.get<{ pending: { appointmentId: string; serviceName: string }[] }>('/api/client/reviews/pending')
      .then(res => setReviewQueue(res.data.pending ?? []))
      .catch(() => setReviewQueue([]))
  }, [])

  const dismissRescheduleNotice = () => {
    const appt = rescheduleNoticeQueue[0]
    if (!appt) return
    setRescheduleNoticeQueue(prev => prev.slice(1))
    api.patch(`/api/client/appointments/${appt.id}/acknowledge-reschedule`).catch(() => {})
  }

  if (!business || !user) return null
  const { primaryColor, accentColor } = business

  const firstName = user.name.split(' ')[0]
  const firstTime = isFirstVisit(user)

  // Compara fecha + hora reales, no solo la fecha — un turno de hoy a una hora
  // que ya pasó debe verse como historial, no como próximo. Si la hora viene en
  // un formato que no se puede parsear, no queda "atascado" como próximo para siempre.
  const isPast = (a: Appointment) => {
    const dt = new Date(`${a.date}T${a.time}`)
    if (!isNaN(dt.getTime())) return dt.getTime() <= Date.now()
    return a.date < new Date().toISOString().split('T')[0]
  }

  // Cada turno cae en un único balde: el estado manda cuando ya está resuelto
  // (finished/no_show/cancelled), y solo se usa la fecha/hora para los que
  // todavía dependen de si ya pasaron o no. Así nunca puede aparecer duplicado.
  const isUpcomingStatus = (a: Appointment) => a.status === 'confirmed' || a.status === 'pending'

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming')  return isUpcomingStatus(a) && !isPast(a)
    if (filter === 'history')   return a.status === 'finished' || (isUpcomingStatus(a) && isPast(a))
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  })

  const confirmCancel = async () => {
    const appt = confirmCancelAppt
    if (!appt) return
    setCancellingId(appt.id)
    try {
      const res = await api.patch<{ appointment: Appointment; refunded: boolean; appointments?: Appointment[] }>(
        `/api/client/appointments/${appt.id}/cancel`
      )
      // Si el turno es parte de un combo, el backend cancela todas las patas
      // juntas y las devuelve en `appointments` — hay que actualizar todas,
      // no solo la que se pidió cancelar.
      if (res.data.appointments?.length) {
        const updatedById = new Map(res.data.appointments.map(a => [a.id, a]))
        setAppointments(prev => prev.map(a => updatedById.get(a.id) ?? a))
        setToast({
          type: res.data.refunded ? 'success' : 'info',
          text: res.data.refunded
            ? 'Se canceló el combo completo. Las señas se reembolsan según la política del negocio.'
            : 'Se canceló el combo completo. Las señas no se reembolsan por cancelarse fuera del plazo permitido.',
        })
      } else {
        setAppointments(prev => prev.map(a => a.id === appt.id ? res.data.appointment : a))
        setToast({
          type: res.data.refunded ? 'success' : 'info',
          text: res.data.refunded
            ? 'Turno cancelado. La seña se reembolsa según la política del negocio.'
            : 'Turno cancelado. La seña no se reembolsa por cancelarse fuera del plazo permitido.',
        })
      }
    } catch (err: any) {
      setToast({ type: 'error', text: safeErrorMessage(err, 'No se pudo cancelar el turno.') })
    } finally {
      setCancellingId(null)
      setConfirmCancelAppt(null)
    }
  }

  const handleRescheduleClick = (appt: Appointment) => {
    if (appt.comboGroupId) {
      setToast({ type: 'info', text: 'Este turno es parte de un combo y no se puede reprogramar desde acá. Cancelalo y reservá de nuevo si necesitás cambiar el horario.' })
      return
    }
    setReschedulingAppt(appt)
  }

  const handleRebook = (appt: Appointment) => {
    navigate(ROUTES.CLIENT_BOOK, { state: { serviceId: appt.serviceId, professionalId: appt.professionalId } })
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
                      {!appt.comboGroupId && (
                        <button
                          className="appointment-reschedule-btn"
                          onClick={e => { e.stopPropagation(); handleRescheduleClick(appt) }}
                          disabled={cancellingId === appt.id}
                        >
                          <CalendarClock size={14} /> Reprogramar
                        </button>
                      )}
                      <button
                        className="appointment-cancel-btn"
                        onClick={e => { e.stopPropagation(); setConfirmCancelAppt(appt) }}
                        disabled={cancellingId === appt.id}
                      >
                        <X size={14} /> {cancellingId === appt.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleRebook(appt) }}
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
            setToast({ type: 'success', text: 'Turno reprogramado con éxito.' })
          }}
        />
      )}

      {detailAppt && (
        <AppointmentDetailModal
          appointment={detailAppt}
          onClose={() => setDetailAppt(null)}
          onDetailsUpdated={value => {
            setAppointments(prev => prev.map(a => a.id === detailAppt.id ? { ...a, details: value } : a))
            setDetailAppt(prev => prev ? { ...prev, details: value } : prev)
          }}
        />
      )}

      {confirmCancelAppt && (
        <ConfirmModal
          title="¿Cancelar este turno?"
          message={
            confirmCancelAppt.comboGroupId
              ? `Este turno es parte de un combo — se van a cancelar todos los servicios del combo. ${confirmCancelAppt.serviceName} del ${confirmCancelAppt.date}.`
              : `${confirmCancelAppt.serviceName} del ${confirmCancelAppt.date} a las ${confirmCancelAppt.time}.`
          }
          confirmLabel="Sí, cancelar"
          cancelLabel="Volver"
          accentColor={primaryColor}
          loading={cancellingId === confirmCancelAppt.id}
          onConfirm={confirmCancel}
          onCancel={() => setConfirmCancelAppt(null)}
        />
      )}

      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {rescheduleNoticeQueue.length > 0 && (
        <InfoModal
          title="Tu turno se reprogramó"
          message={
            rescheduleNoticeQueue[0].previousDate && rescheduleNoticeQueue[0].previousTime
              ? `${rescheduleNoticeQueue[0].serviceName} se movió del ${rescheduleNoticeQueue[0].previousDate} a las ${rescheduleNoticeQueue[0].previousTime}, al ${rescheduleNoticeQueue[0].date} a las ${rescheduleNoticeQueue[0].time}.`
              : `${rescheduleNoticeQueue[0].serviceName} ahora es el ${rescheduleNoticeQueue[0].date} a las ${rescheduleNoticeQueue[0].time}.`
          }
          accentColor={primaryColor}
          onClose={dismissRescheduleNotice}
        />
      )}

      {rescheduleNoticeQueue.length === 0 && reviewQueue.length > 0 && (
        <ReviewPromptModal
          appointmentId={reviewQueue[0].appointmentId}
          serviceName={reviewQueue[0].serviceName}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onDone={() => setReviewQueue(prev => prev.slice(1))}
        />
      )}
    </div>
  )
}
