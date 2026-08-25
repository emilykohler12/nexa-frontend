import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { ClientDetail } from './components/ClientDetail'
import type { ProfessionalClient } from '@/features/professional/types/client'

export function Client() {
  const { business } = useTenant()
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<ProfessionalClient | null>(null)
  const [clients, setClients] = useState<ProfessionalClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ clients: ProfessionalClient[] }>('/api/professional/clients')
      .then(res => setClients(res.data.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor: primary, accentColor: accent } = business

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (selected) {
    return <ClientDetail client={selected} primary={primary} accent={accent} onBack={() => setSelected(null)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <div>
        <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Clientes</h1>
        <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Historial y fichas de tus clientes</p>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
        <input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '36px', padding: '10px 14px 10px 36px', border: '1px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', width: '100%', outline: 'none', fontFamily: "'Lato', sans-serif", color: '#000' }}
        />
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#000', padding: '40px', fontSize: '16px' }}>Cargando clientes...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#000', padding: '40px', fontSize: '16px' }}>
            {clients.length === 0 ? 'Todavía no tenés clientes que hayan reservado un turno con vos.' : 'Sin resultados'}
          </p>
        ) : filtered.map(client => (
          <div
            key={client.id}
            onClick={() => setSelected(client)}
            style={{
              background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px',
              padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${primary}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', fontWeight: 700, color: primary }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#000' }}>{client.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '15px', color: '#000' }}>{client.email} · {client.phone}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '23px', fontWeight: 700, color: accent }}>{client.visits.length}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#000' }}>visitas</p>
            </div>
            {client.nextAppointment && (
              <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: 'rgba(6,148,148,0.1)', color: primary }}>
                Turno hoy
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
