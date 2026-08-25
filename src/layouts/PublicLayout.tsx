//src/layouts/PublicLayout.tsx

import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}