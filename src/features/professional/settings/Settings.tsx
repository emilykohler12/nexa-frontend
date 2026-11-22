// src/features/professional/settings/Settings.tsx
import { useState, useEffect } from 'react'
import { Eye, EyeOff }  from 'lucide-react'
import { useAuth }      from '@/features/auth/AuthContext'
import { useTenant }    from '@/features/tenant/TenantContext'
import { api }          from '@/shared/utils/api'
import { PhotoUpload }  from '@/shared/ui/atoms/PhotoUpload'
import './Settings.css'
import { VacationSection } from './VacationSection'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

type Tab = 'personal' | 'work' | 'security'

interface ProfileForm {
  name:      string
  phone:     string
  bio:       string
  photo:     string | null
  specialty: string
  instagram: string
  facebook:  string
  tiktok:    string
  twitter:   string
  // Experiencia
  yearsExperience: number
  certifications:  string
  // Lo único que carga la profesional de sus políticas. Tolerancia, llegadas tarde, cancelación, reprogramación, seña y
  // métodos de pago los define el administrador para todo el negocio.
  priorRecommendations: string
  afterCare:            string
}

const EMPTY_FORM: ProfileForm = {
  name: '', phone: '', bio: '', photo: null,
  specialty: '', instagram: '', facebook: '', tiktok: '', twitter: '',
  yearsExperience: 0, certifications: '',
  priorRecommendations: '', afterCare: '',
}

export function Settings() {
  const { business }     = useTenant()
  const { user, login }  = useAuth()

  const [tab, setTab]         = useState<Tab>('personal')
  const [form, setForm]       = useState<ProfileForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent]         = useState(false)
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [pwError, setPwError]                 = useState<string | null>(null)
  const [pwSaved, setPwSaved]                 = useState(false)
  const [pwSaving, setPwSaving]               = useState(false)

  useEffect(() => {
    api.get<{ profile: Partial<Record<keyof ProfileForm, unknown>> & Partial<ProfileForm> }>('/api/professional/profile')
      .then(res => {
        const p = res.data.profile
        setForm({
          name:      p.name      ?? '',
          phone:     p.phone     ?? '',
          bio:       p.bio       ?? '',
          photo:     p.photo     ?? null,
          specialty: p.specialty ?? '',
          instagram: p.instagram ?? '',
          facebook:  p.facebook  ?? '',
          tiktok:    p.tiktok    ?? '',
          twitter:   p.twitter   ?? '',
          yearsExperience:      p.yearsExperience      ?? 0,
          certifications:       p.certifications       ?? '',
          priorRecommendations: p.priorRecommendations ?? '',
          afterCare:            p.afterCare            ?? '',
        })
      })
      .catch((err: unknown) => {
        const msg = safeErrorMessage(err, 'No se pudo cargar el perfil')
        setLoadError(msg)
        console.error('[Settings] Error cargando perfil:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // Después de todos los hooks: un return anticipado antes de un hook cambia el orden de los hooks entre renders.
  if (!business) return null
  const primary = business.primaryColor

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await api.patch('/api/professional/profile', form)
      if (user) login({ ...user, name: form.name, photo: form.photo })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      const msg = safeErrorMessage(err, 'Error al guardar los cambios')
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPwError(null)
    setPwSaved(false)

    const trimmed = newPassword.trim()

    if (!currentPassword) {
      setPwError('Ingresá tu contraseña actual')
      return
    }
    if (!trimmed) {
      setPwError('Ingresá la nueva contraseña')
      return
    }
    if (trimmed.length < 8) {
      setPwError(`La contraseña tiene ${trimmed.length} caracteres. Necesita al menos 8.`)
      return
    }
    if (trimmed !== confirmPassword.trim()) {
      setPwError('Las contraseñas no coinciden')
      return
    }

    setPwSaving(true)
    try {
      await api.post('/api/auth/change-password', { currentPassword, password: trimmed })
      setPwSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: unknown) {
      const msg = safeErrorMessage(err, 'Error al cambiar la contraseña')
      setPwError(msg)
      console.error('[Settings] Error cambiando contraseña:', err)
    } finally {
      setPwSaving(false)
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'personal', label: 'Datos personales'      },
    { id: 'work',     label: 'Experiencia' },
    { id: 'security', label: 'Seguridad'              },
  ]

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Configuración</h1>
        </div>
        <div className="settings-loading">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Configuración</h1>
        <p className="settings-subtitle">Editá tu información y preferencias</p>
      </div>

      <div className="settings-tabs-wrap">
        <div className="settings-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`settings-tab${tab === t.id ? ' active' : ''}`}
              style={tab === t.id ? { background: primary, color: '#fff' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: datos personales */}
      {tab === 'personal' && (
        <div className="settings-card">
          {loadError && (
            <div className="settings-error">
              {loadError}
              <button className="settings-retry-btn" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          )}

          {saveError && <div className="settings-error">{saveError}</div>}

          <div className="settings-photo-wrap">
            <PhotoUpload
              value={form.photo}
              onChange={v => setForm(f => ({ ...f, photo: v }))}
              primary={primary}
              size={88}
            />
          </div>

          <div className="settings-grid">
            <Field label="Nombre">
              <input
                className="settings-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </Field>

            <Field label="Email">
              <div className="settings-input-locked">
                <span className="settings-locked-email">{user?.email ?? ''}</span>
                <span className="settings-locked-badge">No editable</span>
              </div>
            </Field>

            <Field label="Teléfono">
              <input
                className="settings-input"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+54 376 ..."
              />
            </Field>

            <Field label="Especialidad">
              <input
                className="settings-input"
                value={form.specialty}
                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                placeholder="Ej: Cabello, Uñas..."
              />
            </Field>
          </div>

          <Field label="Biografía">
            <textarea
              className="settings-input settings-textarea"
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Contale algo a tus clientes..."
            />
          </Field>

          <div className="settings-section-title">Redes sociales</div>
          <div className="settings-grid">
            <Field label="Instagram">
              <input className="settings-input" value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="https://instagram.com/..." />
            </Field>
            <Field label="Facebook">
              <input className="settings-input" value={form.facebook}
                onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))}
                placeholder="https://facebook.com/..." />
            </Field>
            <Field label="TikTok">
              <input className="settings-input" value={form.tiktok}
                onChange={e => setForm(f => ({ ...f, tiktok: e.target.value }))}
                placeholder="https://tiktok.com/@..." />
            </Field>
            <Field label="Twitter / X">
              <input className="settings-input" value={form.twitter}
                onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))}
                placeholder="https://x.com/..." />
            </Field>
          </div>

          <div className="settings-actions">
            <button
              className={`settings-save-btn${saved ? ' saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: experiencia y políticas */}
      {tab === 'work' && (
        <div className="settings-card">
          {saveError && <div className="settings-error">{saveError}</div>}

          <div className="settings-section-title">Experiencia</div>
          <div className="settings-grid">
            <Field label="Años de experiencia">
              <input
                className="settings-input"
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={e => setForm(f => ({ ...f, yearsExperience: Number(e.target.value) }))}
                placeholder="0"
              />
            </Field>
          </div>
          <Field label="Certificaciones y cursos">
            <textarea
              className="settings-input settings-textarea"
              rows={3}
              value={form.certifications}
              onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))}
              placeholder="Certificaciones, cursos y formación relevante..."
            />
          </Field>

          <div className="settings-section-title">Recomendaciones</div>
          <Field label="Recomendaciones previas al turno">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.priorRecommendations}
              onChange={e => setForm(f => ({ ...f, priorRecommendations: e.target.value }))}
              placeholder="Qué debería saber o hacer el cliente antes de venir..."
            />
          </Field>
          <Field label="Cuidados posteriores">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.afterCare}
              onChange={e => setForm(f => ({ ...f, afterCare: e.target.value }))}
              placeholder="Cuidados que debería tener el cliente después del servicio..."
            />
          </Field>

          <div className="settings-actions">
            <button
              className={`settings-save-btn${saved ? ' saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>

          <VacationSection />
        </div>
      )}

      {/* Tab: seguridad */}
      {tab === 'security' && (
        <div className="settings-card">
          <div className="settings-section-title">Sesión</div>
          <div className="settings-session-info">
            <div className="settings-session-row">
              <span className="settings-session-label">Cuenta creada</span>
              <span className="settings-session-value">
                {user?.createdAt ? formatDate(user.createdAt) : 'No disponible'}
              </span>
            </div>
          </div>

          <div className="settings-section-title">Cambiar contraseña</div>

          <div className="settings-grid settings-grid--single">
            <Field label="Contraseña actual">
              <div className="settings-password-wrap">
                <input
                  className="settings-input"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => {
                    setCurrentPassword(e.target.value)
                    if (pwError) setPwError(null)
                  }}
                  placeholder="Tu contraseña de ahora"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="settings-eye-btn"
                  onClick={() => setShowCurrent(s => !s)}
                  aria-label={showCurrent ? 'Ocultar' : 'Mostrar'}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <Field label="Nueva contraseña">
              <div className="settings-password-wrap">
                <input
                  className="settings-input"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value)
                    // Limpiar error al escribir para que no confunda
                    if (pwError) setPwError(null)
                  }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="settings-eye-btn"
                  onClick={() => setShowNew(s => !s)}
                  aria-label={showNew ? 'Ocultar' : 'Mostrar'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar contraseña">
              <div className="settings-password-wrap">
                <input
                  className="settings-input"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value)
                    if (pwError) setPwError(null)
                  }}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="settings-eye-btn"
                  onClick={() => setShowConfirm(s => !s)}
                  aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
          </div>

          {/* Indicador de longitud — ayuda visual para el usuario */}
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="settings-pw-hint">
              {newPassword.length}/8 caracteres mínimos
            </p>
          )}

          {pwError && <div className="settings-error">{pwError}</div>}
          {pwSaved && <div className="settings-success">✓ Contraseña actualizada correctamente</div>}

          <div className="settings-actions">
            <button
              className="settings-save-btn"
              onClick={handlePasswordChange}
              disabled={pwSaving || !currentPassword || newPassword.length < 8}
            >
              {pwSaving ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="settings-field">
      <span className="settings-field-label">{label}</span>
      {children}
    </label>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return 'No disponible'
  return date.toLocaleDateString('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires' })
}