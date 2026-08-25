import { useTenant } from '@/features/tenant/TenantContext'
import { useNavigate } from 'react-router-dom'

type SectionId = 'servicios' | 'profesionales' | 'tienda' | 'nosotros'

interface HeroSectionProps {
  onNavigate: (section: SectionId | null) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { business } = useTenant()

  const navigate = useNavigate()

  if (!business) return null

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={business.heroImage}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ borderColor: business.accentColor }}
          >
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="text-white text-xl md:text-2xl font-semibold tracking-wide"
            style={{ fontFamily: 'var(--font-parisienne)' }}
          >
            {business.name}
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="border text-white bg-transparent px-4 py-2 rounded-md text-lg transition-all"
          style={{
            borderColor: business.accentColor,
            fontFamily: 'var(--font-cormorant)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = business.accentColor)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Ingresar
        </button>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
          style={{ color: business.accentColor, fontFamily: 'var(--font-playfair)' }}
        >
          {business.heroTitle}
        </h1>
        <p
          className="text-white text-2xl mb-4"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {business.heroSubtitle}
        </p>
        <p
          className="text-white text-2xl mb-8"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {business.heroSubtitle2}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onNavigate('servicios')}
            className="text-white px-8 py-4 text-xl rounded-md transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: business.primaryColor,
              fontFamily: 'var(--font-cormorant)',
            }}
          >
            Reservar un turno
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="border text-white bg-transparent px-8 py-4 text-xl rounded-md transition-all hover:bg-white"
            style={{
              borderColor: 'white',
              fontFamily: 'var(--font-cormorant)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.color = business.primaryColor
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'white'
            }}
          >
            Gestionar mis turnos
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="relative z-20 mt-auto">
        <div className="grid grid-cols-4 w-full">
          {business.nav.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as SectionId)}
              className="py-5 md:py-6 text-white text-sm md:text-base font-medium uppercase tracking-wider bg-black/30 backdrop-blur-sm transition-all duration-300 border-t border-white/20"
              style={{ fontFamily: 'var(--font-lato)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.color = business.primaryColor
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'
                e.currentTarget.style.color = 'white'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </section>
  )
}