// src/pages/admin/professionals/InviteModal.tsx
import { useState }       from 'react'
import { X, Copy, Check } from 'lucide-react'
import { api }            from '@/shared/utils/api'
import { useTenant }      from '@/features/tenant/TenantContext'
import './InviteModal.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

interface GeneratedLink {
  email:     string
  token:     string
  expiresAt: string
}

interface Props {
  onClose: () => void
  onInviteSent?: () => void
}

export function InviteModal({ onClose, onInviteSent }: Props) {
  const { business }                    = useTenant()
  const [email,      setEmail]          = useState('')
  const [expiresAt,  setExpiresAt]      = useState('')
  const [emailError, setEmailError]     = useState('')
  const [apiError,   setApiError]       = useState('')
  const [loading,    setLoading]        = useState(false)
  const [generated,  setGenerated]      = useState<GeneratedLink | null>(null)
  const [previous,   setPrevious]       = useState<GeneratedLink[]>([])
  const [copied,     setCopied]         = useState(false)

  const primary    = business?.primaryColor ?? '#069494'
  const inviteUrl  = generated
    ? `${window.location.origin}/registro-profesional?token=${generated.token}`
    : ''

  const validate = (): boolean => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ingresá un email válido')
      return false
    }
    setEmailError('')
    return true
  }

  const handleGenerate = async () => {
    if (!validate()) return
    setLoading(true)
    setApiError('')
    
    try {
      const res = await api.post<{ token: string; expiresAt: string }>('/api/invitations', {
        email,
        expiresAt: expiresAt || undefined,
      })

      const newLink: GeneratedLink = {
        email,
        token:     res.data.token,
        expiresAt: res.data.expiresAt,
      }

      setGenerated(newLink)
      onInviteSent?.()
      setPrevious(prev => [newLink, ...prev])
      setEmail('')
      setExpiresAt('')
    } catch (err: any) {
      setApiError(safeErrorMessage(err, 'Error al generar la invitación'))
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsapp = () => {
    const msg = `Hola! Te invito a registrarte como profesional. Usá este link: ${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Invitación para registrarte como profesional'
    const body    = `Hola,\n\nTe invitamos a unirte. Completá tu registro con este link:\n${inviteUrl}\n\nEl link vence el ${new Date(generated?.expiresAt ?? '').toLocaleDateString('es-AR')}.`
    window.open(`mailto:${generated?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const showQr = () => {
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inviteUrl)}`, '_blank')
  }

  return (
    <div className="invite-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={e => e.stopPropagation()}>

        <div className="invite-modal-header">
          <h2>Invitar profesional</h2>
          <button className="invite-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="invite-form">
          <label className="invite-field">
            <span>Email del profesional</span>
            <input
              type="email"
              placeholder="profesional@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
            />
            {emailError && <p className="invite-field-error">{emailError}</p>}
          </label>

          <label className="invite-field">
            <span>Vencimiento del link</span>
            <input
              type="date"
              value={expiresAt}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setExpiresAt(e.target.value)}
            />
            <p className="invite-field-hint">Vacío = 7 días por defecto</p>
          </label>

          {apiError && <p className="invite-field-error">{apiError}</p>}

          <button
            className="invite-btn-primary"
            style={{ background: primary }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar link'}
          </button>
        </div>

        {generated && (
          <div className="invite-result">
            <p className="invite-result-label">
              Link generado — vence el {new Date(generated.expiresAt).toLocaleDateString('es-AR')}:
            </p>
            <div className="invite-link-box">{inviteUrl}</div>
            <div className="invite-share-row">
              <button className="invite-share-btn copy"     onClick={copy}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
              <button className="invite-share-btn whatsapp" onClick={shareWhatsapp}>WhatsApp</button>
              <button className="invite-share-btn email"    onClick={shareEmail}>Email</button>
              <button className="invite-share-btn qr"       onClick={showQr}>Ver QR</button>
            </div>
          </div>
        )}

        {previous.length > 0 && (
          <div className="invite-history">
            <p className="invite-history-title">Links anteriores</p>
            {previous.map((inv, i) => (
              <div key={i} className="invite-history-row">
                <span>{inv.email}</span>
                <span className="invite-history-active">
                  Vence {new Date(inv.expiresAt).toLocaleDateString('es-AR')}
                </span>
                <button
                  className="invite-copy-small"
                  onClick={() => navigator.clipboard.writeText(
                    `${window.location.origin}/registro-profesional?token=${inv.token}`
                  )}
                >
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}