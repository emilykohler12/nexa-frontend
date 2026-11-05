// Detalle de la cancelación de un turno para el personal: quién canceló, qué pasó con la seña y, si fue la
// clienta avisando, cuándo avisó, por qué medio, la nota y quién cargó el aviso (objeto `cancellation` del backend).
import { NOTICE_CHANNEL_LABELS, formatHours, type CancellationDetail } from '@/shared/utils/cancellation'

const WHO_LABEL = { client: 'La clienta', studio: 'El estudio', system: 'El sistema (no se pagó a tiempo)' } as const

// Siempre en hora de Argentina, sin depender de la zona del navegador.
function formatArgentina(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function CancellationSummary({ cancellation }: { cancellation: CancellationDetail | null | undefined }) {
  if (!cancellation) return null
  const c = cancellation
  const rows: { label: string; value: string }[] = []

  rows.push({ label: 'Canceló', value: c.cancelledBy ? WHO_LABEL[c.cancelledBy] : 'Sin dato' })
  if (c.cancelledAt) rows.push({ label: 'Cancelado el', value: formatArgentina(c.cancelledAt) })
  if (c.noticeAt) {
    rows.push({ label: 'Avisó la clienta', value: formatArgentina(c.noticeAt) })
    if (c.noticeHours !== null) {
      rows.push({
        label: 'Anticipación',
        value: c.noticeHours >= 0 ? formatHours(c.noticeHours) : `${formatHours(c.noticeHours)} después del inicio del turno`,
      })
    }
  }
  if (c.noticeChannel) rows.push({ label: 'Medio', value: NOTICE_CHANNEL_LABELS[c.noticeChannel] })
  if (c.noticeNote) rows.push({ label: 'Nota', value: c.noticeNote })
  if (c.noticeLoadedBy) {
    rows.push({ label: 'Aviso cargado por', value: `${c.noticeLoadedBy.name}${c.noticeLoadedAt ? ` · ${formatArgentina(c.noticeLoadedAt)}` : ''}` })
  }
  rows.push({ label: 'Seña', value: c.refunded ? 'Marcada como devuelta (el dinero se devuelve por fuera del sistema)' : 'No se marcó como devuelta' })

  return (
    <section aria-label="Cancelación" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'Lato', sans-serif" }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</span>
          <span style={{ fontSize: '14px', color: '#000', fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </section>
  )
}
