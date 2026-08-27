import { useState } from 'react'
import { X, Phone, Mail, AlertCircle, FileText, Users, Image as ImageIcon } from 'lucide-react'
import { appointmentStatusConfig } from '@/features/professional/utils/appointmentStatus'
import type { Appointment, AppointmentStatus } from '@/features/professional/types/appointment'

interface Props {
  appointment: Appointment
  primary:     string
  accent:      string
  onClose:     () => void
  onSave:      (updated: Appointment) => void
}

export function AppointmentDialog({ appointment, primary, accent, onClose, onSave }: Props) {
  const [notes, setNotes]   = useState(appointment.internalNotes)
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status)

  const STATUS_OPTIONS: AppointmentStatus[] = ['confirmed','finished','cancelled','no_show']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${primary}, #047a7a)`, padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'Lato', sans-serif" }}>Turno</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}>{appointment.client.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '15px', opacity: 0.85, fontFamily: "'Lato', sans-serif" }}>{appointment.serviceName} · {appointment.time} · {appointment.duration} min</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Lato', sans-serif" }}>

          {/* Cliente */}
          <Section title="Datos del cliente">
            <Row><Phone size={14} /><span>{appointment.client.phone}</span></Row>
            <Row><Mail size={14} /><span>{appointment.client.email}</span></Row>
            {appointment.client.allergies && (
              <Row><AlertCircle size={14} color="#e53935" /><span style={{ color: '#e53935' }}>{appointment.client.allergies}</span></Row>
            )}
            {appointment.client.notes && (
              <Row><FileText size={14} /><span>{appointment.client.notes}</span></Row>
            )}
          </Section>

          {/* Info cargada por el cliente al reservar */}
          {appointment.details && (
            appointment.details.allergies || appointment.details.accompanied || appointment.details.designPreference?.value ||
            appointment.details.hasOtherSalonPolish || appointment.details.isNailReconstruction || appointment.details.hairLength ||
            appointment.details.wantsExtensions || appointment.details.skinType
          ) && (
            <Section title="Info del turno (cargada por el cliente)">
              {appointment.details.allergies && (
                <Row><AlertCircle size={14} color="#e53935" /><span style={{ color: '#e53935' }}>{appointment.details.allergies}</span></Row>
              )}
              {appointment.details.accompanied && (
                <Row><Users size={14} /><span>Viene acompañado/a{appointment.details.companionName ? ` de ${appointment.details.companionName}` : ''}</span></Row>
              )}
              {appointment.details.designPreference?.value && (
                appointment.details.designPreference.type === 'image' ? (
                  <div>
                    <Row><ImageIcon size={14} /><span>Diseño de referencia:</span></Row>
                    <img
                      src={appointment.details.designPreference.value}
                      alt="Diseño de referencia"
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: '6px' }}
                    />
                  </div>
                ) : (
                  <Row><FileText size={14} /><span>Diseño: {appointment.details.designPreference.value}</span></Row>
                )
              )}
              {appointment.details.hasOtherSalonPolish && (
                <Row><AlertCircle size={14} color="#d4af37" /><span>Tiene esmaltado de otro salón para retirar</span></Row>
              )}
              {appointment.details.isNailReconstruction && (
                <Row><FileText size={14} /><span>Reconstrucción de uñas{appointment.details.nailReconstructionCount ? ` (${appointment.details.nailReconstructionCount})` : ''}</span></Row>
              )}
              {appointment.details.hairLength && (
                <Row><FileText size={14} /><span>Largo de cabello: {appointment.details.hairLength}</span></Row>
              )}
              {appointment.details.wantsExtensions && (
                <Row><FileText size={14} /><span>Quiere extensiones</span></Row>
              )}
              {appointment.details.skinType && (
                <Row><FileText size={14} /><span>Tipo de piel: {appointment.details.skinType}</span></Row>
              )}
            </Section>
          )}

          {/* Precio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f9', borderRadius: '12px' }}>
            <span style={{ fontSize: '14px', color: '#000' }}>Precio del servicio</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: accent }}>${appointment.servicePrice.toLocaleString('es-AR')}</span>
          </div>

          {/* Estado */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Estado</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(s => {
                const cfg = appointmentStatusConfig[s]
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '5px 12px', border: 'none', borderRadius: '20px',
                      background: status === s ? cfg.bg : '#f0f0f0',
                      color: status === s ? cfg.color : '#888',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      fontFamily: "'Lato', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notas internas */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Notas internas</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Solo visibles para vos..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', resize: 'none', outline: 'none', fontFamily: "'Lato', sans-serif" }}
              onFocus={e => (e.currentTarget.style.borderColor = primary)}
              onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
            />
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e0e0e0', borderRadius: '10px', background: 'transparent', color: '#000', cursor: 'pointer', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}>
              Cancelar
            </button>
            <button
              onClick={() => onSave({ ...appointment, status, internalNotes: notes })}
              style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: primary, color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#000', fontFamily: "'Lato', sans-serif" }}>
      {children}
    </div>
  )
}