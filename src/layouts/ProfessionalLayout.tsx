// src/layouts/ProfessionalLayout.tsx
import { useState }     from 'react'
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useTenant }    from '@/features/tenant/TenantContext'
import { useAuth }      from '@/features/auth/AuthContext'
import { ROUTES }       from '@/app/config/routes.config'
import {
  Calendar, Users, Scissors, BarChart2,
  Bell, Settings, LogOut, Menu, X, Clock, Home,
} from 'lucide-react'
import './ProfessionalLayout.css'

const NAV_ITEMS = [
  { path: ROUTES.PROFESSIONAL_AGENDA,        label: 'Agenda',         icon: Calendar  },
  { path: ROUTES.PROFESSIONAL_PANEL,         label: 'Estadísticas',   icon: BarChart2 },
  { path: ROUTES.PROFESSIONAL_CLIENTS,       label: 'Clientes',       icon: Users     },
  { path: ROUTES.PROFESSIONAL_SERVICES,      label: 'Servicios',      icon: Scissors  },
  { path: ROUTES.PROFESSIONAL_SCHEDULE,      label: 'Horarios',       icon: Clock     },
  { path: ROUTES.PROFESSIONAL_NOTIFICATIONS, label: 'Notificaciones', icon: Bell      },
  { path: ROUTES.PROFESSIONAL_SETTINGS,      label: 'Configuración',  icon: Settings  },
]

export function ProfessionalLayout() {
  const { business }                = useTenant()
  const { user, isLoading, logout } = useAuth()
  const navigate                    = useNavigate()
  const location                    = useLocation()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (isLoading) return <div className="prof-layout-loading">Cargando...</div>

  // Guard activo: solo profesionales pueden entrar
  if (!user || user.role !== 'professional') {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!business) return null

  const { primaryColor, accentColor } = business
  const sidebarWidth = collapsed ? 56 : 220
  const initial = user.name?.charAt(0).toUpperCase() ?? 'P'

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN) }

  return (
    <div className="prof-layout-root">

      {mobileOpen && (
        <div className="prof-layout-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className="prof-layout-sidebar" style={{ width: `${sidebarWidth}px` }}>

        <div className="prof-sidebar-header">
          <div style={{ width: '100%', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
            <button
              className="prof-sidebar-toggle"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #047a7a)` }}
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? <Menu size={15} /> : <X size={15} />}
            </button>
          </div>

          <div
            className="prof-sidebar-avatar"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            {user.photo ? <img src={user.photo} alt={user.name ?? 'Perfil'} /> : initial}
          </div>

          {!collapsed && (
            <div className="prof-sidebar-user">
              <p className="prof-sidebar-name">{user.name ?? 'Profesional'}</p>
              <p className="prof-sidebar-role">Profesional</p>
            </div>
          )}
        </div>

        <nav className="prof-sidebar-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setMobileOpen(false) }}
                className={`prof-nav-item${isActive ? ' active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding:        collapsed ? '10px 0' : '10px 14px',
                  background:     isActive
                    ? `linear-gradient(135deg, ${primaryColor}, #047a7a)`
                    : 'transparent',
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="prof-nav-icon" />
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="prof-sidebar-footer">
          <button
            className="prof-home-btn"
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding:        collapsed ? '9px 0' : '9px 10px',
            }}
            onClick={() => navigate(ROUTES.HOME)}
            aria-label="Ir al inicio"
          >
            <Home size={16} />
            {!collapsed && <span>Ir al inicio</span>}
          </button>
          <button
            className="prof-logout-btn"
            style={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding:        collapsed ? '9px 0' : '9px 10px',
            }}
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="prof-layout-main" style={{ marginLeft: `${sidebarWidth}px` }}>
        <div className="prof-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}