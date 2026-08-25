// Roles deben coincidir exactamente con lo que devuelve el backend
export type UserRole = 'admin' | 'professional' | 'client'

export interface User {
  id:    string
  name:  string
  email: string
  role:  UserRole
  phone?: string | null
}