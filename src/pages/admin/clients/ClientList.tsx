import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { AdminClient } from './types'

interface Props {
  clients: AdminClient[]
  onSelect: (client: AdminClient) => void
  onCreate: () => void
}

export function ClientList({ clients, onSelect, onCreate }: Props) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    `${c.name ?? ''} ${c.email ?? ''} ${c.phone ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px', fontFamily: "'Lato', sans-serif" }}>
            Clientes
          </h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0, fontFamily: "'Lato', sans-serif" }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onCreate} style={primaryBtnStyle}>
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '36px', width: '100%' }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px', fontFamily: "'Lato', sans-serif" }}>
          No se encontraron clientes
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} onClick={() => onSelect(client)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, onClick }: { client: AdminClient; onClick: () => void }) {
  const displayName = client.name?.trim() || client.email || 'Cliente'
  const initials = displayName.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px',
        padding: '16px', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'center',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        fontFamily: "'Lato', sans-serif",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(6,148,148,0.12)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(6,148,148,0.3)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = ''
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#e5e5e5'
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #069494, #047a7a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: '16px',
      }}>
        {client.photo
          ? <img src={client.photo} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '17px', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
          {client.blocked && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#e53935', background: 'rgba(229,57,53,0.1)', padding: '2px 7px', borderRadius: '20px', flexShrink: 0 }}>
              Bloqueado
            </span>
          )}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {client.phone}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#069494', fontWeight: 700 }}>
          {client.loyalty?.totalVisits ?? 0} visitas · ${(client.loyalty?.totalSpent ?? 0).toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none',
  fontFamily: "'Lato', sans-serif", background: '#fff',
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '10px 20px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '15px', fontWeight: 700,
  fontFamily: "'Lato', sans-serif",
}