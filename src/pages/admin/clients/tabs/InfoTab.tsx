import { useState } from 'react'
import type { AdminClient } from '../types'

const GENDER_LABEL: Record<string, string> = {
  female:          'Femenino',
  male:            'Masculino',
  other:           'Otro',
  prefer_not_to_say: 'Prefiero no decirlo',
}

interface Props {
  client: AdminClient
  onSave: (updated: AdminClient) => Promise<void>
}

const EMPTY_CLINICAL = { allergies: '', preferences: '', observations: '' }

export function InfoTab({ client, onSave }: Props) {
  const [form, setForm] = useState({ ...client, clinical: client.clinical ?? EMPTY_CLINICAL })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof AdminClient, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }))

  const setClinical = (key: keyof AdminClient['clinical'], value: unknown) =>
    setForm(f => ({ ...f, clinical: { ...f.clinical, [key]: value } }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No se pudo guardar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <Section title="Datos personales">
        <Grid>
          <Field label="Nombre completo">
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
          </Field>
          <Field label="Teléfono">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
          </Field>
          <Field label="Fecha de nacimiento">
            <input type="date" value={form.birthDate ?? ''} onChange={e => set('birthDate', e.target.value || null)} style={inp} />
          </Field>
          <Field label="Género">
            <select value={form.gender ?? ''} onChange={e => set('gender', e.target.value || null)} style={inp}>
              <option value="">Sin especificar</option>
              {Object.entries(GENDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Información clínica">
        <Grid>
          <Field label="Alergias">
            <textarea value={form.clinical.allergies} onChange={e => setClinical('allergies', e.target.value)} style={{ ...inp, resize: 'vertical' }} rows={2} />
          </Field>
          <Field label="Preferencias">
            <textarea value={form.clinical.preferences} onChange={e => setClinical('preferences', e.target.value)} style={{ ...inp, resize: 'vertical' }} rows={2} />
          </Field>
          <Field label="Observaciones">
            <textarea value={form.clinical.observations} onChange={e => setClinical('observations', e.target.value)} style={{ ...inp, resize: 'vertical' }} rows={2} />
          </Field>
        </Grid>
      </Section>

      {error && (
        <p style={{ color: '#c33', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', border: 'none', borderRadius: '8px',
            background: saved ? '#4caf50' : '#069494',
            color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
            fontFamily: "'Lato', sans-serif",
            transition: 'background 0.2s',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
      <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '16px', color: '#000', fontFamily: "'Lato', sans-serif" }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
      {children}
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: "'Lato', sans-serif", ...style }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inp: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none',
  fontFamily: "'Lato', sans-serif",
  background: '#fff', width: '100%',
}
