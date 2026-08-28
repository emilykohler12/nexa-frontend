// src/features/home/components/ServicesSection.tsx
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useTenant }           from '@/features/tenant/TenantContext'
import { useAuth }             from '@/features/auth/AuthContext'
import { api }                 from '@/shared/utils/api'
import { SERVICE_CATEGORIES }  from '@/app/data/shared'
import { ROUTES }              from '@/app/config/routes.config'
import { FavoriteStarButton }  from '@/shared/ui/atoms/FavoriteStarButton'
import { ServiceDetailModal }  from './ServiceDetailModal'
import { setPendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'

const COMBOS_ID = 'combos'

interface Service {
  id:          string
  name:        string
  categoryId:  string
  description: string
  duration:    number
  price:       number
  image:       string | null
  status:      string
  isCombo?:    boolean
  isSpecial?:  boolean
  specialDate?: string | null
  zones?:      { price: number; active: boolean }[]
}

export function ServicesSection() {
  const { business }                      = useTenant()
  const { isAuthenticated, user }         = useAuth()
  const navigate                          = useNavigate()
  const [services,  setServices]          = useState<Service[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [detailService, setDetailService] = useState<Service | null>(null)

  const handleReservar = (serviceId?: string) => {
    if (isAuthenticated && user?.role === 'client') {
      navigate(ROUTES.CLIENT_BOOK, { state: serviceId ? { serviceId } : undefined })
    } else {
      if (serviceId) setPendingBookingPreselect({ serviceId })
      navigate(ROUTES.LOGIN)
    }
  }

  useEffect(() => {
    api.get<{ services: Service[] }>('/api/services')
      .then(res => setServices(res.data.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null

  const { primaryColor, accentColor } = business
  const categories = SERVICE_CATEGORIES
  const hasCombos = services.some(s => s.isCombo)

  const filteredServices = activeCategoryId === COMBOS_ID
    ? services.filter(s => s.isCombo)
    : activeCategoryId
    ? services.filter(s => s.categoryId === activeCategoryId)
    : services

  const activeLabel = activeCategoryId === COMBOS_ID
    ? 'Combos'
    : categories.find(c => c.id === activeCategoryId)?.label

  return (
    <section style={{ width: '100%' }}>

      {/* Título */}
      <div className="text-center mb-4" style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          Nuestros Servicios
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg" style={{ fontFamily: 'var(--font-lato)' }}>
          Descubrí todos los tratamientos que tenemos para vos
        </p>
      </div>

      {/* Categorías */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Cargando servicios...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
          No hay servicios cargados todavía
        </div>
      ) : (
        <div style={{ width: '100%', backgroundColor: '#acc8c8', padding: '40px 24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px', textAlign: 'center' }}>
              {categories.map(cat => {
                const isActive = activeCategoryId === cat.id
                const hasServices = services.some(s => s.categoryId === cat.id)
                if (!hasServices) return null
                return (
                  <div
                    key={cat.id}
                    onClick={() => setActiveCategoryId(isActive ? null : cat.id)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      style={{
                        width: '130px', height: '90px', objectFit: 'contain',
                        opacity: isActive ? 1 : 0.8,
                        filter: isActive ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    />
                    <span style={{
                      fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem',
                      color: isActive ? accentColor : '#333',
                      fontWeight: isActive ? 700 : 400,
                      transition: 'all 0.2s',
                    }}>
                      {cat.label}
                    </span>
                  </div>
                )
              })}
              {hasCombos && (
                <div
                  onClick={() => setActiveCategoryId(activeCategoryId === COMBOS_ID ? null : COMBOS_ID)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <img
                    src="/icons/combos.png"
                    alt="Combos"
                    style={{
                      width: '130px', height: '90px', objectFit: 'contain',
                      opacity: activeCategoryId === COMBOS_ID ? 1 : 0.8,
                      filter: activeCategoryId === COMBOS_ID ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
                      transform: activeCategoryId === COMBOS_ID ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  />
                  <span style={{
                    fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem',
                    color: activeCategoryId === COMBOS_ID ? accentColor : '#333',
                    fontWeight: activeCategoryId === COMBOS_ID ? 700 : 400,
                    transition: 'all 0.2s',
                  }}>
                    Combos
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Servicios de la categoría seleccionada */}
      {activeCategoryId && (
        <div style={{ width: '100%', background: '#fff', padding: '40px 24px 60px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', color: primaryColor, fontSize: '1.5rem', marginBottom: '24px', textAlign: 'center' }}>
              {activeLabel}
            </h3>
            {filteredServices.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>No hay servicios en esta categoría todavía</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => setDetailService(service)}
                    style={{
                      display: 'flex', flexDirection: 'column', height: '100%',
                      border: '1px solid #e5e5e5', borderRadius: '14px', padding: '20px',
                      background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accentColor
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e5e5e5'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      width: '100%', height: '140px', borderRadius: '10px', marginBottom: '14px',
                      overflow: 'hidden', flexShrink: 0,
                      background: `${primaryColor}10`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '32px', color: `${primaryColor}50` }}>✂️</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', margin: '0 0 8px' }}>
                      <h4 style={{ fontFamily: 'var(--font-playfair)', color: primaryColor, margin: 0, fontSize: '1.1rem' }}>
                        {service.name}
                      </h4>
                      <div onClick={e => e.stopPropagation()}>
                        <FavoriteStarButton
                          type="service"
                          id={service.id}
                          name={service.name}
                          detail={service.isSpecial ? (service.specialDate ?? 'Fecha a confirmar') : `${service.duration} min — $${Number(service.price).toLocaleString('es-AR')}`}
                          color={accentColor}
                        />
                      </div>
                    </div>
                    <p style={{ flex: 1, fontSize: '14px', color: '#666', margin: '0 0 14px' }}>
                      {service.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '13px', color: '#999' }}>
                        {service.isSpecial
                          ? (service.specialDate ? new Date(service.specialDate + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : 'Fecha a confirmar')
                          : `${service.duration} min`}
                      </span>
                      <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 700, color: accentColor }}>
                        {service.isSpecial
                          ? (() => {
                              const prices = (service.zones ?? []).filter(z => z.active).map(z => z.price)
                              return prices.length > 0 ? `Desde $${Math.min(...prices).toLocaleString('es-AR')}` : ''
                            })()
                          : `$${Number(service.price).toLocaleString('es-AR')}`}
                      </span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleReservar(service.id) }}
                      style={{
                        width: '100%', padding: '10px', border: 'none', borderRadius: '8px',
                        background: primaryColor, color: '#fff', cursor: 'pointer',
                        fontFamily: 'var(--font-lato)', fontSize: '14px', fontWeight: 600,
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      Reservar turno
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!activeCategoryId && services.length > 0 && (
        <div style={{ padding: '32px', textAlign: 'center', background: '#fff' }}>
          <p style={{ color: '#aaa' }}>Seleccioná una categoría para ver los servicios</p>
        </div>
      )}

      {detailService && (
        <ServiceDetailModal
          service={detailService}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onClose={() => setDetailService(null)}
          onReserve={() => { const id = detailService.id; setDetailService(null); handleReservar(id) }}
        />
      )}

    </section>
  )
}