// src/layouts/AdminLayout.tsx
import { useState }            from 'react'
import { Outlet, Navigate }    from 'react-router-dom'
import { AdminSidebar }        from '@/shared/ui/organisms/AdminSidebar'
import { useAuth }             from '@/features/auth/AuthContext'
import { ROUTES }              from '@/app/config/routes.config'
import './AdminLayout.css'

export function AdminLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="admin-layout-loading">Cargando...</div>
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return (
    <div className="admin-layout-root">
      <AdminSidebar onWidthChange={setSidebarWidth} />
      <div
        className="admin-layout-spacer"
        style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
      />
      <main className="admin-layout-main">
        <Outlet />
      </main>
    </div>
  )
}