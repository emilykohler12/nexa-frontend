import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, ArrowRight } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { isPromotionLive } from '@/shared/utils/promotionWindow'
import { setPendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'

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
      navigate(ROUTES.CLIENT_BOOK, { state: serviceId ? { serviceId } : undefined })
    } else {
      if (serviceId) setPendingBookingPreselect({ serviceId })
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {promotions.map(promo => {
            const discount = promo.originalPrice && promo.originalPrice > promo.price
              ? Math.round(100 - (promo.price / promo.originalPrice) * 100)
              : null
            return (
              <div
                key={promo.id}
                onClick={() => handleReserve(promo)}
                className="group flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-white cursor-pointer"
                style={{ border: '1px solid #ececec', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 40px -12px ${primaryColor}35`; e.currentTarget.style.borderColor = `${primaryColor}40` }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#ececec' }}
              >
                <div className="w-full h-52 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}12, ${accentColor}12)` }}>
                  {promo.image ? (
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag size={40} color={`${primaryColor}45`} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                  {discount !== null && (
                    <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1.5 rounded-full text-white shadow-md" style={{ background: primaryColor, fontFamily: 'var(--font-lato)' }}>
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="mb-1.5" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor, fontSize: '1.2rem', lineHeight: 1.25 }}>
                    {promo.title}
                  </h4>
                  <p className="text-sm text-gray-500 flex-1 mb-4" style={{ fontFamily: 'var(--font-lato)', lineHeight: 1.5 }}>
                    {promo.description}
                  </p>
                  <div className="flex items-end justify-between pt-4" style={{ borderTop: '1px solid #f3f3f3' }}>
                    <div className="flex flex-col">
                      {promo.originalPrice && (
                        <span className="text-xs text-gray-400 line-through" style={{ fontFamily: 'var(--font-lato)' }}>
                          ${promo.originalPrice.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                        ${promo.price.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <span
                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full transition-all group-hover:gap-2"
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
