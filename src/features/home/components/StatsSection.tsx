import { useRef, useEffect, useState } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'

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

export function StatsSection() {
  const { business } = useTenant()

  if (!business || business.stats.length === 0) return null

  return (
    <section
      className="py-8 px-6 text-white"
      style={{ backgroundColor: business.accentColor }}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-6">
        {business.stats.map((stat, i) => (
          <div key={i}>
            <h3
              className="text-2xl md:text-3xl font-medium"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              +<OdometerNumber target={stat.value} duration={2000} />
              {stat.suffix || ''}
            </h3>
            <p
              className="text-sm text-white/80 tracking-wide"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}