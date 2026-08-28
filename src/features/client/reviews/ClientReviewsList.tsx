import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { Review } from '@/shared/types/review'

const STATUS_LABEL: Record<Review['status'], { label: string; color: string }> = {
  pending:  { label: 'En revisión', color: '#d4af37' },
  approved: { label: 'Publicada en el home', color: '#4caf50' },
  rejected: { label: 'No publicada', color: '#999' },
}

// Historial de reseñas que el cliente fue dejando — solo lectura, no se
// pueden editar ni borrar una vez enviadas.
export function ClientReviewsList({ primaryColor }: { primaryColor: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ reviews: Review[] }>('/api/client/reviews')
      .then(res => setReviews(res.data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="appointments-empty">
        <p>Cargando...</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="appointments-empty">
        <Star size={48} className="appointments-empty-icon" />
        <p>Todavía no dejaste ninguna reseña</p>
      </div>
    )
  }

  return (
    <div className="appointments-list">
      {reviews.map(r => {
        const status = STATUS_LABEL[r.status]
        return (
          <div key={r.id} className="appointment-card">
            <div className="appointment-card-top">
              <div>
                {r.serviceName && <h3 style={{ color: '#1a1a1a' }}>{r.serviceName}</h3>}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={16} color={primaryColor} fill={n <= r.rating ? primaryColor : 'none'} strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <span className="appointment-status" style={{ backgroundColor: `${status.color}1a`, color: status.color }}>
                {status.label}
              </span>
            </div>
            {r.message && (
              <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#666', fontFamily: "'Lato', sans-serif" }}>{r.message}</p>
            )}
            <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#aaa', fontFamily: "'Lato', sans-serif" }}>
              {new Date(r.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}
