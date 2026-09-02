// src/app/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/app/config/routes.config'

import { PublicLayout }       from '@/layouts/PublicLayout'
import { ClientLayout }       from '@/layouts/ClientLayout'
import { ProfessionalLayout } from '@/layouts/ProfessionalLayout'
import { AdminLayout }        from '@/layouts/AdminLayout'

import { HomePage }    from '@/pages/public/HomePage'
import { LoginPage }   from '@/pages/public/LoginPage'
import { ProfessionalRegisterPage } from '@/pages/public/ProfessionalRegisterPage'
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage'

import { AppointmentsPage as ClientAppointmentsPage } from '@/pages/client/AppointmentsPage'
import { BookPage }      from '@/pages/client/BookPage'
import { ProfilePage }   from '@/pages/client/ProfilePage'
import { FavoritesPage } from '@/pages/client/FavoritesPage'
import { NotificationsPage as ClientNotificationsPage } from '@/pages/client/NotificationsPage'
import { ProductsHistoryPage } from '@/pages/client/ProductsHistoryPage'

import { ProfessionalPanelPage }  from '@/pages/professional/ProfessionalPanelPage'
import { AgendaPage }             from '@/pages/professional/AgendaPage'
import { ClientPage }            from '@/pages/professional/ClientPage'
import { ServicesPage as ProfServicesPage } from '@/pages/professional/ServicesPage'
import { StatisticsPage }         from '@/pages/professional/StatisticsPage'
import { NotificationsPage }      from '@/pages/professional/NotificationsPage'
import { SettingsPage as ProfSettingsPage } from '@/pages/professional/SettingsPage'
import { SchedulePage } from '@/pages/professional/SchedulePage'

import { DashboardPage }     from '@/pages/admin/dashboard/DashboardPage'
import { AppointmentsPage }  from '@/pages/admin/AppointmentsPage'
import { ServicesPage }      from '@/pages/admin/ServicesPage'
import { StorePage }         from '@/pages/admin/StorePage'
import { ProfessionalsPage } from '@/pages/admin/ProfessionalsPage'
import { ActivityPage }      from '@/pages/admin/ActivityPage'
import { PromotionsPage }    from '@/pages/admin/PromotionsPage'
import { SettingsPage }      from '@/pages/admin/SettingsPage'
import { ClientsPage as AdminClientsPage } from '@/pages/admin/ClientsPage'


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME}  element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path="/registro-profesional" element={<ProfessionalRegisterPage />} />
          <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
        </Route>

        {/* Cliente */}
        <Route element={<ClientLayout />}>
          <Route path={ROUTES.CLIENT_APPOINTMENTS} element={<ClientAppointmentsPage />} />
          <Route path={ROUTES.CLIENT_BOOK}         element={<BookPage />} />
          <Route path={ROUTES.CLIENT_PROFILE}      element={<ProfilePage />} />
          <Route path={ROUTES.CLIENT_FAVORITES}    element={<FavoritesPage />} />
          <Route path={ROUTES.CLIENT_NOTIFICATIONS} element={<ClientNotificationsPage />} />
          <Route path={ROUTES.CLIENT_PRODUCTS}      element={<ProductsHistoryPage />} />
        </Route>

        {/* Profesional */}
        <Route element={<ProfessionalLayout />}>
          <Route path={ROUTES.PROFESSIONAL_PANEL}         element={<ProfessionalPanelPage />} />
          <Route path={ROUTES.PROFESSIONAL_AGENDA}        element={<AgendaPage />} />
          <Route path={ROUTES.PROFESSIONAL_CLIENTS}       element={<ClientPage />} />
          <Route path={ROUTES.PROFESSIONAL_SERVICES}      element={<ProfServicesPage />} />
          <Route path={ROUTES.PROFESSIONAL_STATISTICS}    element={<StatisticsPage />} />
          <Route path={ROUTES.PROFESSIONAL_NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.PROFESSIONAL_SETTINGS}      element={<ProfSettingsPage />} />
          <Route path={ROUTES.PROFESSIONAL_SCHEDULE} element={<SchedulePage />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path={ROUTES.ADMIN_DASHBOARD}     element={<DashboardPage />} />
          <Route path={ROUTES.ADMIN_APPOINTMENTS}  element={<AppointmentsPage />} />
          <Route path={ROUTES.ADMIN_SERVICES}      element={<ServicesPage />} />
          <Route path={ROUTES.ADMIN_STORE}         element={<StorePage />} />
          <Route path={ROUTES.ADMIN_PROFESSIONALS} element={<ProfessionalsPage />} />
          <Route path={ROUTES.ADMIN_CLIENTS}       element={<AdminClientsPage />} />
          <Route path={ROUTES.ADMIN_ACTIVITY}      element={<ActivityPage />} />
          <Route path={ROUTES.ADMIN_PROMOTIONS}    element={<PromotionsPage />} />
          <Route path={ROUTES.ADMIN_SETTINGS}      element={<SettingsPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}