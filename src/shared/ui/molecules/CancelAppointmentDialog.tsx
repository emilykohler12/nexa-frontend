// Diálogo con el que el personal (administrador y profesional) cancela un turno.
//  Paso 1: «¿Quién cancela?» — «La clienta avisó» o «El estudio cancela».
//  Paso 2 (si avisó la clienta): día y hora del aviso (por defecto ahora; no futuro; la profesional no puede
//  cargar uno de más de 48 horas atrás), medio y nota opcional.
// Antes de confirmar se muestra qué pasa con la seña. La decisión real la toma el backend (cancellationRules.ts):
// acá solo se evita ofrecer lo que va a rechazar. El sistema solo MARCA la seña como devuelta.
import { useId, useState } from 'react'
import { usePaymentRules } from '@/shared/hooks/usePaymentRules'
import {
  NOTICE_CHANNELS, NOTICE_CHANNEL_LABELS, NOTICE_NOTE_MAX_LENGTH, NOTICE_PROBLEM_MESSAGES,
  checkNoticeTime, decideRefund, describeStaffOutcome, fromArgentinaInput, isDepositPaid,
  noticeHoursBefore, toArgentinaInput,
  type NoticeChannel, type StaffCancellation, type StaffRole,
} from '@/shared/utils/cancellation'

interface Props {
  role:          StaffRole
  date:          string   // YYYY-MM-DD (hora de Argentina)
  time:          string   // HH:mm
  paymentStatus: string | undefined
  // Parte de un combo: el backend cancela todos los servicios y evalúa la seña una sola vez.
  isCombo?:      boolean
  accent:        string
  // Devuelve el mensaje de error, o null si salió bien.
  onConfirm:     (data: StaffCancellation) => Promise<string | null>
  // Se llama cuando la cancelación salió bien.
  onDone:        () => void
  // «Volver» sin cancelar.
  onClose:       () => void
}

type Who = 'client' | 'studio'

const WHO_OPTIONS: { value: Who; label: string; hint: string }[] = [
  { value: 'client', label: 'La clienta avisó',    hint: 'La clienta nos avisó que no viene.' },
  { value: 'studio', label: 'El estudio cancela',  hint: 'El estudio no puede atender ese turno.' },
]

export function CancelAppointmentDialog({ role, date, time, paymentStatus, isCombo, accent, onConfirm, onDone, onClose }: Props) {
  const uid = useId()
  const rule = usePaymentRules()
  const [who, setWho]         = useState<Who | null>(null)
  // Por defecto, ahora (hora de Argentina). Se fija al abrir el diálogo.
  const [noticeValue, setNoticeValue] = useState(() => toArgentinaInput(new Date()))
  const [channel, setChannel] = useState<NoticeChannel | ''>('')
  const [note, setNote]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const now      = new Date()
  const noticeAt = fromArgentinaInput(noticeValue)
  const problem  = who === 'client' ? checkNoticeTime({ noticeAt, now, role }) : null
  const paid     = isDepositPaid(paymentStatus)

  // Resultado que se muestra antes de confirmar.
  let result: string | null = null
  if (who === 'studio') {
    result = describeStaffOutcome(decideRefund({ rule, cancelledBy: 'studio', paid, hours: 0 }), { cancelledBy: 'studio', hours: 0, rule })
  } else if (who === 'client' && noticeAt && !problem) {
    const hours = noticeHoursBefore(date, time, noticeAt)
    result = describeStaffOutcome(decideRefund({ rule, cancelledBy: 'client', paid, hours }), { cancelledBy: 'client', hours, rule })
  }

  const canConfirm = who !== null && !problem && !saving

  const confirm = async () => {
    if (!who || problem) return
    const data: StaffCancellation = who === 'studio'
      ? { cancelledBy: 'studio' }
      : {
          cancelledBy:    'client',
          clientNoticeAt: noticeAt!.toISOString(),
          ...(channel ? { noticeChannel: channel } : {}),
          ...(note.trim() ? { noticeNote: note.trim() } : {}),
        }
    setSaving(true)
    setError(null)
    const message = await onConfirm(data)
    setSaving(false)
    if (message) { setError(message); return }
    onDone()
  }

  const btn: React.CSSProperties = {
    padding: '9px 16px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#f8f8f8',
    color: '#000', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: "'Lato', sans-serif",
  }
  const field: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px',
    fontSize: '15px', color: '#000', background: '#fff', fontFamily: "'Lato', sans-serif", boxSizing: 'border-box',
  }
  const label: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#000', marginBottom: '4px' }

  return (
    <div
      onClick={saving ? undefined : onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape' && !saving) onClose() }}
        style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: "'Lato', sans-serif" }}
      >
        <h2 id={`${uid}-title`} style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#000' }}>Cancelar turno</h2>
        {isCombo && (
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#555' }}>
            Es parte de un combo: se cancelan todos los servicios y la seña se evalúa una sola vez.
          </p>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: '12px 0 0' }}>
          <legend style={{ ...label, fontSize: '13px', padding: 0, marginBottom: '8px' }}>¿Quién cancela?</legend>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {WHO_OPTIONS.map(opt => {
              const selected = who === opt.value
              return (
                <label
                  key={opt.value}
                  style={{
                    flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    border: `2px solid ${selected ? accent : '#e0e0e0'}`, background: selected ? `${accent}0d` : '#fff',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#000' }}>
                    <input
                      type="radio"
                      name={`${uid}-who`}
                      value={opt.value}
                      checked={selected}
                      onChange={() => { setWho(opt.value); setError(null) }}
                      style={{ accentColor: accent }}
                    />
                    {opt.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#555', paddingLeft: '24px' }}>{opt.hint}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {who === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            <div>
              <label htmlFor={`${uid}-notice`} style={label}>Día y hora en que avisó la clienta</label>
              <input
                id={`${uid}-notice`}
                type="datetime-local"
                value={noticeValue}
                max={toArgentinaInput(now)}
                onChange={e => { setNoticeValue(e.target.value); setError(null) }}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? `${uid}-problem` : undefined}
                style={field}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Hora de Argentina. Por defecto es ahora.</p>
              {problem && (
                <p id={`${uid}-problem`} role="alert" style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 600, color: '#e53935' }}>
                  {NOTICE_PROBLEM_MESSAGES[problem]}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${uid}-channel`} style={label}>Medio por el que avisó (opcional)</label>
              <select id={`${uid}-channel`} value={channel} onChange={e => setChannel(e.target.value as NoticeChannel | '')} style={field}>
                <option value="">Sin indicar</option>
                {NOTICE_CHANNELS.map(c => <option key={c} value={c}>{NOTICE_CHANNEL_LABELS[c]}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor={`${uid}-note`} style={label}>Nota (opcional)</label>
              <textarea
                id={`${uid}-note`}
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={NOTICE_NOTE_MAX_LENGTH}
                rows={2}
                style={{ ...field, resize: 'none' }}
              />
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#555', textAlign: 'right' }}>{note.length}/{NOTICE_NOTE_MAX_LENGTH}</p>
            </div>
          </div>
        )}

        {result && (
          <div role="status" style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${accent}55`, background: `${accent}0d` }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#000' }}>{result}</p>
            {paid && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#444', lineHeight: 1.4 }}>
                El sistema solo marca la seña como devuelta: el dinero se devuelve por fuera, coordinándolo con la clienta.
              </p>
            )}
          </div>
        )}

        {error && (
          <p role="alert" style={{ margin: '12px 0 0', fontSize: '13px', fontWeight: 600, color: '#e53935' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} disabled={saving} style={btn}>Volver</button>
          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            style={{ ...btn, background: '#e53935', borderColor: '#e53935', color: '#fff', opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? 'pointer' : 'not-allowed' }}
          >
            {saving ? 'Cancelando...' : 'Sí, cancelar el turno'}
          </button>
        </div>
      </div>
    </div>
  )
}
