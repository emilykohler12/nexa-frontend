//src/features/auth/components/LoginForm.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../model/schemas'
import { useLogin } from '../hooks/useAuth'
import { useTenant } from '@/features/tenant/TenantContext'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { SocialLoginButtons } from './SocialLoginButtons'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  const login          = useLogin()
  const { business }   = useTenant()
  const [showPass, setShowPass]           = useState(false)
  const [showForgot, setShowForgot]       = useState(false)

  const errorMessage = login.error
    ? safeErrorMessage(login.error, 'Error al iniciar sesión. Intentá de nuevo.')
    : null

  return (
    <>
      <form onSubmit={handleSubmit((data) => login.mutate(data))} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="animate-in" style={{ flex: 1 }}>

          <div className="logo-wrap">
            {business?.logo && <img src={business.logo} alt={business.name || 'Logo'} />}
            <span className="logo-title">INGRESAR</span>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {/* Email */}
          <div className="field-group">
            <span className="field-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <input
              className="field-input"
              type="text"
              placeholder="Correo"
              autoComplete="email"
              disabled={login.isPending}
              {...register('email')}
            />
          </div>
          {errors.email && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.email.message}</p>}

          {/* Contraseña */}
          <div className="field-group">
            <span className="field-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              className="field-input"
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              autoComplete="current-password"
              disabled={login.isPending}
              {...register('password')}
            />
            <button type="button" className="field-eye" onClick={() => setShowPass(!showPass)} disabled={login.isPending}>
              {showPass
                ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
          {errors.password && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.password.message}</p>}

          {/* Olvidaste tu contraseña + botón ingresar */}
          <div className="action-row">
            <button
              type="button"
              className="forgot"
              disabled={login.isPending}
              onClick={() => setShowForgot(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
            <button type="submit" className="btn-main btn-teal" disabled={login.isPending}>
              {login.isPending
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="loading-spinner" /> INGRESANDO...
                  </span>
                : 'INGRESAR'
              }
            </button>
          </div>

          {/* Separador */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">O ingresar con</span>
            <div className="divider-line" />
          </div>

          {/* Social */}
          <SocialLoginButtons mode="login" disabled={login.isPending} />

        </div>
      </form>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  )
}