import { useEffect, useState } from 'react'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

// Vacaciones de la profesional (RF-29): ella carga y edita las suyas. Mientras duran no se le ofrecen horarios
// a las clientas. Sin las dos fechas no hay vacaciones. El servidor valida (inicio no posterior al fin).
export function VacationSection() {
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get<{ profile: { vacationFrom?: string | null; vacationTo?: string | null } }>('/api/professional/profile')
      .then(res => {
        setFrom(res.data.profile.vacationFrom ?? '')
        setTo(res.data.profile.vacationTo ?? '')
      })
      .catch(() => { /* el resto del perfil ya avisa si no se pudo cargar */ })
      .finally(() => setLoading(false))
  }, [])

  const save = async (nextFrom: string, nextTo: string) => {
    setError(null)
    setSaved(false)
    if ((nextFrom === '') !== (nextTo === '')) {
      setError('Cargá la fecha de inicio y la de fin de las vacaciones.')
      return
    }
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError('El inicio de las vacaciones no puede ser posterior al fin.')
      return
    }
    setSaving(true)
    try {
      await api.patch('/api/professional/profile', {
        vacationFrom: nextFrom || null,
        vacationTo:   nextTo   || null,
      })
      setFrom(nextFrom)
      setTo(nextTo)
      setSaved(true)
    } catch (err: unknown) {
      setError(safeErrorMessage(err, 'No se pudieron guardar las vacaciones. Intentá de nuevo.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <section aria-labelledby="vacaciones-titulo" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
      <h3 id="vacaciones-titulo" style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#000' }}>Mis vacaciones</h3>
      <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#555' }}>
        Mientras duren, las clientas no pueden reservar turnos con vos. Los turnos que ya tengas cargados no se tocan.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#333' }}>
          Desde
          <input className="settings-input" type="date" value={from} onChange={e => { setFrom(e.target.value); setSaved(false) }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#333' }}>
          Hasta
          <input className="settings-input" type="date" value={to} onChange={e => { setTo(e.target.value); setSaved(false) }} />
        </label>
        <button className="settings-save-btn" type="button" disabled={saving} onClick={() => save(from, to)}>
          {saving ? 'Guardando...' : 'Guardar vacaciones'}
        </button>
        {(from || to) && (
          <button className="settings-save-btn" type="button" disabled={saving} onClick={() => save('', '')}
            style={{ background: '#f0f0f0', color: '#333' }}>
            Quitar vacaciones
          </button>
        )}
      </div>
      {error && <p role="alert" style={{ margin: '8px 0 0', fontSize: '13px', color: '#e53935' }}>{error}</p>}
      {saved && !error && <p role="status" style={{ margin: '8px 0 0', fontSize: '13px', color: '#2e7d32' }}>✓ Vacaciones guardadas</p>}
    </section>
  )
}
