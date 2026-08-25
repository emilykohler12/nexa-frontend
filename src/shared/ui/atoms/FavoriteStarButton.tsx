// src/shared/ui/atoms/FavoriteStarButton.tsx
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { useFavorites } from '@/features/client/favorites/useFavorites'
import type { FavoriteType } from '@/features/client/favorites/useFavorites'
import { ROUTES } from '@/app/config/routes.config'

interface Props {
  type:   FavoriteType
  id:     string
  name:   string
  detail: string
  color?: string
  size?:  number
}

export function FavoriteStarButton({ type, id, name, detail, color = '#d4af37', size = 20 }: Props) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()

  const isClient = isAuthenticated && user?.role === 'client'
  const active    = isClient && isFavorite(type, id)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isClient) {
      navigate(ROUTES.LOGIN)
      return
    }
    toggleFavorite({ id, type, name, detail })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={active}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? color : '#ccc',
        transition: 'color 0.15s, transform 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Star size={size} fill={active ? color : 'none'} />
    </button>
  )
}
