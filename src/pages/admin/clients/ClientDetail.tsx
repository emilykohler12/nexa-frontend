import { useState } from 'react'
import { ArrowLeft, ShieldOff, ShieldCheck, UserX } from 'lucide-react'
import { InfoTab }    from './tabs/InfoTab'
import { HistoryTab } from './tabs/HistoryTab'
import { LoyaltyTab } from './tabs/LoyaltyTab'
import { GalleryTab } from './tabs/GalleryTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import type { AdminClient } from './types'
import { ConfirmModal } from '@/shared/ui/molecules/ConfirmModal'
import { useToast } from '@/shared/ui/molecules/ToastProvider'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

type Tab = 'info' | 'history' | 'loyalty' | 'gallery' | 'reviews'

const TABS: { id: Tab; label: string }[] = [
  { id: 'info',    label: 'Información'  },
  { id: 'history', label: 'Historial'    },
  { id: 'loyalty', label: 'Fidelización' },
  { id: 'gallery', label: 'Galería'      },
  { id: 'reviews', label: 'Reseñas'      },
]

// El backend deja el email de una clienta anonimizada como anonimo_<id>@borrado.com.
const isAnonymized = (client: AdminClient) => client.email.endsWith('@borrado.com')

interface Props {
  client: AdminClient
  onBack: () => void
  onSave: (updated: AdminClient) => Promise<void>
  onToggleBlock: (client: AdminClient) => Promise<void>
  onAnonymize: (client: AdminClient) => Promise<void>
}

export function ClientDetail({ client, onBack, onSave, onToggleBlock, onAnonymize }: Props) {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [blocking, setBlocking] = useState(false)
  const [confirmingBlock, setConfirmingBlock] = useState(false)
  const [anonymizing, setAnonymizing] = useState(false)
  const [confirmingAnonymize, setConfirmingAnonymize] = useState(false)
  const anonymized = isAnonymized(client)
  const displayName = client.name?.trim() || client.email || 'Cliente'
  const initials = displayName.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

  const handleConfirmBlock = async () => {
    setBlocking(true)
    try {
      await onToggleBlock(client)
    } finally {
      setBlocking(false)
      setConfirmingBlock(false)
    }
  }

  // RF-09 — supresión de datos personales a pedido de la clienta.
  const handleConfirmAnonymize = async () => {
    setAnonymizing(true)
    try {
      await onAnonymize(client)
      showToast('Los datos personales de la clienta se anonimizaron', 'success')
    } catch (err) {
      showToast(safeErrorMessage(err, 'No se pudieron anonimizar los datos. Probá de nuevo.'), 'error')
    } finally {
      setAnonymizing(false)
      setConfirmingAnonymize(false)
    }
  }

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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, color: '#000', overflowWrap: 'anywhere' }}>
              {displayName}
            </h2>
            {client.blocked && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e53935', background: 'rgba(229,57,53,0.1)', padding: '3px 10px', borderRadius: '20px' }}>
                Bloqueado
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '15px', color: '#000', overflowWrap: 'anywhere' }}>
            {client.phone} · {client.email}
          </p>
        </div>
        {!anonymized && (
          <button
            onClick={() => setConfirmingBlock(true)}
            disabled={blocking}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              border: `1px solid ${client.blocked ? '#069494' : '#e53935'}`, borderRadius: '9px',
              background: client.blocked ? 'rgba(6,148,148,0.06)' : 'rgba(229,57,53,0.06)',
              color: client.blocked ? '#069494' : '#e53935',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700,
              fontFamily: "'Lato', sans-serif", flexShrink: 0,
            }}
          >
            {client.blocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
            {blocking ? 'Guardando...' : client.blocked ? 'Desbloquear cliente' : 'Bloquear cliente'}
          </button>
        )}
        {!anonymized && (
          <button
            onClick={() => setConfirmingAnonymize(true)}
            disabled={anonymizing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              border: '1px solid #e53935', borderRadius: '9px',
              background: 'rgba(229,57,53,0.06)', color: '#e53935',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700,
              fontFamily: "'Lato', sans-serif", flexShrink: 0,
            }}
          >
            <UserX size={15} />
            {anonymizing ? 'Anonimizando...' : 'Anonimizar datos'}
          </button>
        )}
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

      {/* Una clienta anonimizada no se edita: el formulario guarda su estado al abrirse, y volver a
          guardarlo reescribiría el nombre, el teléfono y el email que se acaban de borrar. */}
      {activeTab === 'info' && (anonymized
        ? (
          <p style={{ margin: 0, padding: '20px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', fontSize: '15px', color: '#000' }}>
            Los datos personales de esta clienta se anonimizaron y ya no se pueden editar.
          </p>
        )
        : <InfoTab key={client.id} client={client} onSave={onSave} />
      )}
      {activeTab === 'history' && <HistoryTab client={client} />}
      {activeTab === 'loyalty' && <LoyaltyTab client={client} />}
      {activeTab === 'gallery' && <GalleryTab client={client} />}
      {activeTab === 'reviews' && <ReviewsTab client={client} />}

      {confirmingBlock && (
        <ConfirmModal
          title={client.blocked ? '¿Desbloquear cliente?' : '¿Bloquear cliente?'}
          message={
            client.blocked
              ? `${displayName} va a poder volver a reservar turnos y comprar en la tienda.`
              : `${displayName} no va a poder reservar turnos nuevos ni comprar productos en la tienda.`
          }
          confirmLabel={client.blocked ? 'Sí, desbloquear' : 'Sí, bloquear'}
          danger={!client.blocked}
          accentColor="#069494"
          loading={blocking}
          onConfirm={handleConfirmBlock}
          onCancel={() => setConfirmingBlock(false)}
        />
      )}
      {confirmingAnonymize && (
        <ConfirmModal
          title="¿Anonimizar los datos de esta clienta?"
          message={`Se van a borrar de forma permanente el nombre, el apellido, el email y el teléfono de ${displayName}, y su cuenta se va a desactivar. Los turnos y los importes se conservan. Esto no se puede deshacer.`}
          confirmLabel="Sí, anonimizar"
          danger
          accentColor="#069494"
          loading={anonymizing}
          onConfirm={handleConfirmAnonymize}
          onCancel={() => setConfirmingAnonymize(false)}
        />
      )}
    </div>
  )
}