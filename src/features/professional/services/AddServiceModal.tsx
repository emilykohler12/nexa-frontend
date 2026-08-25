// src/features/professional/services/AddServiceModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { CatalogService } from './types'

interface Props {
  catalog:       CatalogService[]
  assignedIds:   string[]
  primary:       string
  onClose:       () => void
  onSave:        (selectedIds: string[]) => void
}

export function AddServiceModal({ catalog, assignedIds, primary, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>(assignedIds)

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal" onClick={e => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2 className="service-modal-title">Agregar servicio</h2>
          <button className="service-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="service-modal-body">
          {catalog.length === 0 ? (
            <p className="service-modal-empty">El negocio todavía no cargó servicios.</p>
          ) : (
            catalog.map(service => {
              const checked = selected.includes(service.id)
              return (
                <label
                  key={service.id}
                  className="service-modal-item"
                  style={{ borderColor: checked ? primary : '#eee', background: checked ? `${primary}08` : '#fff' }}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggle(service.id)} />
                  <div>
                    <p className="service-modal-item-name">{service.name}</p>
                    <p className="service-modal-item-meta">
                      {service.duration} min · ${Number(service.price).toLocaleString('es-AR')}
                    </p>
                  </div>
                </label>
              )
            })
          )}
        </div>

        <div className="service-modal-footer">
          <button className="service-modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="service-modal-btn-save"
            style={{ background: primary }}
            onClick={() => onSave(selected)}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
