import { useState } from 'react'
import { X, Phone, Mail, AlertCircle, FileText, Tag } from 'lucide-react'
import { getAppointmentStatusConfig, isNoShowStatus } from '@/features/professional/utils/appointmentStatus'
import type { Appointment, AppointmentDetails } from '@/features/professional/types/appointment'
import { COMPANION_RELATION_LABELS } from '@/shared/utils/companion'
import { NoShowActions, type NoShowTarget } from '@/shared/ui/molecules/NoShowActions'
import { MarkStatusPanel } from '@/shared/ui/molecules/MarkStatusPanel'
import { CancelAppointmentDialog } from '@/shared/ui/molecules/CancelAppointmentDialog'
import { CancellationSummary } from '@/shared/ui/molecules/CancellationSummary'
import type { StaffCancellation } from '@/shared/utils/cancellation'
import { BalancePaymentForm } from '@/shared/ui/molecules/BalancePaymentForm'
import type { BalanceMethod } from '@/shared/utils/balancePayment'
import { ChangeLegProfessional } from '@/shared/ui/molecules/ChangeLegProfessional'

interface Props {
  appointment:     Appointment
  primary:         string
  accent:          string
  onClose:         () => void
  onSave:          (updated: Appointment) => void
  // Marcar «No asistió» o corregirlo. Devuelve el mensaje de error, o null si salió bien.
  onChangeStatus:  (appointment: Appointment, to: NoShowTarget) => Promise<string | null>
  // Cancelar el turno (quién cancela y, si avisó la clienta, el aviso). Devuelve el mensaje de error, o null si salió bien.
  onCancel:        (appointment: Appointment, data: StaffCancellation) => Promise<string | null>
  // Registrar el cobro del saldo en el local (solo turnos propios). Devuelve el mensaje de error, o null si salió bien.
  onRegisterBalancePayment?: (appointment: Appointment, data: { method: BalanceMethod; amount: number }) => Promise<string | null>
  // Pasar un servicio de combo a otra profesional. `colleagues` son las opciones.
  colleagues?:     { id: string; name: string }[]
  onChangeProfessional?: (appointment: Appointment, professionalId: string) => Promise<string | null>
  // Mover el turno a otra fecha y hora (aunque ya haya empezado). Devuelve el mensaje de error, o null si salió bien.
  onReschedule?:   (appointment: Appointment, date: string, time: string) => Promise<string | null>;
  // Marcar pagada la seña coordinada por WhatsApp. Devuelve el mensaje de error, o null si salió bien.
  onMarkDepositPaid?: (appointment: Appointment) => Promise<string | null>;
}

export function AppointmentDialog({ appointment, primary, accent, onClose, onSave, onChangeStatus, onCancel, onRegisterBalancePayment, colleagues = [], onChangeProfessional, onReschedule, onMarkDepositPaid }: Props) {
  const [notes, setNotes]   = useState(appointment.internalNotes)
  const [cancelling, setCancelling] = useState(false)
  // «Editar»: fecha, hora y notas internas. Las alergias de la clienta no se editan nunca.
  const [editing, setEditing]   = useState(false)
  const [editDate, setEditDate] = useState(appointment.date)
  const [editTime, setEditTime] = useState(appointment.time)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const noShow = isNoShowStatus(appointment.status)
  const infoLines = detailLines(appointment.details)
  const designImage = appointment.details?.designPreference?.type === 'image' ? appointment.details.designPreference.value : null
  const currentCfg = getAppointmentStatusConfig(appointment.status, appointment.cancelReason, appointment.displayStatus, appointment.statusLabel)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      {/* El cuadro nunca pasa del alto de la pantalla y se desplaza por dentro: un turno confirmado que todavía no
          se realizó tiene muchas secciones (llegada, cobro, cancelar) y antes quedaba cortado sin poder bajar. */}
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', overscrollBehavior: 'contain', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${primary}, #047a7a)`, padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'Lato', sans-serif" }}>Turno</p>
            <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}>{appointment.client.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '15px', opacity: 0.85, fontFamily: "'Lato', sans-serif" }}>{appointment.serviceName} · {appointment.time}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Lato', sans-serif" }}>

          {appointment.isSimultaneous && (
            <div style={{ background: `${primary}0d`, border: `1px solid ${primary}33`, borderRadius: '12px', padding: '12px 14px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: primary }}>Turno simultáneo</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#444' }}>
                {(appointment.simultaneousWith?.length ?? 0) > 0
                  ? <>Al mismo tiempo con: {appointment.simultaneousWith!.map(p => `${p.professionalName} (${p.serviceName})`).join(', ')}</>
                  : 'Este turno se hace en simultáneo con otras profesionales.'}
              </p>
            </div>
          )}

          {/* Cliente: solo lo que hay cargado; si no hay ningún dato, la sección no aparece. */}
          {(appointment.client.phone || appointment.client.email || appointment.client.allergies || appointment.client.notes) && (
            <Section title="Datos del cliente">
              {appointment.client.phone && <Row><Phone size={14} /><span>{appointment.client.phone}</span></Row>}
              {appointment.client.email && <Row><Mail size={14} /><span>{appointment.client.email}</span></Row>}
              {appointment.client.allergies && (
                <Row><AlertCircle size={14} color="#e53935" /><span style={{ color: '#e53935' }}>Alergias: {appointment.client.allergies}</span></Row>
              )}
              {appointment.client.notes && (
                <Row><FileText size={14} /><span>{appointment.client.notes}</span></Row>
              )}
            </Section>
          )}

          {/* Lo que la clienta completó al confirmar el turno: poca información y solo lo que cargó (nada si no completó nada). */}
          {(infoLines.length > 0 || designImage) && (
            <Section title="Info del turno">
              {infoLines.map(l => (
                <Row key={l.label}><span style={{ color: l.danger ? '#e53935' : undefined }}><strong>{l.label}:</strong> {l.value}</span></Row>
              ))}
              {designImage && (
                <img src={designImage} alt="Diseño de referencia" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' }} />
              )}
            </Section>
          )}

          {/* Zonas y paquetes elegidos (servicio especial) */}
          {((appointment.selectedZones?.length ?? 0) > 0 || (appointment.selectedPackages?.length ?? 0) > 0) && (
            <Section title="Zonas y paquetes elegidos">
              {appointment.selectedZones?.map((z, i) => (
                <Row key={`z-${i}`}><Tag size={14} /><span>{z.name} · ${z.price.toLocaleString('es-AR')}</span></Row>
              ))}
              {appointment.selectedPackages?.map((p, i) => (
                <Row key={`p-${i}`}><Tag size={14} /><span>{p.name} (paquete) · ${p.price.toLocaleString('es-AR')}</span></Row>
              ))}
            </Section>
          )}

          {/* Precio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f9', borderRadius: '12px' }}>
            <span style={{ fontSize: '14px', color: '#000' }}>Precio del servicio</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: accent }}>${appointment.servicePrice.toLocaleString('es-AR')}</span>
          </div>

          {/* Cobro del saldo en el local */}
          {onRegisterBalancePayment && (
            <BalancePaymentForm
              servicePrice={appointment.servicePrice}
              depositAmount={appointment.depositAmount}
              paymentStatus={appointment.paymentStatus}
              status={appointment.status}
              balancePayment={appointment.balancePayment}
              showCollector={false}
              onRegister={data => onRegisterBalancePayment(appointment, data)}
            />
          )}

          {/* Cambiar la profesional de este servicio del combo */}
          {onChangeProfessional && appointment.comboGroupId && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Profesional de este servicio</p>
              <ChangeLegProfessional currentId="" options={colleagues} onChange={id => onChangeProfessional(appointment, id)} />
            </div>
          )}

          {/* Corrección de un «No asistió» (las demás acciones de estado están abajo, en «Marcar estado»). */}
          {noShow && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Estado</p>
              <span style={{ display: 'inline-block', marginBottom: '8px', padding: '5px 12px', borderRadius: '20px', background: currentCfg.bg, color: currentCfg.color, fontWeight: 700, fontSize: '13px' }}>
                {currentCfg.label}
              </span>
              <NoShowActions
                status={appointment.status}
                date={appointment.date}
                time={appointment.time}
                accent={primary}
                onChangeStatus={to => onChangeStatus(appointment, to)}
                onDone={onClose}
              />
            </div>
          )}

          {appointment.status === 'cancelled' && appointment.cancellation && (
            <Section title="Cancelación">
              <CancellationSummary cancellation={appointment.cancellation} />
            </Section>
          )}

          {/* Fecha y hora (solo al editar) */}
          {editing && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>
                Fecha
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', fontFamily: "'Lato', sans-serif" }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase' }}>
                Hora
                <input type="time" step={300} value={editTime} onChange={e => setEditTime(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', fontFamily: "'Lato', sans-serif" }} />
              </label>
            </div>
          )}

          {/* Notas internas */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Notas internas</p>
            <textarea
              value={notes}
              readOnly={!editing}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Solo visibles para vos..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', resize: 'none', outline: 'none', fontFamily: "'Lato', sans-serif", background: editing ? '#fff' : '#fafafa', cursor: editing ? 'text' : 'default' }}
              onFocus={e => (e.currentTarget.style.borderColor = primary)}
              onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
            />
          </div>

          {/* Marcar estado: abajo, antes de Editar. Solo turnos que todavía no se realizaron. */}
          {!editing && onReschedule && onMarkDepositPaid && (
            <MarkStatusPanel
              status={appointment.status}
              date={appointment.date}
              time={appointment.time}
              accent={primary}
              paymentStatus={appointment.paymentStatus}
              depositAmount={appointment.depositAmount}
              depositMethod={appointment.depositMethod}
              onRequestCancel={() => setCancelling(true)}
              onReschedule={(d, t) => onReschedule(appointment, d, t)}
              onFinish={() => onChangeStatus(appointment, 'finished')}
              onNoShow={() => onChangeStatus(appointment, 'cancelled_no_show')}
              onMarkDepositPaid={() => onMarkDepositPaid(appointment)}
              onDone={onClose}
            />
          )}

          {saveError && <p role="alert" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e53935' }}>{saveError}</p>}

          {/* Acciones: abajo solo «Editar» (al editar, Descartar y Guardar). */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); setNotes(appointment.internalNotes); setEditDate(appointment.date); setEditTime(appointment.time); setSaveError(null) }}
                  disabled={saving}
                  style={{ padding: '10px 20px', border: '1px solid #e0e0e0', borderRadius: '10px', background: 'transparent', color: '#000', cursor: 'pointer', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}
                >
                  Descartar
                </button>
                <button
                  onClick={async () => {
                    setSaving(true); setSaveError(null)
                    const moved = editDate !== appointment.date || editTime !== appointment.time
                    if (moved && onReschedule) {
                      const message = await onReschedule(appointment, editDate, editTime)
                      if (message) { setSaving(false); setSaveError(message); return }
                    }
                    setSaving(false)
                    onSave({ ...appointment, ...(moved ? { date: editDate, time: editTime } : {}), internalNotes: notes })
                  }}
                  disabled={saving}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: primary, color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '10px 24px', border: 'none', borderRadius: '10px', background: primary, color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>

      {cancelling && (
        <CancelAppointmentDialog
          role="professional"
          date={appointment.date}
          time={appointment.time}
          paymentStatus={appointment.paymentStatus}
          isCombo={!!appointment.comboGroupId}
          accent={primary}
          onConfirm={data => onCancel(appointment, data)}
          onDone={onClose}
          onClose={() => setCancelling(false)}
        />
      )}
    </div>
  )
}

// Líneas compactas «Etiqueta: valor» con lo que la clienta completó al confirmar el turno (solo lo que cargó).
function detailLines(d: AppointmentDetails | null | undefined): { label: string; value: string; danger?: boolean }[] {
  if (!d) return []
  const lines: { label: string; value: string; danger?: boolean }[] = []
  if (d.allergies) lines.push({ label: 'Alergias', value: d.allergies, danger: true })
  if (d.hasCompanion) {
    lines.push({ label: 'Acompañante', value: d.companionRelation ? `sí (${COMPANION_RELATION_LABELS[d.companionRelation].toLowerCase()})` : 'sí' })
  }
  if (d.designPreference?.value && d.designPreference.type !== 'image') lines.push({ label: 'Diseño', value: d.designPreference.value })
  if (d.hasOtherSalonPolish) lines.push({ label: 'Esmaltado de otro salón', value: 'sí, para retirar' })
  if (d.isNailReconstruction) lines.push({ label: 'Reconstrucción de uñas', value: d.nailReconstructionCount ? String(d.nailReconstructionCount) : 'sí' })
  if (d.hairLength) lines.push({ label: 'Largo de cabello', value: d.hairLength })
  if (d.wantsExtensions) lines.push({ label: 'Extensiones', value: 'sí' })
  if (d.skinType) lines.push({ label: 'Tipo de piel', value: d.skinType })
  return lines
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