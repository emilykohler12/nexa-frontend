import { useState, useEffect } from 'react'
import { Gift, Cake } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { AdminClient } from '../types'
import type { AutoPromotion } from '@/app/data/admin/promotions/autoPromotionTypes'

const EMPTY_LOYALTY = { totalVisits: 0, totalSpent: 0, lastVisit: null, points: 0, availablePromos: [] as string[] }

function discountText(p: AutoPromotion): string {
  return p.discountType === 'percent' ? `${p.discountValue}% de descuento` : `$${p.discountValue.toLocaleString('es-AR')} de descuento`
}

export function LoyaltyTab({ client }: { client: AdminClient }) {
  const loyalty = client.loyalty ?? EMPTY_LOYALTY
  const [promos, setPromos] = useState<AutoPromotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ autoPromotions: AutoPromotion[] }>(`/api/admin/clients/${client.id}/auto-promotions`)
      .then(res => setPromos(res.data.autoPromotions ?? []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false))
  }, [client.id])

  const stats = [
    { label: 'Total de visitas',   value: loyalty.totalVisits },
    { label: 'Total gastado',      value: `$${loyalty.totalSpent.toLocaleString('es-AR')}` },
    {
      label: 'Última visita',
      value: loyalty.lastVisit
        ? new Date(loyalty.lastVisit + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </p>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#069494' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '20px' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '16px', color: '#000' }}>
          Campañas activas para este cliente
        </p>
        {loading ? (
          <p style={{ color: '#000', fontSize: '15px', margin: 0 }}>Cargando...</p>
        ) : promos.length === 0 ? (
          <p style={{ color: '#000', fontSize: '15px', margin: 0 }}>No tiene ninguna campaña automática activa por ahora.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {promos.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#8a6800', fontSize: '15px', fontWeight: 700 }}>
                {p.trigger === 'birthday' ? <Cake size={15} /> : <Gift size={15} />}
                {p.name} — {discountText(p)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
