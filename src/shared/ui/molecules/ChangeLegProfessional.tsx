import { useState } from 'react'

interface Option { id: string; name: string }

interface Props {
  currentId: string
  // Profesionales entre las que se puede elegir (la actual se saca de la lista).
  options:   Option[]
  // Devuelve el mensaje de error del servidor, o null si salió bien.
  onChange:  (professionalId: string) => Promise<string | null>
}

// Cambiar la profesional de UN servicio de un combo. El servidor valida servicio, franja, vacaciones y
// superposición, y su mensaje se muestra tal cual.
export function ChangeLegProfessional({ currentId, options, onChange }: Props) {
  const others = options.filter(o => o.id !== currentId)
  const [selected, setSelected] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  if (others.length === 0) return null

  const submit = async () => {
    setSaving(true)
    setError(null)
    const err = await onChange(selected)
    setSaving(false)
    if (err) setError(err)
    else setSelected('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <select
          aria-label="Nueva profesional"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{ flex: '1 1 140px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '6px 8px', fontSize: '13px', fontFamily: "'Lato', sans-serif" }}
        >
          <option value="">Cambiar profesional…</option>
          {others.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <button
          type="button"
          disabled={!selected || saving}
          onClick={submit}
          style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: !selected || saving ? 'not-allowed' : 'pointer', opacity: !selected || saving ? 0.6 : 1, fontFamily: "'Lato', sans-serif" }}
        >
          {saving ? 'Cambiando...' : 'Cambiar'}
        </button>
      </div>
      {error && <p role="alert" style={{ margin: 0, fontSize: '12px', color: '#e53935' }}>{error}</p>}
    </div>
  )
}
