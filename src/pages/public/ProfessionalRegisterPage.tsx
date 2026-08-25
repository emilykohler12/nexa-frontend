//src/pages/public/ProfessionalRegisterPage.tsx

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/shared/utils/api'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'
import './ProfessionalRegisterPage.css'

type State = 'loading' | 'valid' | 'invalid' | 'expired' | 'used'

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'El link de invitación no es válido.',
  expired: 'El link de invitación expiró. Pedile al administrador que genere uno nuevo.',
  used:    'Este link ya fue utilizado. Contactá al administrador.',
}

export function ProfessionalRegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const token          = searchParams.get('token') ?? ''

  const [state, setState] = useState<State>('loading')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) { setState('invalid'); return }

    api.get<{ valid: boolean; email: string }>(`/api/invitations/validate?token=${token}`)
      .then(res => { setEmail(res.data.email); setState('valid') })
      .catch(err => {
        const code = err?.response?.data?.code as string | undefined
        if (code === 'TOKEN_EXPIRED')   setState('expired')
        else if (code === 'TOKEN_USED') setState('used')
        else                            setState('invalid')
      })
  }, [token])

  if (state === 'loading') return <StatusScreen message="Verificando invitación..." />
  if (state !== 'valid')   return <StatusScreen message={ERROR_MESSAGES[state] ?? 'Link inválido'} isError />

  return (
    <div className="prof-reg-page">
      <div className="prof-reg-card">
        <LogoHeader />
        <h1 className="prof-reg-title">Completá tu registro</h1>
        <p className="prof-reg-subtitle">
          Invitación para: <strong>{email}</strong>
        </p>
        <RegisterForm
          token={token}
          email={email}
          onSuccess={() => navigate(ROUTES.PROFESSIONAL_PANEL)}
        />
      </div>
    </div>
  )
}

function LogoHeader() {
  const { business } = useTenant()
  return (
    <div className="prof-reg-logo-wrap">
      {business?.logo && (
        <img src={business.logo} alt={business?.name ?? 'Logo'} className="prof-reg-logo" />
      )}
    </div>
  )
}

// ── Formulario ───────────────────────────────────────────────

interface RegisterFormProps {
  token:     string
  email:     string
  onSuccess: () => void
}

type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say'

interface FormState {
  name:     string
  phone:    string
  password: string
  confirm:  string
  gender:   Gender | ''
}

function RegisterForm({ token, email, onSuccess }: RegisterFormProps) {
  const [form, setForm]       = useState<FormState>({ name: '', phone: '', password: '', confirm: '', gender: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim())              { setError('Ingresá tu nombre completo');         return }
    if (!form.phone.trim())             { setError('Ingresá tu número de teléfono');       return }
    if (!form.gender)                   { setError('Seleccioná tu género');                return }
    if (form.password.length < 8)       { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden');        return }

    setError(null)
    setLoading(true)
    try {
      await api.post('/api/invitations/register', {
        token,
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        gender:   form.gender,
        password: form.password,
      })
      onSuccess()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(message ?? 'Error al completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prof-reg-form">

      {/* Email — solo lectura */}
      <div className="prof-reg-field-group prof-reg-field-group--disabled">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
        <input className="prof-reg-input" value={email} disabled readOnly />
      </div>

      {/* Nombre */}
      <div className="prof-reg-field-group">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </span>
        <input
          className="prof-reg-input"
          type="text"
          placeholder="Nombre completo"
          autoComplete="name"
          disabled={loading}
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </div>

      {/* Teléfono — OBLIGATORIO */}
      <div className="prof-reg-field-group">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
          </svg>
        </span>
        <input
          className="prof-reg-input"
          type="tel"
          placeholder="Teléfono"
          autoComplete="tel"
          disabled={loading}
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
        />
      </div>

      {/* Género — OBLIGATORIO */}
      <div className="prof-reg-field-group">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <select
          className="prof-reg-input prof-reg-select"
          disabled={loading}
          value={form.gender}
          onChange={e => set('gender', e.target.value as Gender | '')}
        >
          <option value="">Género</option>
          <option value="female">Femenino</option>
          <option value="male">Masculino</option>
          <option value="other">Otro</option>
          <option value="prefer_not_to_say">Prefiero no decirlo</option>
        </select>
      </div>

      {/* Contraseña */}
      <div className="prof-reg-field-group">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </span>
        <input
          className="prof-reg-input"
          type={showPass ? 'text' : 'password'}
          placeholder="Contraseña (mínimo 8 caracteres)"
          autoComplete="new-password"
          disabled={loading}
          value={form.password}
          onChange={e => set('password', e.target.value)}
        />
        <button
          type="button"
          className="prof-reg-eye"
          onClick={() => setShowPass(s => !s)}
          disabled={loading}
        >
          {showPass
            ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          }
        </button>
      </div>

      {/* Confirmar contraseña */}
      <div className="prof-reg-field-group">
        <span className="prof-reg-field-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </span>
        <input
          className="prof-reg-input"
          type="password"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          disabled={loading}
          value={form.confirm}
          onChange={e => set('confirm', e.target.value)}
        />
      </div>

      {error && <p className="prof-reg-error">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="prof-reg-submit"
      >
        {loading
          ? <span className="prof-reg-submit-inner"><span className="prof-reg-spinner" /> REGISTRANDO...</span>
          : 'COMPLETAR REGISTRO'
        }
      </button>
    </div>
  )
}

function StatusScreen({ message, isError }: { message: string; isError?: boolean }) {
  return (
    <div className="prof-reg-status">
      <p className={isError ? 'prof-reg-status--error' : 'prof-reg-status--loading'}>
        {message}
      </p>
    </div>
  )
}