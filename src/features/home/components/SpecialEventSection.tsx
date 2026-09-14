// src/features/home/components/SpecialEventSection.tsx
//
// Vidriera de eventos especiales (ej: jornada de Depilación definitiva con
// una profesional puntual) — el admin los activa desde Promociones > Eventos
// especiales. A propósito tiene un look bien distinto al resto del home (fondo
// oscuro, tipografía grande) para que contraste con la sección de Servicios
// (blanca, en grilla) y con la tira de stats (bloque de color plano).
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Calendar, ArrowRight } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { setPendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'

interface SpecialEvent {
  id:          string
  date:        string
  title:       string | null
  description: string | null
  service: { id: string; name: string; description: string; price: number; duration: number; image: string | null }
  professional: { id: string; name: string; photo: string | null; specialty: string | null }
}

export function SpecialEventSection() {
  const { business } = useTenant()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents]   = useState<SpecialEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ specialEvents: SpecialEvent[] }>('/api/special-events/public')
      .then(res => setEvents(res.data.specialEvents ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business || loading || events.length === 0) return null

  const { accentColor } = business

  const handleReserve = (event: SpecialEvent) => {
    const preselect = { serviceId: event.service.id, professionalId: event.professional.id, date: event.date }
    if (isAuthenticated && user?.role === 'client') {
      navigate(ROUTES.CLIENT_BOOK, { state: preselect })
    } else {
      setPendingBookingPreselect(preselect)
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <section
      className="w-full py-20 px-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at 20% 20%, #2a2320, #0f0d0c 70%)' }}
    >
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `${accentColor}22`, filter: 'blur(80px)' }}
      />
      <div className="max-w-[1100px] mx-auto relative">
        <div className="text-center mb-12">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${accentColor}18`, color: accentColor, fontFamily: 'var(--font-lato)' }}
          >
            <Sparkles size={13} /> Evento especial
          </span>
          <h2 className="text-3xl md:text-5xl mb-3 text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Una jornada única, con cupos limitados
          </h2>
          <p className="text-white/60" style={{ fontFamily: 'var(--font-lato)' }}>
            Reservá tu lugar antes de que se agote
          </p>
        </div>

        <div className={`grid gap-8 ${events.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
          {events.map(event => (
            <div
              key={event.id}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accentColor}30`, backdropFilter: 'blur(6px)' }}
            >
              {event.service.image && (
                <div className="w-full h-56 overflow-hidden">
                  <img src={event.service.image} alt={event.service.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 flex flex-col gap-4">
                <h3 className="text-2xl text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {event.title || event.service.name}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-lato)' }}>
                  {event.description || event.service.description}
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-white/80" style={{ fontFamily: 'var(--font-lato)' }}>
                  <span className="flex items-center gap-2">
                    <Calendar size={15} color={accentColor} />
                    {new Date(`${event.date}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span>Con {event.professional.name}</span>
                </div>
                <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                    ${event.service.price.toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => handleReserve(event)}
                    className="flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-full transition-all hover:opacity-90"
                    style={{ background: accentColor, color: '#1a1310', fontFamily: 'var(--font-lato)' }}
                  >
                    Reservar mi lugar <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
