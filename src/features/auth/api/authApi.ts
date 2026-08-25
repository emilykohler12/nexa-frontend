import { api } from '@/shared/utils/api'
import type { User }          from '../AuthContext'
import type { LoginInput }    from '../model/schemas'
import type { RegisterInput } from '../model/schemas'

export const authApi = {
  login: (data: LoginInput) =>
    api.post<{ user: User }>('/api/auth/login', data).then(r => r.data),

  register: (data: RegisterInput) =>
    api.post<{ user: User }>('/api/auth/register', data).then(r => r.data),

  me: () =>
    api.get<{ user: User | null }>('/api/auth/me').then(r => r.data),

  logout: () =>
    api.post<{ success: true }>('/api/auth/logout').then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }).then(r => r.data),
}