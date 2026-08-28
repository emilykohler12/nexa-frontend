import { useRef, useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

// Desde acá se cuentan los "años de experiencia" — no es un número fijo
// cargado a mano, se recalcula solo con el paso del tiempo.
const EXPERIENCE_START = new Date(2025, 8, 1) // 1° de septiembre de 2025

function yearsSince(start: Date): number {
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const beforeAnniversary = now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  if (beforeAnniversary) years--
  return Math.max(0, years)
}

function OdometerNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          if (navigator.vibrate) navigator.vibrate(20)
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setValue(Math.floor(target * easeOut))
            if (progress < 1) requestAnimationFrame(animate)
          }
          animate()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{value}</span>
}

interface BusinessStats {
  activeProfessionals: number
  totalClients:        number
}

export function StatsSection() {
  const { business } = useTenant()
  const [stats, setStats] = useState<BusinessStats | null>(null)
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(null)

  useEffect(() => {
    api.get<BusinessStats>('/api/business/stats/public')
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
    api.get<{ average: number; count: number }>('/api/reviews/public/summary')
      .then(res => { if (res.data.count > 0) setRatingSummary(res.data) })
      .catch(() => {})
  }, [])

  if (!business) return null

  const experience = yearsSince(EXPERIENCE_START)

  return (
    <section
      className="py-8 px-6 text-white"
      style={{ backgroundColor: business.accentColor }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-medium" style={{ fontFamily: 'var(--font-cormorant)' }}>
            +<OdometerNumber target={experience} duration={1200} />
          </h3>
          <p className="text-sm text-white/80 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Años de experiencia
          </p>
        </div>

        {stats && (
          <div>
            <h3 className="text-2xl md:text-3xl font-medium" style={{ fontFamily: 'var(--font-cormorant)' }}>
              +<OdometerNumber target={stats.totalClients} duration={2000} />
            </h3>
            <p className="text-sm text-white/80 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Clientes
            </p>
          </div>
        )}

        {stats && (
          <div>
            <h3 className="text-2xl md:text-3xl font-medium" style={{ fontFamily: 'var(--font-cormorant)' }}>
              +<OdometerNumber target={stats.activeProfessionals} duration={1200} />
            </h3>
            <p className="text-sm text-white/80 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Profesionales
            </p>
          </div>
        )}

        {ratingSummary && (
          <div>
            <h3
              className="text-2xl md:text-3xl font-medium flex items-center justify-center gap-1.5"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              <Star size={22} fill="#fff" strokeWidth={0} />
              {ratingSummary.average.toFixed(1)}
            </h3>
            <p className="text-sm text-white/80 tracking-wide" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Calificación de {ratingSummary.count} cliente{ratingSummary.count !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
