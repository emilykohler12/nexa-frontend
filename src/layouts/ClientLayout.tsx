// src/layouts/ClientLayout.tsx
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useTenant }   from '@/features/tenant/TenantContext'
import { useAuth }     from '@/features/auth/AuthContext'
import { ROUTES }      from '@/app/config/routes.config'
import { Calendar, Plus, User, Heart, LogOut, Home, Bell } from 'lucide-react'
import './ClientLayout.css'

const NAV_ITEMS = [
  { path: ROUTES.CLIENT_APPOINTMENTS,  label: 'Mis Turnos', icon: Calendar },
  { path: ROUTES.CLIENT_BOOK,          label: 'Reservar',   icon: Plus     },
  { path: ROUTES.CLIENT_FAVORITES,     label: 'Favoritos',  icon: Heart    },
  { path: ROUTES.CLIENT_NOTIFICATIONS, label: 'Avisos',     icon: Bell     },
  { path: ROUTES.CLIENT_PROFILE,       label: 'Perfil',     icon: User     },
]

export function ClientLayout() {
  const { business }                  = useTenant()
  const { user, isLoading, logout }   = useAuth()
  const navigate                      = useNavigate()
  const location                      = useLocation()

  if (isLoading) return <div className="client-loading">Cargando...</div>
  if (!user || user.role !== 'client') return <Navigate to={ROUTES.LOGIN} replace />
  if (!business) return null

  const { primaryColor, accentColor } = business

  return (
    <div className="client-layout">

      {/* Header */}
      <header className="client-header" style={{ backgroundColor: primaryColor }}>
        {/* Logo */}
        <div className="client-header-logo" onClick={() => navigate(ROUTES.HOME)}>
          <img
            src={business.logo}
            alt={business.name}
            className="client-header-img"
            style={{ borderColor: accentColor }}
          />
          <span className="client-header-name">{business.name}</span>
        </div>

        {/* Botón Inicio — siempre visible arriba a la derecha */}
        <button
          className="client-home-btn"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <Home size={16} />
          Inicio
        </button>
      </header>

      {/* Sidebar — solo desktop */}
      <aside className="client-sidebar">
        <div className="client-sidebar-inner">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="client-nav-item"
                style={{
                  backgroundColor: isActive ? `${primaryColor}15` : 'transparent',
                  color:           isActive ? primaryColor : '#1a1a1a',
                  fontWeight:      isActive ? 700 : 400,
                }}
              >
                <Icon size={20} />
                {label}
              </button>
            )
          })}

          <div className="client-sidebar-footer">
            <button
              onClick={() => { logout(); navigate(ROUTES.LOGIN) }}
              className="client-logout-btn"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="client-main">
        <Outlet />
      </main>

      {/* Nav mobile bottom — solo mobile */}
      <nav className="client-bottom-nav" style={{ borderColor: '#e5e5e5' }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="client-bottom-btn"
              style={{ color: isActive ? primaryColor : '#555' }}
            >
              <Icon size={20} />
              <span style={{ fontWeight: isActive ? 700 : 400 }}>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
