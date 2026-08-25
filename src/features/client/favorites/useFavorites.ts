// src/features/client/favorites/useFavorites.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

export type FavoriteType = 'professional' | 'service' | 'product'

export interface FavoriteItem {
  id:     string
  type:   FavoriteType
  name:   string
  detail: string
}

function storageKey(userId: string) {
  return `nexa_favorites_${userId}`
}

function readStorage(userId: string): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStorage(userId: string, items: FavoriteItem[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items))
  } catch {
    // almacenamiento no disponible — se pierde al recargar, no rompe la UI
  }
}

// TODO: reemplazar por endpoints reales (GET/POST/DELETE /api/client/favorites) cuando exista el backend.
// Por ahora persiste en localStorage por usuario para que sobreviva a recargas de página.
export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  useEffect(() => {
    setFavorites(user ? readStorage(user.id) : [])
  }, [user?.id])

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    if (!user) return
    setFavorites(prev => {
      const exists = prev.some(f => f.type === item.type && f.id === item.id)
      const next = exists
        ? prev.filter(f => !(f.type === item.type && f.id === item.id))
        : [...prev, item]
      writeStorage(user.id, next)
      return next
    })
  }, [user])

  const removeFavorite = useCallback((type: FavoriteType, id: string) => {
    if (!user) return
    setFavorites(prev => {
      const next = prev.filter(f => !(f.type === type && f.id === id))
      writeStorage(user.id, next)
      return next
    })
  }, [user])

  const isFavorite = useCallback(
    (type: FavoriteType, id: string) => favorites.some(f => f.type === type && f.id === id),
    [favorites]
  )

  return { favorites, isFavorite, toggleFavorite, removeFavorite }
}
