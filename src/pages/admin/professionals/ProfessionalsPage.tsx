import { useState, useEffect } from 'react'
import { UserPlus } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { ProfessionalCard }   from './ProfessionalCard'
import { ProfessionalDetail } from './ProfessionalDetail'
import { InviteModal }        from './InviteModal'
import type { AdminProfessional } from './types'
import './ProfessionalsPage.css'
import '@/shared/ui/admin/admin-controls.css'

export function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminProfessional | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const fetchProfessionals = () => {
    setLoading(true)
    setError(null)
    api.get<{ professionals: AdminProfessional[] }>('/api/professionals')
      .then(res => setProfessionals(res.data.professionals))
      .catch(() => setError('No se pudieron cargar los profesionales'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfessionals() }, [])

  const handleSave = (updated: AdminProfessional) => {
    setProfessionals(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelected(updated)
  }

  const handleToggleStatus = (id: string) => {
    api.patch(`/api/professionals/${id}/toggle-active`)
      .then(() => setProfessionals(prev =>
        prev.map(p => p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
        )
      ))
      .catch(() => setError('Error al cambiar el estado'))
  }

  const handleToggleRole = (id: string) => {
    api.patch(`/api/professionals/${id}/toggle-role`)
      .then(() => setProfessionals(prev =>
        prev.map(p => p.id === id
          ? { ...p, role: p.role === 'admin' ? 'professional' : 'admin' }
          : p
        )
      ))
      .catch(() => setError('Error al cambiar el rol'))
  }

  if (selected) {
    return (
      <ProfessionalDetail
        professional={selected}
        onBack={() => setSelected(null)}
        onSave={handleSave}
      />
    )
  }

  const activos   = professionals.filter(p => p.status === 'active')
  const inactivos = professionals.filter(p => p.status !== 'active')

  return (
    <div className="prof-page">
      <div className="prof-page-header">
        <div>
          <h1 className="prof-page-title">Profesionales</h1>
          <p className="prof-page-subtitle">
            Gestioná el equipo — los perfiles se crean cuando aceptan la invitación
          </p>
        </div>
        <button className="admin-button-primary" onClick={() => setShowInvite(true)}>
          <UserPlus size={18} />
          Invitar profesional
        </button>
      </div>

      {loading && <p className="prof-page-loading">Cargando profesionales...</p>}
      {error   && <p className="prof-page-error">{error}</p>}

      {!loading && !error && professionals.length === 0 && (
        <p className="prof-page-empty">
          Todavía no hay profesionales registrados. Enviá una invitación para empezar.
        </p>
      )}

      {activos.length > 0 && (
        <div>
          <p className="prof-section-label">Activos ({activos.length})</p>
          <div className="prof-grid">
            {activos.map(p => (
              <ProfessionalCard
                key={p.id}
                professional={p}
                onClick={() => setSelected(p)}
                onToggleStatus={handleToggleStatus}
                onToggleRole={handleToggleRole}
              />
            ))}
          </div>
        </div>
      )}

      {inactivos.length > 0 && (
        <div>
          <p className="prof-section-label">Inactivos / Vacaciones ({inactivos.length})</p>
          <div className="prof-grid">
            {inactivos.map(p => (
              <ProfessionalCard
                key={p.id}
                professional={p}
                onClick={() => setSelected(p)}
                onToggleStatus={handleToggleStatus}
                onToggleRole={handleToggleRole}
              />
            ))}
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInviteSent={fetchProfessionals}
        />
      )}
    </div>
  )
}