//src/pages/admin/services/ConfirmDeleteModal.tsx
import './services.css'

interface Props {
  serviceName: string
  onConfirm:   () => void
  onCancel:    () => void
}

export function ConfirmDeleteModal({ serviceName, onConfirm, onCancel }: Props) {
  return (
    <div className="service-modal-overlay" onClick={onCancel}>
      <div className="service-modal service-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="service-confirm-title">¿Eliminar servicio?</h2>
        <p className="service-confirm-text">
          Vas a eliminar <strong>{serviceName}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="service-form-actions">
          <button type="button" className="admin-button-secondary" onClick={onCancel}>Cancelar</button>
          <button type="button" className="admin-button-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}
