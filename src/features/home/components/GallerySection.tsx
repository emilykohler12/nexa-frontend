import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

interface GalleryPair {
  id:     string
  before: string | null
  after:  string | null
}

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

  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
          Galería de trabajos
        </h2>
        {loading ? (
          <p className="text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>Cargando...</p>
        ) : pairs.length === 0 ? (
          <p className="text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
            Todavía no hay fotos cargadas
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pairs.map(pair => (
              <GalleryCard key={pair.id} pair={pair} />
            ))}
          </div>
        )}
      </div>
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
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: hasBoth && showingAfter ? 0 : 1 }}
        />
      )}
      {pair.after && (
        <img
          src={pair.after}
          alt="Después"
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
