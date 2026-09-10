// src/pages/public/PaymentResultPage.tsx
//
// A esta página vuelve el navegador después de pagar en Mercado Pago (los
// back_urls de la preferencia). No confirma nada por sí sola — la
// confirmación real pasa por el webhook y el polling de PaymentStep, en la
// pestaña original. Esta pantalla solo le dice a la clienta que puede volver.
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Check, X, Clock } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { business } = useTenant()
  const estado = params.get('estado')

  const config = {
    exito:      { Icon: Check, bg: '#dcfce7', color: '#16a34a', title: '¡Listo!', text: 'Ya podés volver a la otra pestaña — en unos segundos se va a confirmar solo.' },
    error:      { Icon: X,     bg: '#fee2e2', color: '#e53935', title: 'El pago no se completó', text: 'Volvé a la otra pestaña e intentá de nuevo.' },
    pendiente:  { Icon: Clock, bg: '#fef3c7', color: '#d97706', title: 'Pago pendiente', text: 'Mercado Pago todavía está procesando el pago. Volvé a la otra pestaña en unos minutos.' },
  } as const

  const { Icon, bg, color, title, text } = config[estado as keyof typeof config] ?? config.pendiente

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: bg }}>
        <Icon size={28} color={color} />
      </div>
      <h1 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: business?.primaryColor }}>
        {title}
      </h1>
      <p className="text-gray-500 mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
        {text}
      </p>
      <button
        onClick={() => navigate(ROUTES.HOME)}
        className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
        style={{ backgroundColor: business?.primaryColor, fontFamily: 'var(--font-lato)' }}
      >
        Ir al inicio
      </button>
    </div>
  )
}
