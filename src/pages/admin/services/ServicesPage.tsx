// src/pages/admin/services/ServicesPage.tsx
import { useState, useEffect } from 'react'
import { Plus }                from 'lucide-react'
import { api }                 from '@/shared/utils/api'
import { SERVICE_CATEGORIES }  from '@/app/data/shared'
import { ServiceList }         from './ServiceList'
import { ServiceFormModal }    from './ServiceFormModal'
import { ConfirmDeleteModal }  from './ConfirmDeleteModal'
import type { AdminService, ServiceFormValues } from './types'
import '@/shared/ui/admin/admin-controls.css'
import './services.css'

export function ServicesPage() {
  const [services,       setServices]       = useState<AdminService[]>([])
  const [loading,        setLoading]        = useState(true)
  const [editingService, setEditingService] = useState<AdminService | null>(null)
  const [isFormOpen,     setIsFormOpen]     = useState(false)
  const [deletingService, setDeletingService] = useState<AdminService | null>(null)
  const [error,          setError]          = useState<string | null>(null)
  const [notice,         setNotice]         = useState<string | null>(null)

  useEffect(() => {
    api.get<{ services: AdminService[] }>('/api/services/all')
      .then(res => setServices(res.data.services))
      .catch(() => setError('No se pudieron cargar los servicios'))
      .finally(() => setLoading(false))
  }, [])

  const openCreateForm = () => { setEditingService(null); setIsFormOpen(true) }
  const openEditForm   = (s: AdminService) => { setEditingService(s); setIsFormOpen(true) }

  const handleSave = async (values: ServiceFormValues) => {
    try {
      if (editingService) {
        const res = await api.put<{ service: AdminService }>(`/api/services/${editingService.id}`, values)
        setServices(prev => prev.map(s => s.id === editingService.id ? res.data.service : s))
      } else {
        const res = await api.post<{ service: AdminService }>('/api/services', values)
        setServices(prev => [res.data.service, ...prev])
      }
      setIsFormOpen(false)
    } catch {
      setError('Error al guardar el servicio')
    }
  }

  const requestDelete = (id: string) => {
    const service = services.find(s => s.id === id)
    if (service) setDeletingService(service)
  }

  const confirmDelete = async () => {
    if (!deletingService) return
    setError(null)
    setNotice(null)
    try {
      const res = await api.delete<{ success: boolean; deactivated?: boolean; message?: string }>(`/api/services/${deletingService.id}`)
      if (res.data?.deactivated) {
        // Tenía turnos asociados — el backend lo desactivó en vez de borrarlo,
        // así que sigue existiendo (como inactivo), no se saca de la lista.
        setServices(prev => prev.map(s => s.id === deletingService.id ? { ...s, status: 'inactive' } : s))
        setNotice(res.data.message ?? `"${deletingService.name}" tenía turnos registrados, así que se desactivó en vez de eliminarse.`)
      } else {
        setServices(prev => prev.filter(s => s.id !== deletingService.id))
      }
    } catch {
      setError('Error al eliminar el servicio')
    } finally {
      setDeletingService(null)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.patch<{ service: AdminService }>(`/api/services/${id}/status`)
      setServices(prev => prev.map(s => s.id === id ? res.data.service : s))
    } catch {
      setError('Error al cambiar el estado')
    }
  }

  return (
    <div className="services-page">
      <div className="services-header">
        <div>
          <h1 className="services-title">Servicios</h1>
          <p className="services-subtitle">
            Lo que cargues acá aparece en la página principal y en la reserva de turnos
          </p>
        </div>
        <button onClick={openCreateForm} className="admin-button-primary">
          <Plus size={18} /> Nuevo servicio
        </button>
      </div>

      {error && <p className="services-error">{error}</p>}
      {notice && (
        <p style={{ color: '#8a6800', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '15px', fontWeight: 600, margin: 0 }}>
          {notice}
        </p>
      )}

      {loading ? (
        <p className="services-loading">Cargando servicios...</p>
      ) : (
        <ServiceList
          services={services}
          categories={SERVICE_CATEGORIES}
          onEdit={openEditForm}
          onDelete={requestDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {isFormOpen && (
        <ServiceFormModal
          service={editingService}
          categories={SERVICE_CATEGORIES}
          allServices={services}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {deletingService && (
        <ConfirmDeleteModal
          serviceName={deletingService.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingService(null)}
        />
      )}
    </div>
  )
}