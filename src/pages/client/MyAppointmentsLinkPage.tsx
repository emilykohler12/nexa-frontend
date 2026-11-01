// src/pages/client/MyAppointmentsLinkPage.tsx
//
// Alias /mis-turnos: es la dirección que llevan los botones del mail de recordatorio. No muestra nada propio:
//  - sin sesión: guarda el enlace y manda al login (LoginPage lo devuelve acá apenas entra);
//  - clienta: la lleva a /client/appointments conservando `turno` y `accion`;
//  - profesional o administración: no se abre el turno (es un turno de una clienta) y se lo explica.
import { useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, redirectByRole } from '@/features/auth/AuthContext'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'
import { parseReminderLink, reminderLinkSearch } from '@/features/client/appointments/reminderLink'
import { setPendingReminderLink } from '@/features/client/appointments/pendingReminderLink'

export function MyAppointmentsLinkPage() {
  const { user, isLoading } = useAuth()
  const { business }        = useTenant()
  const navigate            = useNavigate()
  const [params]            = useSearchParams()
  const link                = parseReminderLink(params)
  const turno               = link?.turno
  const accion              = link?.accion

  useEffect(() => {
    if (isLoading || user) return
    if (turno && accion) setPendingReminderLink({ turno, accion })
    navigate(ROUTES.LOGIN, { replace: true })
  }, [isLoading, user, turno, accion, navigate])

  if (isLoading || !user) return <div className="p-8 text-center text-gray-500">Cargando...</div>

  if (user.role === 'client') {
    return <Navigate to={{ pathname: ROUTES.CLIENT_APPOINTMENTS, search: link ? reminderLinkSearch(link) : '' }} replace />
  }

  const color = business?.primaryColor ?? '#069494'
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold" style={{ color }}>Este enlace es para clientas</h1>
      <p role="status" className="text-sm text-gray-600">
        Abre un turno de la cuenta de una clienta y entraste con una cuenta {user.role === 'admin' ? 'de administración' : 'de profesional'},
        por eso no lo abrimos.
      </p>
      <button
        type="button"
        onClick={() => navigate(redirectByRole(user.role), { replace: true })}
        className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
        style={{ background: color }}
      >
        Ir a mi panel
      </button>
    </main>
  )
}
