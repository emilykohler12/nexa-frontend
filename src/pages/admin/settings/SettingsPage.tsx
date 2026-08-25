import { useState } from 'react'
import { Settings2, Clock, CreditCard, ShieldCheck } from 'lucide-react'
import { GeneralSection }       from './GeneralSection'
import { ScheduleSection }      from './ScheduleSection'
import { PaymentsSection }      from './PaymentsSection'
import { SecuritySection }      from './SecuritySection'
import './SettingsPage.css'

type SettingsTab = { id: string; label: string; icon: React.ElementType; component: React.ComponentType }

const TABS: SettingsTab[] = [
  { id: 'general',  label: 'General',   icon: Settings2,   component: GeneralSection  },
  { id: 'schedule', label: 'Horarios',  icon: Clock,       component: ScheduleSection },
  { id: 'payments', label: 'Pagos',     icon: CreditCard,  component: PaymentsSection },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck, component: SecuritySection },
]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? GeneralSection

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Ajustes generales del sistema</p>
      </div>

      <div className="settings-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  )
}
