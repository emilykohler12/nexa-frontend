import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { InfoTab }    from './tabs/InfoTab'
import { HistoryTab } from './tabs/HistoryTab'
import { LoyaltyTab } from './tabs/LoyaltyTab'
import { GalleryTab } from './tabs/GalleryTab'
import type { AdminClient } from './types'

type Tab = 'info' | 'history' | 'loyalty' | 'gallery'

const TABS: { id: Tab; label: string }[] = [
  { id: 'info',    label: 'Información'  },
  { id: 'history', label: 'Historial'    },
  { id: 'loyalty', label: 'Fidelización' },
  { id: 'gallery', label: 'Galería'      },
]

interface Props {
  client: AdminClient
  onBack: () => void
  onSave: (updated: AdminClient) => Promise<void>
}

export function ClientDetail({ client, onBack, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const displayName = client.name?.trim() || client.email || 'Cliente'
  const initials = displayName.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#000', fontSize: '15px', fontWeight: 600, padding: '0', width: 'fit-content', fontFamily: "'Lato', sans-serif" }}
      >
        <ArrowLeft size={16} /> Volver a la lista
      </button>

      {/* Header del cliente */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '22px', flexWrap: 'wrap' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #069494, #047a7a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '22px',
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, color: '#000', overflowWrap: 'anywhere' }}>
            {displayName}
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#000', overflowWrap: 'anywhere' }}>
            {client.phone} · {client.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: '#f0f0f0', borderRadius: '10px', padding: '3px', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              background: activeTab === tab.id ? '#069494' : 'transparent',
              color:      activeTab === tab.id ? '#fff'    : '#000',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info'    && <InfoTab    client={client} onSave={onSave} />}
      {activeTab === 'history' && <HistoryTab client={client} />}
      {activeTab === 'loyalty' && <LoyaltyTab client={client} />}
      {activeTab === 'gallery' && <GalleryTab client={client} />}
    </div>
  )
}