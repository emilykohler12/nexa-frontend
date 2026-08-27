import { CalendarClock } from 'lucide-react'

interface Props {
  title:       string
  message:     string
  buttonLabel?: string
  accentColor: string
  onClose:     () => void
}

// Modal informativo centrado con un solo botón — se cierra tocando el botón
// o tocando afuera. Para avisos que el usuario solo necesita reconocer.
export function InfoModal({ title, message, buttonLabel = 'Aceptar', accentColor, onClose }: Props) {
  return (
    <div
      onClick={onClose}
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
          style={{ background: `${accentColor}15` }}
        >
          <CalendarClock size={24} color={accentColor} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a1a' }}>{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: accentColor }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
