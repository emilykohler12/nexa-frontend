import { useState } from 'react'
import { Briefcase, Check } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export function JoinUsSection() {
  const { business } = useTenant()
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (!business) return null
  const { primaryColor, accentColor } = business

  const hasAnyValue = Boolean(name.trim() || email.trim() || phone.trim() || message.trim())

  const handleSubmit = async () => {
    setSending(true)
    setError(null)
    try {
      await api.post('/api/contact/job-interest', {
        name: name.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        message: message.trim() || null,
      })
      setSent(true)
      setName(''); setEmail(''); setPhone(''); setMessage('')
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo enviar tu mensaje. Intentá de nuevo.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="w-full py-16 px-6" style={{ background: `${accentColor}08` }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${primaryColor}12` }}>
          <Briefcase size={24} color={primaryColor} />
        </div>
        <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: 'var(--font-cormorant)', color: primaryColor }}>
          Trabajá con nosotros
        </h2>
        <p className="text-gray-500 mb-10" style={{ fontFamily: 'var(--font-cormorant)' }}>
          ¿Te interesa formar parte del equipo? Dejanos tu mensaje y nos ponemos en contacto.
        </p>

        {sent ? (
          <div className="bg-white rounded-2xl border p-8" style={{ borderColor: '#e5e5e5' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${primaryColor}15` }}>
              <Check size={22} color={primaryColor} />
            </div>
            <p style={{ fontFamily: 'var(--font-cormorant)', color: '#333' }}>
              ¡Gracias! Recibimos tu mensaje.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm underline"
              style={{ color: primaryColor, fontFamily: 'var(--font-cormorant)' }}
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-6 sm:p-8 text-left" style={{ borderColor: '#e5e5e5' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-cormorant)' }}
              />
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Teléfono"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-cormorant)' }}
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Correo"
              className="w-full px-4 py-3 rounded-xl border outline-none mb-4"
              style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-cormorant)' }}
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Contanos por qué te gustaría sumarte al equipo"
              className="w-full px-4 py-3 rounded-xl border outline-none resize-none mb-4"
              style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-cormorant)' }}
            />

            {error && (
              <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-cormorant)' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!hasAnyValue || sending}
              className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-cormorant)' }}
            >
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
