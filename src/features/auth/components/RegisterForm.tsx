//Src/features/auth/components/RegisterForm.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../model/schemas'
import { useRegister } from '../hooks/useAuth'
import { useTenant }   from '@/features/tenant/TenantContext'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  const registerUser  = useRegister()
  const { business }  = useTenant()
  const [showPass, setShowPass] = useState(false)

  const errorMessage = registerUser.error
    ? safeErrorMessage(registerUser.error, 'Error al registrarse. Intentá de nuevo.')
    : null

  return (
    <form onSubmit={handleSubmit((data) => registerUser.mutate(data))} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="animate-in" style={{ flex: 1 }}>

        <div className="logo-wrap" style={{ marginBottom: 16 }}>
          {business?.logo && <img src={business.logo} alt={business.name || 'Logo'} style={{ width: 100, height: 100 }} />}
          <span className="logo-title" style={{ fontSize: 22 }}>REGISTRO</span>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Nombre */}
        <div className="field-group">
          <span className="field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </span>
          <input
            className="field-input"
            type="text"
            placeholder="Nombre"
            autoComplete="name"
            disabled={registerUser.isPending}
            {...register('name')}
          />
        </div>
        {errors.name && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.name.message}</p>}

        {/* Teléfono */}
        <div className="field-group">
          <span className="field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
            </svg>
          </span>
          <input
            className="field-input"
            type="tel"
            placeholder="Teléfono"
            autoComplete="tel"
            disabled={registerUser.isPending}
            {...register('phone')}
          />
        </div>
        {errors.phone && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.phone.message}</p>}

        {/* Email */}
        <div className="field-group">
          <span className="field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input
            className="field-input"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            disabled={registerUser.isPending}
            {...register('email')}
          />
        </div>
        {errors.email && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.email.message}</p>}

        {/* Género */}
        <div className="field-group">
          <span className="field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <select
            className="field-select"
            disabled={registerUser.isPending}
            {...register('gender')}
          >
            <option value="">Género</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
            <option value="other">Otro</option>
            <option value="prefer_not_to_say">Prefiero no decirlo</option>
          </select>
          <span style={{ color: '#ccc', fontSize: 10 }}>▾</span>
        </div>

        {/* Contraseña */}
        <div className="field-group">
          <span className="field-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </span>
          <input
            className="field-input"
            type={showPass ? 'text' : 'password'}
            placeholder="Contraseña"
            autoComplete="new-password"
            disabled={registerUser.isPending}
            {...register('password')}
          />
          <button type="button" className="field-eye" onClick={() => setShowPass(!showPass)} disabled={registerUser.isPending}>
            {showPass
              ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            }
          </button>
        </div>
        {errors.password && <p style={{ color: '#c33', fontSize: 12, marginTop: -14, marginBottom: 10 }}>{errors.password.message}</p>}

        {/* Botón registrarse */}
        <button type="submit" className="btn-main btn-gold btn-full" disabled={registerUser.isPending}>
          {registerUser.isPending
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" /> REGISTRANDO...
              </span>
            : 'REGISTRARSE'
          }
        </button>

        {/* Separador */}
        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">O ingresar con</span>
          <div className="divider-line" />
        </div>

        {/* Social */}
        <div className="social-row">
          <button type="button" className="social-btn" disabled={registerUser.isPending} title="Próximamente">
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" className="social-btn" disabled={registerUser.isPending} title="Próximamente">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

      </div>
    </form>
  )
}