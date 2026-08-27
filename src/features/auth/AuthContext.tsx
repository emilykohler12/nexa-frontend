// src/features/auth/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api }    from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'

export type UserRole = 'admin' | 'professional' | 'client'

export interface User {
  id:              string
  name:            string
  email:           string
  role:            UserRole
  phone?:          string | null
  gender?:         string | null
  photo?:          string | null
  createdAt?:      string
  profileComplete?: boolean
}

interface AuthContextValue {
  user:            User | null
  isLoading:       boolean
  isAuthenticated: boolean
  login:           (user: User) => void
  logout:          () => void
  refreshUser:     () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function redirectByRole(role: UserRole): string {
  switch (role) {
    case 'admin':        return ROUTES.ADMIN_DASHBOARD
    case 'professional': return ROUTES.PROFESSIONAL_PANEL
    case 'client':       return ROUTES.CLIENT_APPOINTMENTS
    default:             return ROUTES.HOME
  }
}

export function isFirstVisit(user: User): boolean {
  if (!user.createdAt) return false
  const diff = Date.now() - new Date(user.createdAt).getTime()
  return diff < 5 * 60 * 1000
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = async () => {
    try {
      const res = await api.get<{ user: User | null }>('/api/auth/me')
      setUser(res.data.user)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false))
  }, [])

  const logout = async () => {
    try { await api.post('/api/auth/logout') } catch { /* ignorar */ }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login:  setUser,
      logout,
      refreshUser: fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
