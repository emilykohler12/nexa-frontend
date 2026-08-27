import type { AdminClient } from '../types'

const EMPTY_LOYALTY = { totalVisits: 0, totalSpent: 0, lastVisit: null, points: 0, availablePromos: [] as string[] }

export function LoyaltyTab({ client }: { client: AdminClient }) {
  const loyalty = client.loyalty ?? EMPTY_LOYALTY

  const stats = [
    { label: 'Total de visitas',   value: loyalty.totalVisits },
    { label: 'Total gastado',      value: `$${loyalty.totalSpent.toLocaleString('es-AR')}` },
    {
      label: 'Última visita',
      value: loyalty.lastVisit
        ? new Date(loyalty.lastVisit + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—',
    },
    { label: 'Puntos acumulados', value: loyalty.points },
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
          Promociones disponibles
        </p>
        {loyalty.availablePromos.length === 0 ? (
          <p style={{ color: '#000', fontSize: '15px', margin: 0 }}>Sin promociones activas</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loyalty.availablePromos.map((promo, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#8a6800', fontSize: '15px', fontWeight: 700 }}>
                🎁 {promo}
              </div>
            ))}
          </div>
        )}
        <p style={{ margin: '16px 0 0', fontSize: '13px', color: '#777' }}>
          Programa de puntos — cada visita suma 10 puntos. 100 puntos = $500 de descuento.
        </p>
      </div>
    </div>
  )
}