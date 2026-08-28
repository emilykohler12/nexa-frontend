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
    return <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>Cargando...</p>
  }

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#aaa' }}>
        <Star size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
        <p style={{ fontSize: '16px' }}>Todavía no dejaste ninguna reseña</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {reviews.map(r => {
        const status = STATUS_LABEL[r.status]
        return (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
              <div>
                {r.serviceName && (
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '15px', color: '#000' }}>{r.serviceName}</p>
                )}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={15} color={primaryColor} fill={n <= r.rating ? primaryColor : 'none'} strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${status.color}18`, color: status.color, whiteSpace: 'nowrap' }}>
                {status.label}
              </span>
            </div>
            {r.message && (
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#333' }}>{r.message}</p>
            )}
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#aaa' }}>
              {new Date(r.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}
