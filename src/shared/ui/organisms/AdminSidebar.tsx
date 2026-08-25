import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CalendarDays, LayoutDashboard, Scissors, ShoppingBag,
  Users, UserCheck, Activity, Settings, LogOut, Menu, X, Home,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { ROUTES } from '@/app/config/routes.config'
import './AdminSidebar.css'

interface NavItem { to: string; icon: React.ElementType; label: string }

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.ADMIN_APPOINTMENTS,  icon: CalendarDays,    label: 'Turnos'        },
  { to: ROUTES.ADMIN_DASHBOARD,     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: ROUTES.ADMIN_SERVICES,      icon: Scissors,        label: 'Servicios'     },
  { to: ROUTES.ADMIN_PROFESSIONALS, icon: Users,           label: 'Profesionales' },
  { to: ROUTES.ADMIN_STORE,         icon: ShoppingBag,     label: 'Tienda'        },
  { to: ROUTES.ADMIN_CLIENTS,       icon: UserCheck,       label: 'Clientes'      },
  { to: ROUTES.ADMIN_ACTIVITY,      icon: Activity,        label: 'Actividad'     },
  { to: ROUTES.ADMIN_SETTINGS,      icon: Settings,        label: 'Configuración' },
]

export function AdminSidebar({ onWidthChange }: { onWidthChange?: (w: number) => void }) {
  const [collapsed,   setCollapsed]  = useState(false)
  const [isMobile,    setIsMobile]   = useState(false)
  const [mobileOpen,  setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) { setCollapsed(true); setMobileOpen(false) }
    }
    setIsMobile(mq.matches)
    if (mq.matches) { setCollapsed(true); setMobileOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isExpanded   = !collapsed
  const sidebarWidth = isExpanded ? 220 : 56

  useEffect(() => {
    onWidthChange?.(isMobile ? 0 : sidebarWidth)
  }, [sidebarWidth, isMobile, onWidthChange])

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
    } finally {
      logout()
      navigate(ROUTES.LOGIN)
    }
  }

  const closeMobile = () => setMobileOpen(false)

  // Clases del aside según estado mobile/desktop
  const sidebarClass = [
    'admin-sidebar',
    isMobile && mobileOpen  ? 'admin-sidebar--mobile-open'   : '',
    isMobile && !mobileOpen ? 'admin-sidebar--mobile-hidden'  : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Overlay — solo mobile cuando está abierto */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} aria-hidden="true" />
      )}

      {/* FAB hamburguesa — solo mobile cuando sidebar cerrado */}
      {isMobile && !mobileOpen && (
        <button
          className="admin-mobile-fab"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      <aside
        aria-label="Navegación principal"
        className={sidebarClass}
        style={{ width: isMobile ? '220px' : `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className={`sidebar-toggle-row ${isExpanded || isMobile ? 'sidebar-toggle-row--end' : 'sidebar-toggle-row--center'}`}>
            <button
              onClick={() => isMobile ? closeMobile() : setCollapsed(c => !c)}
              aria-label={isExpanded ? 'Colapsar menú' : 'Expandir menú'}
              className="sidebar-toggle-btn"
            >
              {(isExpanded || isMobile) ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          <div className="sidebar-avatar">L</div>

          {(isExpanded || isMobile) && (
            <p className="sidebar-username">
              {user?.name ?? 'Administrador'}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed && !isMobile ? item.label : undefined}
              onClick={isMobile ? closeMobile : undefined}
              className={({ isActive }) =>
                [
                  'sidebar-nav-item',
                  collapsed && !isMobile ? 'sidebar-nav-item--collapsed' : '',
                  isActive ? 'sidebar-nav-item--active' : '',
                ].filter(Boolean).join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} className={isActive ? 'sidebar-nav-icon--active' : 'sidebar-nav-icon'} />
                  {(isExpanded || isMobile) && <span className="sidebar-nav-label">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <HomeButton
            collapsed={collapsed && !isMobile}
            onClick={() => navigate(ROUTES.HOME)}
          />
          <LogoutButton
            collapsed={collapsed && !isMobile}
            onLogout={handleLogout}
          />
        </div>
      </aside>
    </>
  )
}

function HomeButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Ir al inicio"
      className={[
        'sidebar-home-btn',
        hovered   ? 'sidebar-home-btn--hovered'   : '',
        collapsed ? 'sidebar-home-btn--collapsed' : '',
      ].filter(Boolean).join(' ')}
    >
      <Home size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span>Ir al inicio</span>}
    </button>
  )
}

function LogoutButton({ collapsed, onLogout }: { collapsed: boolean; onLogout: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Cerrar sesión"
      className={[
        'sidebar-logout-btn',
        hovered   ? 'sidebar-logout-btn--hovered'   : '',
        collapsed ? 'sidebar-logout-btn--collapsed' : '',
      ].filter(Boolean).join(' ')}
    >
      <LogOut size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  )
}