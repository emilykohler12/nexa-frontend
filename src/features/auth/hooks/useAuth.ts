import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../AuthContext'
import { ROUTES } from '@/app/config/routes.config'
import { consumePendingCartCheckout } from '@/shared/utils/pendingCheckout'
import { consumePendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'
import { useCart } from '@/features/store/CartContext'
import type { UserRole } from '../AuthContext'

function redirectByRole(role: UserRole): string {
  switch (role) {
    case 'admin':        return ROUTES.ADMIN_DASHBOARD
    case 'professional': return ROUTES.PROFESSIONAL_PANEL
    case 'client':       return ROUTES.CLIENT_APPOINTMENTS
    default:             return ROUTES.HOME
  }
}

interface AuthDestination {
  pathname: string
  state?:   unknown
}

// Si el login/registro vino de "confirmar" un carrito o de tocar "Reservar
// turno" sin estar logueado, lo devolvemos directo ahí en vez de a su panel
// de siempre.
function destinationAfterAuth(role: UserRole): AuthDestination {
  if (role === 'client') {
    if (consumePendingCartCheckout()) return { pathname: `${ROUTES.HOME}?openCart=1` }
    const preselect = consumePendingBookingPreselect()
    if (preselect) return { pathname: ROUTES.CLIENT_BOOK, state: preselect }
  }
  return { pathname: redirectByRole(role) }
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const { login }   = useAuth()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.user) {
        login(data.user)
        queryClient.setQueryData(['auth', 'me'], data)
        const { pathname, state } = destinationAfterAuth(data.user.role)
        navigate(pathname, { state })
      }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const { login }   = useAuth()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.user) {
        login(data.user)
        queryClient.setQueryData(['auth', 'me'], data)
        const { pathname, state } = destinationAfterAuth(data.user.role)
        navigate(pathname, { state })
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const { logout }  = useAuth()
  const { clear }   = useCart()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      clear()
      queryClient.clear()
      navigate(ROUTES.LOGIN)
    },
  })
}
