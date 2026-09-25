import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, ArrowRight } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { isPromotionLive } from '@/shared/utils/promotionWindow'
import { setPendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'

// Mismo ancho que las tarjetas de ProductPromotionsSection — para que las
// promos de servicios y de productos se vean del mismo tamaño de "cuadro"
// aunque una sección sea carrusel y la otra grilla.
const CARD_WIDTH = 260

interface Promotion {
  id:            string
  type:          'service' | 'product'
  title:         string
  description:   string
  image:         string | null
  price:         number
  originalPrice: number | null
  items:         { id: string; name: string; price: number }[]
  startDate:     string | null
  endDate:       string | null
}

export function ServicePromotionsSection() {
  const { business } = useTenant()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get<{ promotions: Promotion[] }>('/api/promotions/public')
      .then(res => setPromotions((res.data.promotions ?? []).filter(p => p.type === 'service' && isPromotionLive(p))))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business || loading || promotions.length === 0) return null

  const { primaryColor, accentColor } = business

  const handleReserve = (promo: Promotion) => {
    const serviceId = promo.items[0]?.id
    if (isAuthenticated && user?.role === 'client') {
      navigate(ROUTES.CLIENT_BOOK, { state: serviceId ? { serviceId, promotionId: promo.id } : undefined })
    } else {
      if (serviceId) setPendingBookingPreselect({ serviceId, promotionId: promo.id })
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <section className="w-full py-20 px-6" style={{ background: `linear-gradient(180deg, #ffffff, ${primaryColor}05 45%, #ffffff)` }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            Promociones de servicios
          </h2>
          <p className="text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
            Aprovechá estos precios especiales antes de que se terminen
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {promotions.map(promo => {
            const discount = promo.originalPrice && promo.originalPrice > promo.price
              ? Math.round(100 - (promo.price / promo.originalPrice) * 100)
              : null
            return (
              <div
                key={promo.id}
                onClick={() => handleReserve(promo)}
                className="group flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-white cursor-pointer flex-shrink-0"
                style={{ width: `${CARD_WIDTH}px`, border: '1px solid #ececec', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px -12px ${primaryColor}35`; e.currentTarget.style.borderColor = `${primaryColor}40` }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#ececec' }}
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}12, ${accentColor}12)` }}>
                  {promo.image ? (
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag size={32} color={`${primaryColor}45`} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                  {discount !== null && (
                    <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: primaryColor, fontFamily: 'var(--font-lato)', letterSpacing: '0.03em' }}>
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h4 className="mb-1 line-clamp-1" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor, fontSize: '1.05rem' }}>
                    {promo.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1" style={{ fontFamily: 'var(--font-lato)', lineHeight: 1.5 }}>
                    {promo.description}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                        ${promo.price.toLocaleString('es-AR')}
                      </span>
                      {promo.originalPrice && (
                        <span className="text-xs text-gray-400 line-through truncate" style={{ fontFamily: 'var(--font-lato)' }}>
                          ${promo.originalPrice.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                    <span
                      className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full transition-all group-hover:gap-2"
                      style={{ background: `${primaryColor}10`, color: primaryColor, fontFamily: 'var(--font-lato)' }}
                    >
                      Reservar <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
