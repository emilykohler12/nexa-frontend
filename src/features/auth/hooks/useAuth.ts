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

export interface AuthDestination {
  pathname: string
  state?:   unknown
}

// A dónde mandar al usuario apenas queda logueado. Si el login/registro vino de
// "confirmar" un carrito o de tocar "Reservar turno" sin estar logueado, lo
// devolvemos directo ahí en vez de a su panel de siempre.
//
// OJO: consume (borra) las marcas de sessionStorage, así que tiene que llamarse
// UNA sola vez por login. El único que navega después de autenticarse es el
// efecto de LoginPage — por eso useLogin/useRegister ya no navegan acá, para no
// competir con ese efecto ni consumir la marca dos veces.
export function destinationAfterAuth(role: UserRole): AuthDestination {
  if (role === 'client') {
    if (consumePendingCartCheckout()) return { pathname: `${ROUTES.HOME}?openCart=1` }
    const preselect = consumePendingBookingPreselect()
    if (preselect) return { pathname: ROUTES.CLIENT_BOOK, state: preselect }
  }
  return { pathname: redirectByRole(role) }
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { login }   = useAuth()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.user) {
        login(data.user)
        queryClient.setQueryData(['auth', 'me'], data)
      }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { login }   = useAuth()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.user) {
        login(data.user)
        queryClient.setQueryData(['auth', 'me'], data)
      }
    },
  })
}

export function useSocialLogin() {
  const queryClient = useQueryClient()
  const { login }   = useAuth()

  return useMutation({
    mutationFn: authApi.socialLogin,
    onSuccess: (data) => {
      if (data.user) {
        login(data.user)
        queryClient.setQueryData(['auth', 'me'], data)
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
