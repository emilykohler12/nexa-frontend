//src/features/auth/components/LoginForm.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../model/schemas'
import { useLogin } from '../hooks/useAuth'
import { useTenant } from '@/features/tenant/TenantContext'
import { ForgotPasswordModal } from './ForgotPasswordModal'
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
          <div className="social-row">
            <button type="button" className="social-btn" disabled={login.isPending} title="Próximamente">
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button type="button" className="social-btn" disabled={login.isPending} title="Próximamente">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

        </div>
      </form>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  )
}