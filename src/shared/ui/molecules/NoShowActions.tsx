// Acciones del personal (profesional y administrador) sobre la inasistencia de un turno:
//  - «Marcar No asistió»: solo desde la hora de inicio. Hasta 40 minutos después se abre un horario
//    nuevo; pasado ese margen se marca igual pero no se abre.
//  - «Corregir: la clienta vino»: de «No asistió» (manual o automático) a Finalizado o a Confirmado.
// Antes de aplicar el cambio se muestra qué efecto tiene. Las reglas las valida el backend
// (NO_SHOW_BEFORE_START, APPOINTMENT_OVERLAP, ...): acá solo se evita ofrecer lo que no corresponde.
import { useState } from 'react'
import { minutesSinceStart } from '@/shared/utils/argentinaTime'

export type NoShowTarget = 'cancelled_no_show' | 'finished' | 'confirmed'

// Margen (en minutos desde la hora de inicio) hasta el cual marcar «No asistió» abre un horario nuevo.
export const REOPEN_LIMIT_MINUTES = 40

interface Props {
  status:         string
  date:           string   // YYYY-MM-DD
  time:           string   // HH:mm
  accent:         string
  // Devuelve el mensaje de error, o null si salió bien.
  onChangeStatus: (to: NoShowTarget) => Promise<string | null>
  // Se llama cuando el cambio salió bien (por ejemplo para cerrar el modal).
  onDone?:        () => void
}

const NO_SHOW_STATES = ['no_show_auto', 'cancelled_no_show']

function describe(to: NoShowTarget, minutes: number): { title: string; message: string; confirm: string } {
  if (to === 'cancelled_no_show') {
    return {
      title: '¿Marcar «No asistió»?',
      message: minutes <= REOPEN_LIMIT_MINUTES
        ? 'Se abrirá un horario nuevo desde ahora, para que otra clienta pueda reservarlo. El horario original no se vuelve a ofrecer y la seña queda retenida.'
        : `Pasaron más de ${REOPEN_LIMIT_MINUTES} minutos: no se abre horario nuevo. El horario original tampoco se vuelve a ofrecer y la seña queda retenida.`,
      confirm: 'Sí, marcar «No asistió»',
    }
  }
  return {
    title: to === 'finished' ? '¿Corregir a Finalizado?' : '¿Corregir a Confirmado?',
    message: (to === 'finished'
      ? 'El turno pasa a Finalizado: la clienta vino y el servicio se hizo.'
      : 'El turno pasa a Confirmado y se registra que la clienta llegó. Solo se puede si no se superpone con otro turno de la profesional.')
      + ' Si se había abierto un horario nuevo y nadie lo reservó, se cierra; las reservas que ya se hicieron se mantienen. Queda registrado en Actividad.',
    confirm: 'Sí, corregir',
  }
}

export function NoShowActions({ status, date, time, accent, onChangeStatus, onDone }: Props) {
  const [pending, setPending] = useState<{ to: NoShowTarget; minutes: number } | null>(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const canMark    = status === 'confirmed' || status === 'no_show_auto'
  const canCorrect = NO_SHOW_STATES.includes(status)
  if (!canMark && !canCorrect) return null

  // Los minutos se toman al abrir la confirmación: de eso depende lo que se le dice a la usuaria.
  const started = minutesSinceStart(date, time) >= 0

  const ask = (to: NoShowTarget) => {
    setError(null)
    setPending({ to, minutes: minutesSinceStart(date, time) })
  }

  const confirm = async () => {
    if (!pending) return
    setSaving(true)
    setError(null)
    const message = await onChangeStatus(pending.to)
    setSaving(false)
    if (message) { setError(message); return }
    setPending(null)
    onDone?.()
  }

  const btn: React.CSSProperties = {
    padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e5e5', background: '#f8f8f8',
    color: '#000', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: "'Lato', sans-serif",
  }

  const info = pending ? describe(pending.to, pending.minutes) : null

  return (
    <section aria-label="Inasistencia" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'Lato', sans-serif" }}>
      {!pending && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {canMark && (
            <button type="button" onClick={() => ask('cancelled_no_show')} disabled={!started} style={{ ...btn, opacity: started ? 1 : 0.5, cursor: started ? 'pointer' : 'not-allowed' }}>
              Marcar No asistió
            </button>
          )}
          {canCorrect && (
            <>
              <button type="button" onClick={() => ask('finished')} style={btn}>
                Corregir: la clienta vino (a Finalizado)
              </button>
              <button type="button" onClick={() => ask('confirmed')} style={btn}>
                Corregir: la clienta vino (a Confirmado)
              </button>
            </>
          )}
        </div>
      )}
      {canMark && !started && !pending && (
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>«No asistió» se puede marcar desde la hora de inicio del turno.</p>
      )}

      {pending && info && (
        <div role="alertdialog" aria-label={info.title} style={{ border: `1px solid ${accent}55`, background: `${accent}0d`, borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#000' }}>{info.title}</p>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#333', lineHeight: 1.45 }}>{info.message}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setPending(null); setError(null) }} disabled={saving} style={btn}>
              Volver
            </button>
            <button type="button" onClick={confirm} disabled={saving} style={{ ...btn, background: accent, borderColor: accent, color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Guardando...' : info.confirm}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e53935' }}>{error}</p>
      )}
    </section>
  )
}
