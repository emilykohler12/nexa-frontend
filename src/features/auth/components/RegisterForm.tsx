//Src/features/auth/components/RegisterForm.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../model/schemas'
import { useRegister } from '../hooks/useAuth'
import { useTenant }   from '@/features/tenant/TenantContext'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { ROUTES } from '@/app/config/routes.config'

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

        {/* Términos y Política de Privacidad — RF-06.01 */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>
          <input
            type="checkbox"
            disabled={registerUser.isPending}
            {...register('termsAccepted')}
            style={{ marginTop: 2 }}
          />
          <span>
            Acepto los Términos de Servicio y la{' '}
            <Link to={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
              Política de Privacidad
            </Link>.
          </span>
        </label>
        {errors.termsAccepted && <p style={{ color: '#c33', fontSize: 12, marginBottom: 10 }}>{errors.termsAccepted.message}</p>}

        {/* Botón registrarse */}
        <button type="submit" className="btn-main btn-gold btn-full" disabled={registerUser.isPending}>
          {registerUser.isPending
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="loading-spinner" /> REGISTRANDO...
              </span>
            : 'REGISTRARSE'
          }
        </button>


      </div>
    </form>
  )
}