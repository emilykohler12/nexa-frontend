import { AlertTriangle } from 'lucide-react'

interface Props {
  title:         string
  message:       string
  confirmLabel?: string
  cancelLabel?:  string
  danger?:       boolean
  accentColor:   string
  loading?:      boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export function ConfirmModal({
  title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  danger = true, accentColor, loading = false, onConfirm, onCancel,
}: Props) {
  const color = danger ? '#e53935' : accentColor

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
        style={{ fontFamily: 'var(--font-lato)' }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `${color}15` }}
        >
          <AlertTriangle size={24} color={color} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a1a' }}>{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: '#f3f4f6', color: '#555' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: color }}
          >
            {loading ? 'Un momento...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
