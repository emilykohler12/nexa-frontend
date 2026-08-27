// src/features/professional/settings/Settings.tsx
import { useState, useEffect } from 'react'
import { Eye, EyeOff }  from 'lucide-react'
import { useAuth }      from '@/features/auth/AuthContext'
import { useTenant }    from '@/features/tenant/TenantContext'
import { api }          from '@/shared/utils/api'
import { PhotoUpload }  from '@/shared/ui/atoms/PhotoUpload'
import './Settings.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import type { PaymentMethod } from '@/features/professional/onboarding/types'

type Tab = 'personal' | 'work' | 'security'

// Mercado Pago eliminado — solo efectivo, transferencia y tarjeta
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',     label: 'Efectivo'      },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card',     label: 'Tarjeta'       },
]

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
  languages:       string
  certifications:  string
  // Políticas
  toleranceMinutes:     number
  latePenalty:          string
  cancellationPolicy:   string
  reschedulePolicy:     string
  depositPolicy:        string
  priorRecommendations: string
  afterCare:            string
  paymentMethods:       PaymentMethod[]
}

const EMPTY_FORM: ProfileForm = {
  name: '', phone: '', bio: '', photo: null,
  specialty: '', instagram: '', facebook: '', tiktok: '', twitter: '',
  yearsExperience: 0, languages: '', certifications: '',
  toleranceMinutes: 15, latePenalty: '', cancellationPolicy: '',
  reschedulePolicy: '', depositPolicy: '', priorRecommendations: '', afterCare: '',
  paymentMethods: ['cash', 'transfer'],
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
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [pwError, setPwError]                 = useState<string | null>(null)
  const [pwSaved, setPwSaved]                 = useState(false)
  const [pwSaving, setPwSaving]               = useState(false)

  if (!business) return null
  const primary = business.primaryColor

  useEffect(() => {
    setLoadError(null)
    api.get<{ profile: any }>('/api/professional/profile')
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
          languages:            p.languages            ?? '',
          certifications:       p.certifications       ?? '',
          toleranceMinutes:     p.toleranceMinutes      ?? 15,
          latePenalty:          p.latePenalty          ?? '',
          cancellationPolicy:   p.cancellationPolicy   ?? '',
          reschedulePolicy:     p.reschedulePolicy     ?? '',
          depositPolicy:        p.depositPolicy        ?? '',
          priorRecommendations: p.priorRecommendations ?? '',
          afterCare:            p.afterCare            ?? '',
          paymentMethods:       p.paymentMethods        ?? ['cash', 'transfer'],
        })
      })
      .catch((err: any) => {
        const msg = safeErrorMessage(err, 'No se pudo cargar el perfil')
        setLoadError(msg)
        console.error('[Settings] Error cargando perfil:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await api.patch('/api/professional/profile', form)
      if (user) login({ ...user, name: form.name, photo: form.photo })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
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
      await api.post('/api/auth/change-password', { password: trimmed })
      setPwSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: any) {
      const msg = safeErrorMessage(err, 'Error al cambiar la contraseña')
      setPwError(msg)
      console.error('[Settings] Error cambiando contraseña:', err)
    } finally {
      setPwSaving(false)
    }
  }

  const togglePayment = (method: PaymentMethod) => {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(method)
        ? f.paymentMethods.filter(m => m !== method)
        : [...f.paymentMethods, method],
    }))
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'personal', label: 'Datos personales'      },
    { id: 'work',     label: 'Experiencia y políticas' },
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
            <Field label="Idiomas que habla">
              <input
                className="settings-input"
                value={form.languages}
                onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                placeholder="Español, Inglés..."
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

          <div className="settings-section-title">Políticas</div>
          <div className="settings-grid">
            <Field label="Tolerancia por llegada tarde (minutos)">
              <input
                className="settings-input"
                type="number"
                min={0}
                value={form.toleranceMinutes}
                onChange={e => setForm(f => ({ ...f, toleranceMinutes: Number(e.target.value) }))}
                placeholder="15"
              />
            </Field>
            <Field label="Métodos de pago que aceptás">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => togglePayment(opt.value)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '9px',
                      border: `1.5px solid ${form.paymentMethods.includes(opt.value) ? primary : '#ddd'}`,
                      background: form.paymentMethods.includes(opt.value) ? `${primary}14` : '#fff',
                      color: form.paymentMethods.includes(opt.value) ? primary : '#444',
                      fontFamily: 'var(--font-lato, "Lato", sans-serif)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Política de llegadas tarde">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.latePenalty}
              onChange={e => setForm(f => ({ ...f, latePenalty: e.target.value }))}
              placeholder="Qué pasa si el cliente llega tarde..."
            />
          </Field>
          <Field label="Política de cancelación">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.cancellationPolicy}
              onChange={e => setForm(f => ({ ...f, cancellationPolicy: e.target.value }))}
              placeholder="Condiciones para cancelar un turno..."
            />
          </Field>
          <Field label="Política de reprogramación">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.reschedulePolicy}
              onChange={e => setForm(f => ({ ...f, reschedulePolicy: e.target.value }))}
              placeholder="Condiciones para reprogramar un turno..."
            />
          </Field>
          <Field label="Política de señas">
            <textarea
              className="settings-input settings-textarea"
              rows={2}
              value={form.depositPolicy}
              onChange={e => setForm(f => ({ ...f, depositPolicy: e.target.value }))}
              placeholder="Condiciones sobre la seña..."
            />
          </Field>
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
                {user?.createdAt ? formatDateTime(user.createdAt) : 'No disponible'}
              </span>
            </div>
          </div>

          <div className="settings-section-title">Cambiar contraseña</div>

          <div className="settings-grid settings-grid--single">
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
              disabled={pwSaving || newPassword.length < 8}
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

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return 'No disponible'
  return date.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
}