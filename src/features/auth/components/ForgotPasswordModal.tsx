// src/features/auth/components/ForgotPasswordModal.tsx
import { useState } from 'react'
import { z }        from 'zod'
import { api }      from '@/shared/utils/api'
import './ForgotPasswordModal.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

interface Props {
  onClose: () => void
  defaultEmail?: string
}

const emailSchema = z.string().email('Email inválido')

type Step = 'form' | 'sent' | 'reset' | 'done'

export function ForgotPasswordModal({ onClose, defaultEmail }: Props) {
  const [step, setStep]         = useState<Step>('form')
  const [email, setEmail]       = useState(defaultEmail ?? '')
  const [code, setCode]         = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = emailSchema.safeParse(email)
    if (!result.success) { setError('Ingresá un email válido'); return }

    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
    } catch {
      // No revelamos si el email existe o no
    } finally {
      setLoading(false)
      setStep('sent')
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanCode = code.trim()
    if (!/^\d{6}$/.test(cleanCode)) { setError('El código debe tener exactamente 6 dígitos'); return }
    if (password.length < 8)        { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirm)       { setError('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token: cleanCode, password })
      setStep('done')
    } catch (err: any) {
      setError(safeErrorMessage(err, 'Código inválido o expirado. Solicitá uno nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-overlay" onClick={onClose}>
      <div className="forgot-modal" onClick={e => e.stopPropagation()}>

        {/* Paso 1: pedir email */}
        {step === 'form' && (
          <form onSubmit={handleForgot}>
            <h2>Recuperar contraseña</h2>
            <p>Ingresá tu email y te enviaremos un código.</p>
            {error && <div className="forgot-error">{error}</div>}
            <label className="forgot-field">
              Correo electrónico
              <input type="email" placeholder="tu@email.com" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email"
                disabled={loading} autoFocus />
            </label>
            <div className="forgot-actions">
              <button type="button" className="forgot-btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn-main btn-teal" disabled={loading}
                style={{ padding: '10px 24px', width: 'auto' }}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </div>
          </form>
        )}

        {/* Paso 2: email enviado */}
        {step === 'sent' && (
          <div>
            <div className="forgot-step-icon">📧</div>
            <h2 style={{ textAlign: 'center' }}>Revisá tu email</h2>
            <p style={{ textAlign: 'center' }}>
              Si el email está registrado, vas a recibir un <strong>código</strong> en los próximos minutos. Revisá también la carpeta de spam.
            </p>
            <div className="forgot-success-actions">
              <button className="btn-main btn-teal" onClick={() => setStep('reset')}
                style={{ padding: '10px 28px', width: 'auto' }}>
                Ingresar código
              </button>
              <button className="forgot-btn-link" onClick={onClose}>Volver al login</button>
            </div>
          </div>
        )}

        {/* Paso 3: código + nueva contraseña */}
        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <h2>Nueva contraseña</h2>
            <p>Ingresá el código de 6 dígitos que recibiste y tu nueva contraseña.</p>
            {error && <div className="forgot-error">{error}</div>}

            <label className="forgot-field">
              Código de 6 dígitos
              <input type="text" placeholder="123456" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading} autoFocus maxLength={6}
                inputMode="numeric" autoComplete="off" spellCheck={false}
                style={{ letterSpacing: '6px', fontSize: '22px', textAlign: 'center', fontWeight: 700 }}
              />
            </label>

            <label className="forgot-field">
              Nueva contraseña
              <input type="password" placeholder="Mínimo 8 caracteres"
                value={password} onChange={e => setPassword(e.target.value)}
                disabled={loading} autoComplete="new-password" />
            </label>

            <label className="forgot-field">
              Confirmar contraseña
              <input type="password" placeholder="Repetí la contraseña"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                disabled={loading} autoComplete="new-password" />
            </label>

            <div className="forgot-actions">
              <button type="button" className="forgot-btn-secondary"
                onClick={() => setStep('sent')} disabled={loading}>
                Atrás
              </button>
              <button type="submit" className="btn-main btn-teal" disabled={loading}
                style={{ padding: '10px 24px', width: 'auto' }}>
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        )}

        {/* Paso 4: éxito */}
        {step === 'done' && (
          <div>
            <div className="forgot-step-icon">✅</div>
            <h2 style={{ textAlign: 'center' }}>¡Contraseña actualizada!</h2>
            <p style={{ textAlign: 'center' }}>
              Tu contraseña fue cambiada correctamente. Ya podés iniciar sesión.
            </p>
            <div className="forgot-success-actions">
              <button className="btn-main btn-teal" onClick={onClose}
                style={{ padding: '10px 28px', width: 'auto' }}>
                Ir al login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}