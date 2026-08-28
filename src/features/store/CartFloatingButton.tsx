import { ShoppingCart } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useCart } from './CartContext'

// Único punto de entrada al carrito en toda la página — un cuadrado fijo del
// lado derecho de la pantalla que abre/cierra el panel lateral.
export function CartFloatingButton() {
  const { business } = useTenant()
  const { count, isOpen, toggle } = useCart()

  if (!business || count === 0) return null
  const { primaryColor } = business

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Cerrar carrito' : 'Abrir carrito'}
      className="fixed z-[302] flex items-center justify-center transition-all duration-200 hover:opacity-90"
      style={{
        top: '50%',
        right: isOpen ? '-100px' : '0',
        transform: 'translateY(-50%)',
        width: '52px',
        height: '52px',
        borderRadius: '12px 0 0 12px',
        backgroundColor: primaryColor,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <ShoppingCart size={22} color="#fff" />
      <span
        className="absolute -top-1.5 -left-1.5 flex items-center justify-center rounded-full text-white font-bold"
        style={{ width: '20px', height: '20px', fontSize: '11px', background: '#e53935' }}
      >
        {count}
      </span>
    </button>
  )
}
