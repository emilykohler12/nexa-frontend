import { useState } from 'react'
import { api } from '@/shared/utils/api'
import { StarRatingInput } from '@/shared/ui/molecules/StarRatingInput'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

interface Props {
  appointmentId: string
  serviceName:   string
  primaryColor:  string
  accentColor:   string
  onDone:        () => void
}

// Se muestra una sola vez, la primera vez que el cliente inicia sesión
// después de que su turno se marcó como finalizado — pide puntaje y,
// opcionalmente, un comentario para "Opiniones de clientes" en el home.
export function ReviewPromptModal({ appointmentId, serviceName, primaryColor, accentColor, onDone }: Props) {
  const [rating, setRating]   = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const dismiss = () => {
    api.post(`/api/client/reviews/dismiss`, { appointmentId }).catch(() => {})
    onDone()
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/api/client/reviews', { appointmentId, rating, message: message.trim() || null })
      onDone()
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo enviar la reseña. Intentá de nuevo.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md p-7 text-center"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          ¿Cómo estuvo tu turno?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {serviceName} — tu opinión nos ayuda a mejorar.
        </p>

        <div className="mb-6">
          <StarRatingInput value={rating} onChange={setRating} color={accentColor} />
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          placeholder="Dejanos un comentario (opcional)"
          className="w-full px-4 py-3 rounded-xl border outline-none resize-none mb-4 text-sm"
          style={{ borderColor: '#e5e5e5' }}
        />

        {error && (
          <p className="text-sm text-center mb-4" style={{ color: '#e53935' }}>{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? 'Enviando...' : 'Enviar reseña'}
          </button>
          <button
            onClick={dismiss}
            disabled={submitting}
            className="w-full py-2 text-sm text-center"
            style={{ color: '#999' }}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
