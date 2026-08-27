import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { AdminClient, ClientGender } from './types'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const GENDER_LABEL: Record<ClientGender, string> = {
  female: 'Femenino', male: 'Masculino', other: 'Otro', prefer_not_to_say: 'Prefiero no decirlo',
}

interface Form {
  name:      string
  email:     string
  phone:     string
  birthDate: string
  gender:    ClientGender | ''
  password:  string
}

const EMPTY: Form = { name: '', email: '', phone: '', birthDate: '', gender: '', password: '' }

interface Props {
  onClose:   () => void
  onCreated: (client: AdminClient) => void
}

export function CreateClientModal({ onClose, onCreated }: Props) {
  const [form, setForm]   = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof Form, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await api.post<{ client: AdminClient }>('/api/admin/clients', {
        name:      form.name,
        email:     form.email,
        phone:     form.phone || undefined,
        birthDate: form.birthDate || undefined,
        gender:    form.gender || undefined,
        password:  form.password || undefined,
      })
      onCreated(res.data.client)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo crear el cliente. Intentá de nuevo.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#000' }}>Nuevo cliente</h2>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={grid}>
          <Field label="Nombre completo *">
            <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
          </Field>
          <Field label="Teléfono">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} />
          </Field>
          <Field label="Fecha de nacimiento">
            <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} style={inp} />
          </Field>
          <Field label="Género">
            <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inp}>
              <option value="">Sin especificar</option>
              {Object.entries(GENDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Contraseña">
            <input type="text" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Se genera una si la dejás vacía" style={inp} />
          </Field>
        </div>

        {error && <p style={{ color: '#c33', fontSize: '14px', fontWeight: 600, margin: '14px 0 0' }}>{error}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={secondaryBtn}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creando...' : 'Crear cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: "'Lato', sans-serif" }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  fontFamily: "'Lato', sans-serif",
}
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: '14px', padding: '24px',
  width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
}
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px',
}
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }
const inp: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none',
  fontFamily: "'Lato', sans-serif", background: '#fff', width: '100%', boxSizing: 'border-box',
}
const primaryBtn: React.CSSProperties = {
  padding: '10px 24px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
  fontFamily: "'Lato', sans-serif",
}
const secondaryBtn: React.CSSProperties = {
  padding: '10px 24px', border: '1px solid #ddd', borderRadius: '8px',
  background: '#fff', color: '#000', cursor: 'pointer', fontSize: '15px', fontWeight: 700,
  fontFamily: "'Lato', sans-serif",
}
