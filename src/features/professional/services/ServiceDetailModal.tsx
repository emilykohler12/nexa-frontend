// Detalle de un servicio de la profesional: toda la información del servicio y el interruptor para activarlo o
// desactivarlo. La tarjeta de la lista solo muestra nombre y precio.
import { X, Clock, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import type { CatalogService, AssignedStatus } from './types'

interface Props {
  service:       CatalogService
  categoryLabel: string
  status:        AssignedStatus
  primary:       string
  accent:        string
  onToggle:      () => void
  onClose:       () => void
}

export function ServiceDetailModal({ service, categoryLabel, status, primary, accent, onToggle, onClose }: Props) {
  const active = status === 'active'
  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal" role="dialog" aria-modal="true" aria-label={service.name} onClick={e => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2 className="service-modal-title">{service.name}</h2>
          <button className="service-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="service-modal-body" style={{ gap: '14px' }}>
          {service.image && (
            <img
              src={service.image}
              alt={service.name}
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }}
            />
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '14px', color: '#444' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Tag size={14} />{categoryLabel}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={14} />{service.duration} min</span>
          </div>

          {service.description && (
            <p style={{ margin: 0, fontSize: '15px', color: '#000', lineHeight: 1.5 }}>{service.description}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f9', borderRadius: '12px' }}>
            <span style={{ fontSize: '14px', color: '#000' }}>Precio</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: accent }}>${Number(service.price).toLocaleString('es-AR')}</span>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-pressed={active}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px', border: '1px solid #e8e8e8', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontSize: '15px', color: '#000' }}
          >
            <span>{active ? 'Lo ofrezco (activo)' : 'No lo ofrezco (inactivo)'}</span>
            <span style={{ color: active ? primary : '#ccc', display: 'inline-flex' }}>
              {active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </span>
          </button>
        </div>

        <div className="service-modal-footer">
          <button className="service-modal-btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
