import { formatCurrency } from '@/shared/utils/format'
import type { AdminProfessional } from './types'
import './ProfessionalCard.css'   // ← cambio aquí

const STATUS_LABELS: Record<string, string> = {
  active:   'Activo',
  inactive: 'Inactivo',
  vacation: 'Vacaciones',
}

interface Props {
  professional: AdminProfessional
  onClick: () => void
  onToggleStatus: (id: string) => void
  onToggleRole: (id: string) => void
}

export function ProfessionalCard({ professional: p, onClick, onToggleStatus, onToggleRole }: Props) {
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const handleAction = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation()
    fn()
  }

  return (
    <div className="prof-card">
      <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="prof-card-header">
          <div className="prof-avatar">
            {p.photo ? <img src={p.photo} alt={p.name} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <p className="prof-card-name">{p.name}</p>
              {p.role === 'admin' && <span className="role-badge">Admin</span>}
            </div>
            <p className="prof-card-specialty">{p.specialty}</p>
          </div>
          <span className={`status-badge ${p.status}`}>{STATUS_LABELS[p.status]}</span>
        </div>

        <div className="prof-card-metrics">
          <div className="prof-metric">
            <span className="prof-metric-value">{p.metrics.totalAppointments}</span>
            <span className="prof-metric-label">Turnos totales</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric-value">{p.metrics.totalClients}</span>
            <span className="prof-metric-label">Clientes</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric-value">{formatCurrency(p.metrics.totalRevenue)}</span>
            <span className="prof-metric-label">Facturación total</span>
          </div>
          <div className="prof-metric">
            <span className="prof-metric-value">⭐ {p.metrics.rating}</span>
            <span className="prof-metric-label">Valoración</span>
          </div>
        </div>
      </div>

      <div className="prof-card-actions">
        <button
          type="button"
          className="prof-quick-btn primary"
          onClick={e => handleAction(e, () => onToggleRole(p.id))}
        >
          {p.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
        </button>
        <button
          type="button"
          className={`prof-quick-btn ${p.status === 'active' ? 'danger' : 'primary'}`}
          onClick={e => handleAction(e, () => onToggleStatus(p.id))}
          disabled={p.status === 'vacation'}
          title={p.status === 'vacation' ? 'Está de vacaciones — cambiarlo desde el perfil' : undefined}
          style={p.status === 'vacation' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
        >
          {p.status === 'active' ? 'Desactivar' : p.status === 'vacation' ? 'De vacaciones' : 'Activar'}
        </button>
      </div>
    </div>
  )
}