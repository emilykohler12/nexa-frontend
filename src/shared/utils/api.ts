//src/shared/utils/api.ts

import axios from 'axios'
import { appConfig } from '@/app/config/app.config'

export const api = axios.create({
  baseURL:         appConfig.apiUrl,
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
})

// ── Interceptor de respuesta ─────────────────────────────
// Solo redirige a /login si el 401 NO viene de /auth/me
// (ese endpoint es el que verifica sesión al inicio — si no
// hay sesión es esperado y no debe redirigir)
api.interceptors.response.use(
  res => res,
  error => {
    const url: string = error.config?.url ?? ''
    const is401        = error.response?.status === 401
    const isAuthCheck  = url.includes('/auth/me')
      || url.includes('/auth/refresh')
      || url.includes('/auth/login')
      || url.includes('/auth/register')
      || url.includes('/auth/forgot-password')
      || url.includes('/auth/reset-password')

    if (is401 && !isAuthCheck) {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)