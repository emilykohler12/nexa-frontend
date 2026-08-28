import { useState } from 'react'
import { X, Calendar, Clock, User, DollarSign, Shield, MapPin, Phone, AlertCircle, Users, Image as ImageIcon, FileText, Pencil, Tag } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { appointmentStatus } from '@/app/data/shared/status.data'
import type { AppointmentStatus } from '@/features/client/types'
import { PostBookingDetails, type AppointmentDetailsValue } from '@/features/client/booking/PostBookingDetails'
import './AppointmentsPage.css'

interface Appointment {
  id:                string
  categoryId:        string
  serviceName:       string
  professionalName:  string
  date:              string
  time:              string
  duration:          number
  price:             number
  depositAmount:     number
  status:            AppointmentStatus
  paymentStatus:     'pending' | 'partial' | 'paid' | 'refunded'
  details?:          AppointmentDetailsValue | null
  selectedZones?:    { name: string; price: number; duration: number }[]
  selectedPackages?: { name: string; price: number; duration: number }[]
}

interface Props {
  appointment: Appointment
  onClose: () => void
  onDetailsUpdated: (value: AppointmentDetailsValue) => void
}

export function AppointmentDetailModal({ appointment, onClose, onDetailsUpdated }: Props) {
  const { business } = useTenant()
  const [editingDetails, setEditingDetails] = useState(false)
  if (!business) return null
  const { primaryColor, accentColor, policies, contactInfo } = business

  const status = appointmentStatus[appointment.status]
  const remaining = Math.max(0, appointment.price - appointment.depositAmount)
  const depositPaid = appointment.paymentStatus === 'paid' || appointment.paymentStatus === 'partial'
  const details = appointment.details

  if (editingDetails) {
    return (
      <div className="reschedule-overlay" onClick={() => setEditingDetails(false)}>
        <div className="reschedule-modal" onClick={e => e.stopPropagation()}>
          <div className="reschedule-body" style={{ paddingTop: '24px' }}>
            <PostBookingDetails
              appointmentId={appointment.id}
              categoryId={appointment.categoryId}
              initial={details}
              editMode
              onDone={value => { onDetailsUpdated(value); setEditingDetails(false) }}
              onCancel={() => setEditingDetails(false)}
            />
          </div>
        </div>
      </div>
    )
  }

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
            {contactInfo.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color={primaryColor} /> {contactInfo.address}
              </div>
            )}
            {contactInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color={primaryColor} />
                <a href={`tel:${contactInfo.phone}`} style={{ color: '#333' }}>{contactInfo.phone}</a>
                <span style={{ color: '#999', fontSize: '13px' }}>(salón)</span>
              </div>
            )}
          </div>

          {((appointment.selectedZones?.length ?? 0) > 0 || (appointment.selectedPackages?.length ?? 0) > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-lato)', fontSize: '14px', color: '#333' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Zonas y paquetes elegidos
              </p>
              {appointment.selectedZones?.map((z, i) => (
                <div key={`z-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={14} color={primaryColor} /> <span>{z.name} · {z.duration} min · ${z.price.toLocaleString('es-AR')}</span>
                </div>
              ))}
              {appointment.selectedPackages?.map((p, i) => (
                <div key={`p-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={14} color={primaryColor} /> <span>{p.name} (paquete) · {p.duration} min · ${p.price.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}

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

          {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: 'var(--font-lato)' }}>
                  Alergias, acompañante y diseño
                </p>
                <button
                  onClick={() => setEditingDetails(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: primaryColor, fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-lato)' }}
                >
                  <Pencil size={13} /> Editar
                </button>
              </div>

              {details && (
                details.allergies || details.accompanied || details.designPreference?.value ||
                details.hasOtherSalonPolish || details.isNailReconstruction || details.hairLength ||
                details.wantsExtensions || details.skinType
              ) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-lato)', fontSize: '14px', color: '#333' }}>
                  {details.allergies && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertCircle size={15} color="#e53935" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>{details.allergies}</span>
                    </div>
                  )}
                  {details.accompanied && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Users size={15} color={primaryColor} style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span>Viene acompañado/a{details.companionName ? ` de ${details.companionName}` : ''}</span>
                    </div>
                  )}
                  {details.designPreference?.value && (
                    details.designPreference.type === 'image' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <ImageIcon size={15} color={primaryColor} /> <span>Diseño de referencia</span>
                        </div>
                        <img src={details.designPreference.value} alt="Diseño" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <FileText size={15} color={primaryColor} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{details.designPreference.value}</span>
                      </div>
                    )
                  )}
                  {details.hasOtherSalonPolish && (
                    <div>· Tiene esmaltado de otro salón para retirar</div>
                  )}
                  {details.isNailReconstruction && (
                    <div>· Reconstrucción de uñas{details.nailReconstructionCount ? ` (${details.nailReconstructionCount})` : ''}</div>
                  )}
                  {details.hairLength && <div>· Largo de cabello: {details.hairLength}</div>}
                  {details.wantsExtensions && <div>· Quiere extensiones</div>}
                  {details.skinType && <div>· Tipo de piel: {details.skinType}</div>}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#999', margin: 0, fontFamily: 'var(--font-lato)' }}>
                  No cargaste nada todavía.
                </p>
              )}
            </div>
          )}

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
