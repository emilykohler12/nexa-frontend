// «Marcar estado» del detalle de un turno que todavía no se realizó (profesional y administrador).
// Cinco opciones: Cancelar · Reprogramar · Finalizado · Seña pagada · No asistió.
//  - Se puede tener «Seña pagada» tildada y UNA de las otras cuatro: solo dos opciones a la vez.
//  - Cancelar y Reprogramar valen en cualquier momento, aunque el turno ya haya empezado (se le avisa a la clienta por
//    correo, en su página de avisos y con una ventana al iniciar sesión: eso lo hace el backend).
//  - Finalizado y No asistió solo desde la hora de inicio (el backend igual lo valida).
//  - Seña pagada: si se pagó por Mercado Pago ya figura tildada y no se puede destildar; si es por WhatsApp se tilda
//    para marcarla paga (el turno queda confirmado y con la seña pagada).
import { useState } from 'react'
import { minutesSinceStart } from '@/shared/utils/argentinaTime'
import { REOPEN_LIMIT_MINUTES } from './NoShowActions'

type Choice = 'reschedule' | 'finish' | 'noshow'

interface Props {
  status:         string
  date:           string   // YYYY-MM-DD del inicio actual
  time:           string   // HH:mm del inicio actual
  accent:         string
  paymentStatus:  string
  depositAmount?: number
  depositMethod?: string | null
  // Abre el diálogo de cancelación (quién cancela, aviso de la clienta, devolución de la seña).
  onRequestCancel: () => void
  // Los tres devuelven el mensaje de error, o null si salió bien.
  onReschedule:        (date: string, time: string) => Promise<string | null>
  onFinish:            () => Promise<string | null>
  onNoShow:            () => Promise<string | null>
  onMarkDepositPaid:   () => Promise<string | null>
  // Se llama cuando el cambio salió bien (por ejemplo para cerrar el modal).
  onDone?:             () => void
}

const ACTIVE = ['pending', 'confirmed']

export function MarkStatusPanel({
  status, date, time, accent, paymentStatus, depositAmount = 0, depositMethod,
  onRequestCancel, onReschedule, onFinish, onNoShow, onMarkDepositPaid, onDone,
}: Props) {
  const [choice, setChoice]   = useState<Choice | null>(null)
  const [newDate, setNewDate] = useState(date)
  const [newTime, setNewTime] = useState(time)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (!ACTIVE.includes(status)) return null

  const minutes = minutesSinceStart(date, time)
  const started = minutes >= 0
  const depositPaid     = paymentStatus === 'partial' || paymentStatus === 'paid'
  const hasDeposit      = depositAmount > 0 || depositPaid
  const byWhatsapp      = depositMethod === 'whatsapp'
  const depositLocked   = depositPaid || !byWhatsapp   // pagada (no se destilda) o por Mercado Pago (se marca sola)

  const run = async (action: () => Promise<string | null>, closeAfter = true) => {
    setSaving(true)
    setError(null)
    const message = await action()
    setSaving(false)
    if (message) { setError(message); return }
    setChoice(null)
    if (closeAfter) onDone?.()
  }

  const pick = (next: Choice) => { setError(null); setChoice(prev => prev === next ? null : next) }

  const chip = (selected: boolean, disabled = false): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
    border: `1px solid ${selected ? accent : '#e0e0e0'}`,
    background: selected ? accent : '#f8f8f8',
    color: selected ? '#fff' : '#000',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })
  const confirmBtn: React.CSSProperties = {
    padding: '8px 14px', borderRadius: '8px', border: 'none', background: accent, color: '#fff',
    fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Lato', sans-serif",
  }
  const field: React.CSSProperties = {
    background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 12px',
    fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none',
  }

  return (
    <section aria-label="Marcar estado" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'Lato', sans-serif" }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>Marcar estado</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button type="button" style={chip(false)} onClick={() => { setChoice(null); onRequestCancel() }}>Cancelar</button>
        <button type="button" style={chip(choice === 'reschedule')} aria-pressed={choice === 'reschedule'} onClick={() => pick('reschedule')}>Reprogramar</button>
        <button
          type="button" style={chip(choice === 'finish', !started)} aria-pressed={choice === 'finish'} disabled={!started}
          title={started ? undefined : 'Se puede finalizar desde la hora de inicio del turno'}
          onClick={() => pick('finish')}
        >
          Finalizado
        </button>
        {hasDeposit && (
          <button
            type="button" role="checkbox" aria-checked={depositPaid} disabled={depositLocked || saving}
            style={chip(depositPaid, depositLocked && !depositPaid)}
            title={depositPaid ? 'La seña ya está paga' : byWhatsapp ? undefined : 'Se marca sola cuando se paga por Mercado Pago'}
            onClick={() => run(onMarkDepositPaid, false)}
          >
            {depositPaid ? '✓ ' : ''}Seña pagada
          </button>
        )}
        <button
          type="button" style={chip(choice === 'noshow', !started)} aria-pressed={choice === 'noshow'} disabled={!started}
          title={started ? undefined : '«No asistió» se puede marcar desde la hora de inicio del turno'}
          onClick={() => pick('noshow')}
        >
          No asistió
        </button>
      </div>

      {hasDeposit && (
        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
          {depositPaid
            ? `Seña pagada${byWhatsapp ? ' (coordinada por WhatsApp)' : ' (Mercado Pago)'}.`
            : byWhatsapp
              ? 'Seña coordinada por WhatsApp: tildala cuando la recibas, el turno queda confirmado con la seña pagada.'
              : 'Seña por Mercado Pago: figura paga sola cuando se acredita el pago.'}
        </p>
      )}
      {!started && (
        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
          «Finalizado» y «No asistió» se pueden marcar desde la hora de inicio. Cancelar y reprogramar, en cualquier momento.
        </p>
      )}

      {choice === 'reschedule' && (
        <div style={{ border: `1px solid ${accent}55`, background: `${accent}0d`, borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
            El turno se mueve a la fecha y hora que elijas, aunque ya haya empezado. A la clienta se le avisa por correo y en su página de avisos, y le aparece una ventana al iniciar sesión.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#777', textTransform: 'uppercase' }}>
              Fecha
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#777', textTransform: 'uppercase' }}>
              Hora
              <input type="time" step={300} value={newTime} onChange={e => setNewTime(e.target.value)} style={field} />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button" disabled={saving || !newDate || !newTime || (newDate === date && newTime === time)}
              style={{ ...confirmBtn, opacity: saving || !newDate || !newTime || (newDate === date && newTime === time) ? 0.6 : 1 }}
              onClick={() => run(() => onReschedule(newDate, newTime))}
            >
              {saving ? 'Guardando...' : 'Confirmar reprogramación'}
            </button>
          </div>
        </div>
      )}

      {choice === 'finish' && (
        <div role="alertdialog" aria-label="¿Marcar como finalizado?" style={{ border: `1px solid ${accent}55`, background: `${accent}0d`, borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#333' }}>El turno pasa a Finalizado: el servicio ya se hizo.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" disabled={saving} style={{ ...confirmBtn, opacity: saving ? 0.7 : 1 }} onClick={() => run(onFinish)}>
              {saving ? 'Guardando...' : 'Sí, marcar finalizado'}
            </button>
          </div>
        </div>
      )}

      {choice === 'noshow' && (
        <div role="alertdialog" aria-label="¿Marcar «No asistió»?" style={{ border: `1px solid ${accent}55`, background: `${accent}0d`, borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#333', lineHeight: 1.45 }}>
            {minutes <= REOPEN_LIMIT_MINUTES
              ? 'Se abrirá un horario nuevo desde ahora, para que otra clienta pueda reservarlo. El horario original no se vuelve a ofrecer y la seña queda retenida.'
              : `Pasaron más de ${REOPEN_LIMIT_MINUTES} minutos: no se abre horario nuevo. El horario original tampoco se vuelve a ofrecer y la seña queda retenida.`}
            {' '}Si pasan más de 30 minutos de la hora de inicio sin llegada registrada, el sistema lo marca solo como «No asistió (automático)».
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" disabled={saving} style={{ ...confirmBtn, opacity: saving ? 0.7 : 1 }} onClick={() => run(onNoShow)}>
              {saving ? 'Guardando...' : 'Sí, marcar «No asistió»'}
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e53935' }}>{error}</p>}
    </section>
  )
}
