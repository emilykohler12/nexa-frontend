import { X, Calendar, Clock, User, DollarSign, Shield } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { appointmentStatus } from '@/app/data/shared/status.data'
import type { AppointmentStatus } from '@/features/client/types'
import './AppointmentsPage.css'

interface Appointment {
  id:               string
  serviceName:      string
  professionalName: string
  date:             string
  time:             string
  duration:         number
  price:            number
  depositAmount:    number
  status:           AppointmentStatus
  paymentStatus:    'pending' | 'partial' | 'paid' | 'refunded'
}

export function AppointmentDetailModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const { business } = useTenant()
  if (!business) return null
  const { primaryColor, accentColor, policies } = business

  const status = appointmentStatus[appointment.status]
  const remaining = Math.max(0, appointment.price - appointment.depositAmount)
  const depositPaid = appointment.paymentStatus === 'paid' || appointment.paymentStatus === 'partial'

  return (
    <div className="reschedule-overlay" onClick={onClose}>
      <div className="reschedule-modal" onClick={e => e.stopPropagation()}>
        <div className="reschedule-header">
          <h2 style={{ color: primaryColor }}>{appointment.serviceName}</h2>
          <button onClick={onClose} className="reschedule-close" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="reschedule-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span
            className="appointment-status"
            style={{ backgroundColor: `${status.color}1a`, color: status.color, alignSelf: 'flex-start' }}
          >
            {status.label}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-lato)', fontSize: '15px', color: '#333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color={primaryColor} /> {appointment.professionalName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color={primaryColor} />
              {new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color={primaryColor} /> {appointment.time} · {appointment.duration} min
            </div>
          </div>

          <div style={{ background: '#f9f9f9', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-lato)', fontSize: '14px', color: '#888' }}>
              <span>Precio del servicio</span>
              <span style={{ fontWeight: 700, color: '#333' }}>${appointment.price.toLocaleString('es-AR')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-lato)', fontSize: '14px', color: '#888' }}>
              <span>Seña {depositPaid ? 'pagada' : 'a pagar'}</span>
              <span style={{ fontWeight: 700, color: depositPaid ? '#16a34a' : accentColor }}>
                ${appointment.depositAmount.toLocaleString('es-AR')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #eee', fontFamily: 'var(--font-lato)' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>
                <DollarSign size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Resta pagar el día del turno
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: primaryColor }}>
                ${remaining.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {policies.length > 0 && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: 'var(--font-lato)' }}>
                Políticas del salón
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0, listStyle: 'none' }}>
                {policies.map((policy, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#666', fontFamily: 'var(--font-lato)' }}>
                    <Shield size={13} color={primaryColor} style={{ marginTop: '3px', flexShrink: 0 }} />
                    {policy}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
