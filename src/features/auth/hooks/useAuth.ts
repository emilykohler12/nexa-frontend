import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../AuthContext'
import { ROUTES } from '@/app/config/routes.config'
import type { UserRole } from '../AuthContext'

function redirectByRole(role: UserRole): string {
  switch (role) {
    case 'admin':        return ROUTES.ADMIN_DASHBOARD
    case 'professional': return ROUTES.PROFESSIONAL_PANEL
    case 'client':       return ROUTES.CLIENT_APPOINTMENTS
    default:             return ROUTES.HOME
  }
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
        navigate(redirectByRole(data.user.role))
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
        navigate(redirectByRole(data.user.role))
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const { logout }  = useAuth()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      queryClient.clear()
      navigate(ROUTES.LOGIN)
    },
  })
}