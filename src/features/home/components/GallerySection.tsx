import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

interface GalleryPair {
  id:     string
  before: string | null
  after:  string | null
}

const CARD_WIDTH = 320
const CARD_GAP   = 24
// Segundos por imagen — a más fotos, más largo el recorrido, pero siempre lento.
const SECONDS_PER_CARD = 5

export function GallerySection() {
  const { business } = useTenant()
  const [pairs,   setPairs]   = useState<GalleryPair[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ pairs: GalleryPair[] }>('/api/gallery/public')
      .then(res => setPairs(res.data.pairs ?? []))
      .catch(() => setPairs([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null

  // Con pocas fotos (3 o menos) no hace falta animar — ya entran todas.
  const shouldScroll = pairs.length > 3
  const track = shouldScroll ? [...pairs, ...pairs] : pairs
  const duration = Math.max(pairs.length * SECONDS_PER_CARD, 20)

  const { primaryColor } = business

  return (
    <section className="py-12 px-6" style={{ background: `${primaryColor}08` }}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl mb-8" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          Galería de trabajos
        </h2>
        {loading ? (
          <p className="text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>Cargando...</p>
        ) : pairs.length === 0 ? (
          <p className="text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
            Todavía no hay fotos cargadas
          </p>
        ) : (
          <div className="gallery-viewport">
            <div
              className={`gallery-track${shouldScroll ? ' gallery-track--scrolling' : ' gallery-track--static'}`}
              style={shouldScroll ? { animationDuration: `${duration}s` } : undefined}
            >
              {track.map((pair, i) => (
                <div className="gallery-card-wrap" key={`${pair.id}-${i}`}>
                  <GalleryCard pair={pair} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gallery-viewport {
          overflow: hidden;
          width: 100%;
        }
        .gallery-track {
          display: flex;
          gap: ${CARD_GAP}px;
        }
        .gallery-track--static {
          justify-content: center;
          flex-wrap: wrap;
        }
        .gallery-track--scrolling {
          width: max-content;
          animation-name: gallery-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .gallery-track--scrolling:hover {
          animation-play-state: paused;
        }
        .gallery-card-wrap {
          flex: 0 0 ${CARD_WIDTH}px;
          width: ${CARD_WIDTH}px;
        }
        @keyframes gallery-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-50% - ${CARD_GAP / 2}px)); }
        }
        @media (max-width: 640px) {
          .gallery-card-wrap { flex-basis: 260px; width: 260px; }
        }
      `}</style>
    </section>
  )
}

function GalleryCard({ pair }: { pair: GalleryPair }) {
  const [hovered, setHovered] = useState(false)
  const hasBoth = Boolean(pair.before && pair.after)
  const showingAfter = hovered && hasBoth

  return (
    <div
      className="relative h-72 sm:h-80 rounded-xl overflow-hidden bg-gray-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {pair.before && (
        <img
          src={pair.before}
          alt="Antes"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: hasBoth && showingAfter ? 0 : 1 }}
        />
      )}
      {pair.after && (
        <img
          src={pair.after}
          alt="Después"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: hasBoth ? (showingAfter ? 1 : 0) : 1 }}
        />
      )}
      {hasBoth && (
        <span
          className="absolute bottom-2 right-2 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-lato)' }}
        >
          {showingAfter ? 'Después' : 'Antes'}
        </span>
      )}
    </div>
  )
}
