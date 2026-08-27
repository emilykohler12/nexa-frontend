import { X, Clock, ChevronLeft } from 'lucide-react'

interface Service {
  id:          string
  name:        string
  description: string
  duration:    number
  price:       number
  image:       string | null
}

interface Props {
  service:      Service
  primaryColor: string
  accentColor:  string
  onClose:      () => void
  onReserve:    () => void
}

export function ServiceDetailModal({ service, primaryColor, accentColor, onClose, onReserve }: Props) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
        >
          <X size={18} />
        </button>
        <button
          onClick={onClose}
          aria-label="Volver"
          className="absolute top-3 left-3 z-10 sm:hidden w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="w-full h-56" style={{ background: `${primaryColor}10` }}>
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl" style={{ color: `${primaryColor}50` }}>✂️</div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            {service.name}
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
              <Clock size={15} /> {service.duration} min
            </span>
            <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
              ${service.price.toLocaleString('es-AR')}
            </span>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
            {service.description || 'Sin descripción cargada todavía.'}
          </p>

          <button
            onClick={onReserve}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            Reservar turno
          </button>
        </div>
      </div>
    </div>
  )
}
