import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBasket, Check } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { useCart } from '@/features/store/CartContext'
import { isPromotionLive } from '@/shared/utils/promotionWindow'

type PromotionKind = 'discount' | 'bundle' | 'buy_x_pay_y'

interface Promotion {
  id:            string
  type:          'service' | 'product'
  kind:          PromotionKind
  title:         string
  description:   string
  image:         string | null
  price:         number
  originalPrice: number | null
  items:         { id: string; name: string; price: number }[]
  buyQty:        number | null
  payQty:        number | null
  startDate:     string | null
  endDate:       string | null
}

function badgeFor(promo: Promotion): string | null {
  if (promo.kind === 'bundle') return `Combo x${promo.items.length}`
  if (promo.kind === 'buy_x_pay_y' && promo.buyQty && promo.payQty) return `${promo.buyQty}x${promo.payQty}`
  if (promo.originalPrice && promo.originalPrice > promo.price) {
    return `-${Math.round(100 - (promo.price / promo.originalPrice) * 100)}%`
  }
  return null
}

const CARD_WIDTH = 260

export function ProductPromotionsSection() {
  const { business } = useTenant()
  const { addItem } = useCart()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading]       = useState(true)
  const [addedId, setAddedId]       = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<{ promotions: Promotion[] }>('/api/promotions/public')
      .then(res => setPromotions((res.data.promotions ?? []).filter(p => p.type === 'product' && isPromotionLive(p))))
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business || loading || promotions.length === 0) return null

  const { primaryColor, accentColor } = business

  const handleBuy = (promo: Promotion) => {
    if (promo.items.length === 0) return

    if (promo.kind === 'bundle') {
      const realTotal = promo.items.reduce((s, i) => s + i.price, 0) || 1
      promo.items.forEach(item => {
        const scaledPrice = Math.round(item.price * (promo.price / realTotal))
        addItem({ productId: item.id, name: item.name, price: scaledPrice, image: promo.image, promotionId: promo.id }, 1)
      })
    } else if (promo.kind === 'buy_x_pay_y' && promo.buyQty && promo.payQty) {
      const item = promo.items[0]
      const unitPrice = Math.round((promo.price * promo.payQty) / promo.buyQty)
      addItem({ productId: item.id, name: item.name, price: unitPrice, image: promo.image, promotionId: promo.id }, promo.buyQty)
    } else {
      const item = promo.items[0]
      addItem({ productId: item.id, name: item.name, price: promo.price, image: promo.image, promotionId: promo.id }, 1)
    }

    setAddedId(promo.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const next = Math.max(0, Math.min(promotions.length - 1, activeIndex + dir))
    setActiveIndex(next)
    const card = track.children[next] as HTMLElement | undefined
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <section className="w-full py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${accentColor}07, #ffffff 65%)` }}>
      {/* Textura sutil de marca — dos manchas de color muy tenues */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full" style={{ background: `${primaryColor}08`, filter: 'blur(60px)' }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full" style={{ background: `${accentColor}0a`, filter: 'blur(60px)' }} />

      <div className="max-w-[1400px] mx-auto relative">
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-bold mb-3"
            style={{ color: accentColor, fontFamily: 'var(--font-lato)', letterSpacing: '0.25em' }}
          >
            NUESTRA COLECCIÓN
          </span>
          <h2 className="text-4xl md:text-5xl mb-3" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            Promociones de productos
          </h2>
          <p className="text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
            Descuentos y combos especiales, elegidos para vos
          </p>
        </div>

        <div className="relative">
          {promotions.length > 1 && (
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Anterior"
              className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center shadow-lg transition-opacity"
              style={{ background: '#fff', color: primaryColor, opacity: activeIndex === 0 ? 0.35 : 1 }}
              disabled={activeIndex === 0}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            ref={trackRef}
            className="product-promo-track flex gap-6 overflow-x-auto pb-4 px-1"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {promotions.map((promo, idx) => {
              const badge = badgeFor(promo)
              const justAdded = addedId === promo.id
              const raised = idx % 2 === 1

              return (
                <div
                  key={promo.id}
                  className="group flex flex-col flex-shrink-0 rounded-[28px] bg-white overflow-hidden transition-all duration-300"
                  style={{
                    width: `${CARD_WIDTH}px`,
                    scrollSnapAlign: 'start',
                    border: '1px solid #ece6da',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                    marginTop: raised ? 0 : 28,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 40px -16px ${primaryColor}45` }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)' }}
                >
                  <div className="relative w-full aspect-[4/5]" style={{ background: `linear-gradient(160deg, ${accentColor}12, ${primaryColor}0a)` }}>
                    {badge && (
                      <span
                        className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: primaryColor, fontFamily: 'var(--font-lato)', letterSpacing: '0.03em' }}
                      >
                        {badge}
                      </span>
                    )}
                    {promo.image ? (
                      <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={32} color={`${primaryColor}35`} />
                      </div>
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
                        {promo.originalPrice && promo.kind !== 'buy_x_pay_y' && (
                          <span className="text-xs text-gray-400 line-through truncate" style={{ fontFamily: 'var(--font-lato)' }}>
                            ${promo.originalPrice.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleBuy(promo)}
                        aria-label={`Agregar ${promo.title} al carrito`}
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: justAdded ? primaryColor : accentColor, color: '#fff' }}
                      >
                        {justAdded ? <Check size={16} /> : <ShoppingBasket size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {promotions.length > 1 && (
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Siguiente"
              className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center shadow-lg transition-opacity"
              style={{ background: '#fff', color: primaryColor, opacity: activeIndex === promotions.length - 1 ? 0.35 : 1 }}
              disabled={activeIndex === promotions.length - 1}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {promotions.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {promotions.map((promo, idx) => (
              <button
                key={promo.id}
                onClick={() => { setActiveIndex(idx); trackRef.current?.children[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }) }}
                aria-label={`Ir al producto ${idx + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: idx === activeIndex ? '20px' : '7px',
                  height: '7px',
                  background: idx === activeIndex ? accentColor : '#e5ddcc',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`.product-promo-track::-webkit-scrollbar { display: none; }`}</style>
    </section>
  )
}
