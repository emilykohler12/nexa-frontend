// src/pages/client/ProfilePage.tsx
import { useState }   from 'react'
import { User, Phone, Mail, Lock, ChevronRight } from 'lucide-react'
import { useTenant }  from '@/features/tenant/TenantContext'
import { useAuth }    from '@/features/auth/AuthContext'
import { api }        from '@/shared/utils/api'
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal'
import './ProfilePage.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export function ProfilePage() {
  const { business }  = useTenant()
  const { user, login } = useAuth()

  const [name,  setName]  = useState(user?.name  ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)

  if (!business || !user) return null
  const { primaryColor, accentColor } = business
  const initial = user.name?.charAt(0).toUpperCase() ?? '?'

  const handleSave = async () => {
    setError('')
    try {
      const res = await api.patch<{ user: typeof user }>('/api/client/profile', { name, phone })
      login(res.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'Error al guardar. Intentá de nuevo.'))
    }
  }

  return (
    <div className="profile-page">

      {/* Header con avatar */}
      <div className="profile-hero" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
        <div className="profile-avatar">{initial}</div>
        <div>
          <h1 className="profile-hero-name">{user.name}</h1>
          <p className="profile-hero-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-cards">

        {/* Datos personales */}
        <div className="profile-card">
          <p className="profile-card-title">Datos personales</p>

          <div className="profile-form-row">
            <label className="profile-field">
              <span><User size={14} /> Nombre</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e  => (e.currentTarget.style.borderColor = primaryColor)}
                onBlur={e   => (e.currentTarget.style.borderColor = '#e5e5e5')}
              />
            </label>

            <label className="profile-field">
              <span><Phone size={14} /> Teléfono</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={e  => (e.currentTarget.style.borderColor = primaryColor)}
                onBlur={e   => (e.currentTarget.style.borderColor = '#e5e5e5')}
                placeholder="+54 376 ..."
              />
            </label>
          </div>

          <label className="profile-field">
            <span><Mail size={14} /> Email</span>
            <input type="email" value={user.email} disabled className="profile-field--disabled" />
            <p className="profile-field-hint">El email no se puede cambiar</p>
          </label>

          {error && <p className="profile-error">{error}</p>}

          <button
            onClick={handleSave}
            className="profile-save-btn"
            style={{ backgroundColor: saved ? '#16a34a' : primaryColor }}
          >
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>

        {/* Seguridad */}
        <div className="profile-card">
          <p className="profile-card-title">Seguridad</p>
          <button className="profile-security-row" onClick={() => setShowChangePassword(true)}>
            <span className="profile-security-icon" style={{ background: `${primaryColor}12`, color: primaryColor }}>
              <Lock size={16} />
            </span>
            <span className="profile-security-text">
              <span className="profile-security-label">Cambiar contraseña</span>
              <span className="profile-security-hint">Te enviamos un código a tu correo</span>
            </span>
            <ChevronRight size={18} color="#bbb" />
          </button>
        </div>
      </div>

      {showChangePassword && (
        <ForgotPasswordModal onClose={() => setShowChangePassword(false)} defaultEmail={user.email} />
      )}
    </div>
  )
}
