import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { AdminClient } from '../types'
import type { Review } from '@/shared/types/review'

const STATUS_LABEL: Record<Review['status'], { label: string; color: string }> = {
  pending:  { label: 'Pendiente de revisión', color: '#d4af37' },
  approved: { label: 'Publicada en el home',  color: '#4caf50' },
  rejected: { label: 'No publicada',          color: '#999'    },
}

export function ReviewsTab({ client }: { client: AdminClient }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ reviews: Review[] }>(`/api/admin/clients/${client.id}/reviews`)
      .then(res => setReviews(res.data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [client.id])

  if (loading) {
    return (
      <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px', fontFamily: "'Lato', sans-serif" }}>
        Cargando...
      </p>
    )
  }

  if (reviews.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px', fontFamily: "'Lato', sans-serif" }}>
        Este cliente todavía no dejó ninguna reseña
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'Lato', sans-serif" }}>
      {reviews.map(r => {
        const status = STATUS_LABEL[r.status]
        return (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
              <div>
                {r.serviceName && (
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '15px', color: '#000' }}>{r.serviceName}</p>
                )}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={15} color="#d4af37" fill={n <= r.rating ? '#d4af37' : 'none'} strokeWidth={1.5} />
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
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#999' }}>
              {new Date(r.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}
