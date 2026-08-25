import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'
import { useFavorites } from '@/features/client/favorites/useFavorites'
import type { FavoriteType } from '@/features/client/favorites/useFavorites'
import { Heart, Trash2 } from 'lucide-react'

type FilterValue = FavoriteType | 'all'

export function FavoritesPage() {
  const { business } = useTenant()
  const navigate = useNavigate()
  const { favorites, removeFavorite } = useFavorites()
  const [filter, setFilter] = useState<FilterValue>('all')

  if (!business) return null
  const { primaryColor, accentColor } = business

  const filtered = filter === 'all' ? favorites : favorites.filter(f => f.type === filter)

  return (
    <div className="w-full px-8 py-8" style={{ boxSizing: 'border-box' }}>
      <h1 className="text-3xl mb-6" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        Favoritos
      </h1>

      <div className="flex gap-2 mb-6">
        {([
          { id: 'all', label: 'Todos' },
          { id: 'professional', label: 'Profesionales' },
          { id: 'service', label: 'Servicios' },
          { id: 'product', label: 'Productos' },
        ] as { id: FilterValue; label: string }[]).map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: filter === f.id ? primaryColor : '#f3f4f6',
              color: filter === f.id ? 'white' : '#6b7280',
              fontFamily: 'var(--font-lato)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
            No tenés favoritos todavía
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filtered.map(fav => (
            <div key={`${fav.type}-${fav.id}`} className="bg-white rounded-2xl p-5 shadow-sm border flex items-center justify-between" style={{ borderColor: '#f3f4f6' }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: fav.type === 'professional' ? primaryColor : accentColor }}
                >
                  {fav.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                    {fav.name}
                  </p>
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
                    {fav.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fav.type !== 'product' && (
                  <button
                    onClick={() => navigate(ROUTES.CLIENT_BOOK)}
                    className="text-xs px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
                  >
                    Reservar
                  </button>
                )}
                <button onClick={() => removeFavorite(fav.type, fav.id)} className="text-gray-300 hover:text-red-400 transition-all p-1.5">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
