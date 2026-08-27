import { useState, useEffect } from 'react'
import { api } from '@/shared/utils/api'
import { ClientList } from './ClientList'
import { ClientDetail } from './ClientDetail'
import { CreateClientModal } from './CreateClientModal'
import type { AdminClient } from './types'

export function ClientsPage() {
  const [clients, setClients] = useState<AdminClient[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminClient | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.get<{ clients: AdminClient[] }>('/api/admin/clients')
      .then(res => setClients(res.data.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (updated: AdminClient) => {
    const res = await api.put<{ client: AdminClient }>(`/api/admin/clients/${updated.id}`, updated)
    setClients(prev => prev.map(c => c.id === updated.id ? res.data.client : c))
    setSelected(res.data.client)
  }

  const handleCreated = (client: AdminClient) => {
    setClients(prev => [client, ...prev])
    setShowCreate(false)
  }

  const handleToggleBlock = async (client: AdminClient) => {
    const res = await api.patch<{ client: AdminClient }>(`/api/admin/clients/${client.id}/block`, { blocked: !client.blocked })
    setClients(prev => prev.map(c => c.id === client.id ? res.data.client : c))
    setSelected(res.data.client)
  }

  if (selected) {
    return (
      <ClientDetail
        client={selected}
        onBack={() => setSelected(null)}
        onSave={handleSave}
        onToggleBlock={handleToggleBlock}
      />
    )
  }

  if (loading) {
    return <p style={{ fontFamily: "'Lato', sans-serif", color: '#000', fontSize: '16px' }}>Cargando clientes...</p>
  }

  return (
    <>
      <ClientList
        clients={clients}
        onSelect={setSelected}
        onCreate={() => setShowCreate(true)}
      />
      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
