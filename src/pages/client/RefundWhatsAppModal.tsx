// src/pages/client/RefundWhatsAppModal.tsx
//
// No hay reembolso automático por Mercado Pago — cuando una cancelación
// cae dentro del plazo que configuró el admin (Configuración > Pagos >
// Cancelaciones y reembolsos), el negocio devuelve la seña a mano. Este
// aviso le dice al cliente que escriba por WhatsApp para coordinarlo.
import { MessageCircle } from 'lucide-react'

interface Props {
  whatsapp:    string
  accentColor: string
  onClose:     () => void
}

export function RefundWhatsAppModal({ whatsapp, accentColor, onClose }: Props) {
  const message = 'Hola! Cancelé un turno dentro del plazo permitido y me corresponde la devolución de la seña. ¿Me ayudan a coordinarla?'
  const waLink  = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`

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
          style={{ background: '#25D36615' }}
        >
          <MessageCircle size={24} color="#25D366" />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a1a' }}>
          Te corresponde la devolución de la seña
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Cancelaste dentro del plazo permitido. Escribinos por WhatsApp para coordinar cómo te devolvemos la seña.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 mb-2"
          style={{ background: '#25D366' }}
        >
          <MessageCircle size={16} /> Contactar por WhatsApp
        </a>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ color: accentColor }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
