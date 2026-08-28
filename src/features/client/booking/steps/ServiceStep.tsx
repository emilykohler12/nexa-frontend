import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api }        from '@/shared/utils/api'
import { SERVICE_CATEGORIES } from '@/app/data/shared'

export interface ServiceZone {
  id: string; name: string; duration: number; price: number; active: boolean
}
export interface ServicePackage {
  id: string; name: string; zoneIds: string[]; duration: number; price: number; active: boolean
}
export interface SpecialSlot {
  id?: string; time: string; professionalId: string; professionalName?: string; active: boolean
  // Solo en la respuesta pública para clientes — nunca expone quién es el cliente.
  booked?: boolean
}

export interface Service {
  id:               string
  name:             string
  categoryId:       string
  description:      string
  duration:         number
  price:            number
  image:            string | null
  status:           string
  isCombo?:         boolean
  comboServiceIds?: string[]
  simultaneous?:    boolean
  isSpecial?:       boolean
  specialDate?:     string | null
  specialSlots?:    SpecialSlot[]
  zones?:           ServiceZone[]
  packages?:        ServicePackage[]
}

interface Props {
  selectedServiceId: string | null
  onSelect: (service: Service) => void
}

export function ServiceStep({ selectedServiceId, onSelect }: Props) {
  const { business } = useTenant()
  const [services, setServices] = useState<Service[]>([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')

  useEffect(() => {
    api.get<{ services: Service[] }>('/api/services')
      .then(res => setServices(res.data.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor, accentColor } = business

  if (loading) {
    return (
      <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
        Cargando servicios...
      </p>
    )
  }

  if (services.length === 0) {
    return (
      <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
        No hay servicios disponibles todavía
      </p>
    )
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredServices = normalizedQuery
    ? services.filter(s => s.name.toLowerCase().includes(normalizedQuery))
    : services

  const ServiceButton = ({ service }: { service: Service }) => (
    <button
      key={service.id}
      onClick={() => onSelect(service)}
      className="flex items-center justify-between p-4 rounded-xl border text-left transition-all"
      style={{
        borderColor: selectedServiceId === service.id ? primaryColor : '#e5e5e5',
        backgroundColor: selectedServiceId === service.id ? `${primaryColor}10` : 'white',
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            {service.name}
          </p>
          {service.isCombo && service.simultaneous && (service.comboServiceIds?.length ?? 0) >= 2 && (
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}20`, color: accentColor, fontFamily: 'var(--font-lato)' }}
            >
              Simultáneo
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
          {service.isSpecial
            ? (service.specialDate ? new Date(service.specialDate + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) : 'Fecha a confirmar')
            : `${service.duration} min`}
        </p>
      </div>
      {service.isSpecial ? (
        (() => {
          const activePrices = (service.zones ?? []).filter(z => z.active).map(z => z.price)
          return activePrices.length > 0 ? (
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
              Desde ${Math.min(...activePrices).toLocaleString('es-AR')}
            </span>
          ) : null
        })()
      ) : (
        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
          ${service.price.toLocaleString('es-AR')}
        </span>
      )}
    </button>
  )

  return (
    <div>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        ¿Qué servicio querés?
      </h2>

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={17} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar servicio..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
          style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
          onFocus={e => (e.currentTarget.style.borderColor = primaryColor)}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
        />
      </div>

      {filteredServices.length === 0 ? (
        <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
          No se encontraron servicios para "{query}"
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {SERVICE_CATEGORIES.map(cat => {
            const catServices = filteredServices.filter(s => s.categoryId === cat.id)
            if (catServices.length === 0) return null
            return (
              <div key={cat.id}>
                <h3
                  className="text-sm font-bold uppercase tracking-wide mb-3"
                  style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}
                >
                  {cat.label}
                </h3>
                <div className="flex flex-col gap-3">
                  {catServices.map(service => <ServiceButton key={service.id} service={service} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
