import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Props {
  message:   string
  type?:     ToastType
  onClose:   () => void
  duration?: number
}

const TONE: Record<ToastType, { bg: string; fg: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: '#16a34a', fg: '#fff', Icon: CheckCircle2 },
  error:   { bg: '#e53935', fg: '#fff', Icon: XCircle      },
  info:    { bg: '#069494', fg: '#fff', Icon: Info          },
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  const { bg, fg, Icon } = TONE[type]

  return (
    <div
      className="fixed bottom-6 right-6 z-[500] flex items-start gap-3 rounded-2xl px-5 py-4 shadow-2xl animate-in"
      style={{
        background: bg,
        color: fg,
        maxWidth: '360px',
        fontFamily: 'var(--font-lato)',
        animation: 'nexa-toast-in 0.25s ease-out',
      }}
      role="status"
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button onClick={onClose} aria-label="Cerrar" className="flex-shrink-0 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
      <style>{`
        @keyframes nexa-toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
