// src/features/professional/services/Services.tsx
import { useState, useEffect } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { AddServiceModal } from './AddServiceModal'
import type { CatalogService, AssignedService } from './types'
import './Services.css'

export function Services() {
  const { business } = useTenant()
  const [catalog,  setCatalog]  = useState<CatalogService[]>([])
  const [assigned, setAssigned] = useState<AssignedService[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<{ services: CatalogService[] }>('/api/services'),
      api.get<{ services: AssignedService[] }>('/api/professional/services'),
    ])
      .then(([catalogRes, assignedRes]) => {
        setCatalog(catalogRes.data.services ?? [])
        setAssigned(assignedRes.data.services ?? [])
      })
      .catch(() => setError('No se pudieron cargar los servicios'))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor: primary, accentColor: accent } = business

  const persist = (next: AssignedService[]) => {
    const prev = assigned
    setAssigned(next)
    setError(null)
    api.patch('/api/professional/services', { services: next })
      .catch(() => {
        setAssigned(prev)
        setError('No se pudo guardar el cambio. Intentá de nuevo.')
      })
  }

  const toggleStatus = (serviceId: string) => {
    persist(assigned.map(a =>
      a.serviceId === serviceId ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ))
  }

  const handleAddServices = (selectedIds: string[]) => {
    const next: AssignedService[] = selectedIds.map(id => {
      const existing = assigned.find(a => a.serviceId === id)
      return existing ?? { serviceId: id, status: 'active' }
    })
    persist(next)
    setShowModal(false)
  }

  const myServices = assigned
    .map(a => ({ ...a, service: catalog.find(c => c.id === a.serviceId) }))
    .filter((a): a is AssignedService & { service: CatalogService } => !!a.service)

  const active   = myServices.filter(s => s.status === 'active')
  const inactive = myServices.filter(s => s.status === 'inactive')

  const ServiceCard = ({ item }: { item: AssignedService & { service: CatalogService } }) => (
    <div className="service-card" style={{ opacity: item.status === 'active' ? 1 : 0.6 }}>
      <div className="service-card-top">
        <div>
          <p className="service-card-name">{item.service.name}</p>
          <p className="service-card-meta">{item.service.duration} min</p>
        </div>
        <button
          className="service-card-toggle"
          onClick={() => toggleStatus(item.serviceId)}
          style={{ color: item.status === 'active' ? primary : '#ccc' }}
          title={item.status === 'active' ? 'Desactivar' : 'Activar'}
        >
          {item.status === 'active' ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
        </button>
      </div>

      <p className="service-card-desc">{item.service.description}</p>

      <div className="service-card-bottom">
        <span className="service-card-price" style={{ color: accent }}>
          ${Number(item.service.price).toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="services-page">
        <div className="services-header">
          <div>
            <h1 className="services-title">Mis Servicios</h1>
            <p className="services-subtitle">Gestioná los servicios que ofrecés</p>
          </div>
        </div>
        <div className="services-loading">Cargando servicios...</div>
      </div>
    )
  }

  return (
    <div className="services-page">
      <div className="services-header">
        <div>
          <h1 className="services-title">Mis Servicios</h1>
          <p className="services-subtitle">Gestioná los servicios que ofrecés</p>
        </div>
        <button className="services-add-btn" style={{ background: primary }} onClick={() => setShowModal(true)}>
          <Plus size={16} /> Agregar servicio
        </button>
      </div>

      {error && <div className="services-error">{error}</div>}

      {myServices.length === 0 ? (
        <div className="services-empty">
          Todavía no elegiste ningún servicio. Tocá "Agregar servicio" para empezar.
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="services-section-label">Activos ({active.length})</p>
              <div className="services-grid">
                {active.map(s => <ServiceCard key={s.serviceId} item={s} />)}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <p className="services-section-label">Inactivos ({inactive.length})</p>
              <div className="services-grid">
                {inactive.map(s => <ServiceCard key={s.serviceId} item={s} />)}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <AddServiceModal
          catalog={catalog}
          assignedIds={assigned.map(a => a.serviceId)}
          primary={primary}
          onClose={() => setShowModal(false)}
          onSave={handleAddServices}
        />
      )}
    </div>
  )
}
