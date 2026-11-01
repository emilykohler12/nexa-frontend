import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { MyAppointmentsLinkPage } from './MyAppointmentsLinkPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { PENDING_REMINDER_LINK_KEY } from '@/features/client/appointments/pendingReminderLink'
import type { UserRole } from '@/features/auth/AuthContext'

// Sesión simulada: cada prueba la cambia y vuelve a dibujar.
const authState: { user: { id: string; name: string; email: string; role: UserRole } | null; isLoading: boolean } = {
  user: null, isLoading: false,
}

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => authState,
  redirectByRole: (role: string) => ({ admin: '/admin/dashboard', professional: '/professional/panel', client: '/client/appointments' }[role] ?? '/'),
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37', name: 'Loren', logo: '' } }),
}))
// Formularios de login y registro: acá solo importa a dónde manda LoginPage después de entrar.
vi.mock('@/features/auth/components/LoginForm',    () => ({ LoginForm:    () => <p>Formulario de ingreso</p> }))
vi.mock('@/features/auth/components/RegisterForm', () => ({ RegisterForm: () => <p>Formulario de registro</p> }))
// useAuth.ts (destinationAfterAuth) también importa el carrito y la API; no se usan en estas pruebas.
vi.mock('@/features/store/CartContext', () => ({ useCart: () => ({ clear: () => {} }) }))
vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const as = (role: UserRole) => ({ id: 'u1', name: 'Ana', email: 'ana@example.com', role })

function Where() {
  const { pathname, search } = useLocation()
  return <p data-testid="where">{pathname}{search}</p>
}

function tree(initial: string) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/mis-turnos" element={<MyAppointmentsLinkPage />} />
        <Route path="/login"      element={<><LoginPage /><Where /></>} />
        <Route path="*"           element={<Where />} />
      </Routes>
    </MemoryRouter>
  )
}

const where = () => screen.getByTestId('where').textContent

describe('/mis-turnos: alias del enlace del mail de recordatorio', () => {
  beforeEach(() => {
    sessionStorage.clear()
    authState.user = null
    authState.isLoading = false
  })

  describe('con sesión de clienta', () => {
    beforeEach(() => { authState.user = as('client') })

    it.each(['ver', 'reprogramar', 'cancelar'])('lleva a /client/appointments conservando turno y accion=%s', async accion => {
      render(tree(`/mis-turnos?turno=cm1abc23&accion=${accion}`))

      expect(await screen.findByTestId('where')).toHaveTextContent(`/client/appointments?turno=cm1abc23&accion=${accion}`)
    })

    it('no arrastra otros parámetros de la URL', async () => {
      render(tree('/mis-turnos?turno=cm1abc23&accion=ver&utm_source=mail&x=1'))

      expect(await screen.findByTestId('where')).toHaveTextContent(/^\/client\/appointments\?turno=cm1abc23&accion=ver$/)
    })

    it('sin turno (o con un turno inválido) lleva a la lista común', async () => {
      render(tree('/mis-turnos?turno=%3Cb%3E&accion=cancelar'))

      expect(await screen.findByTestId('where')).toHaveTextContent(/^\/client\/appointments$/)
    })

    it('no hace nada mientras se verifica la sesión', () => {
      authState.isLoading = true
      render(tree('/mis-turnos?turno=cm1abc23&accion=ver'))

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
      expect(screen.queryByTestId('where')).not.toBeInTheDocument()
    })
  })

  describe('sin sesión: al login y vuelta al mismo enlace', () => {
    it('manda al login y guarda el enlace', async () => {
      render(tree('/mis-turnos?turno=cm1abc23&accion=cancelar'))

      expect(await screen.findByText('Formulario de ingreso')).toBeInTheDocument()
      expect(where()).toBe('/login')
      expect(JSON.parse(sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)!)).toMatchObject({ turno: 'cm1abc23', accion: 'cancelar' })
    })

    it('después de entrar como clienta vuelve al mismo enlace y termina en Mis turnos con el turno y la acción', async () => {
      const { rerender } = render(tree('/mis-turnos?turno=cm1abc23&accion=reprogramar'))
      await screen.findByText('Formulario de ingreso')

      authState.user = as('client')
      rerender(tree('/mis-turnos?turno=cm1abc23&accion=reprogramar'))

      // LoginPage la manda a /mis-turnos?... (el mismo enlace) y el alias la lleva a Mis turnos.
      await waitFor(() => expect(where()).toBe('/client/appointments?turno=cm1abc23&accion=reprogramar'))
      expect(sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)).toBeNull()
    })

    it.each([
      ['professional', '/professional/panel'],
      ['admin',        '/admin/dashboard'],
    ] as const)('si entra %s, el enlace se descarta y va a su panel', async (role, panel) => {
      const { rerender } = render(tree('/mis-turnos?turno=cm1abc23&accion=cancelar'))
      await screen.findByText('Formulario de ingreso')
      expect(sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)).not.toBeNull()

      authState.user = as(role)
      rerender(tree('/mis-turnos?turno=cm1abc23&accion=cancelar'))

      await waitFor(() => expect(where()).toBe(panel))
      expect(sessionStorage.getItem(PENDING_REMINDER_LINK_KEY)).toBeNull()
    })

    it('un enlace guardado hace más de una hora no se usa', async () => {
      sessionStorage.setItem(PENDING_REMINDER_LINK_KEY, JSON.stringify({ turno: 'cm1abc23', accion: 'cancelar', at: Date.now() - 61 * 60_000 }))
      authState.user = as('client')
      render(tree('/login'))

      await waitFor(() => expect(where()).toBe('/client/appointments'))
    })
  })

  describe('con sesión de profesional o administración: no se abre el turno', () => {
    it.each([
      ['professional', /de profesional/, '/professional/panel'],
      ['admin', /de administración/, '/admin/dashboard'],
    ] as const)('%s ve un mensaje y puede ir a su panel', async (role, text, panel) => {
      authState.user = as(role)
      const user = userEvent.setup()
      render(tree('/mis-turnos?turno=cm1abc23&accion=cancelar'))

      expect(await screen.findByRole('heading', { name: 'Este enlace es para clientas' })).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(text)
      expect(screen.queryByTestId('where')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Ir a mi panel' }))

      expect(await screen.findByTestId('where')).toHaveTextContent(new RegExp(`^${panel}$`))
    })
  })
})
