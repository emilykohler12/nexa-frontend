import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, Store, Truck, Check, QrCode, Link2, CreditCard, LogIn, ShoppingBag, ArrowRight } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { useCart } from './CartContext'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { PENDING_CART_CHECKOUT_KEY } from '@/shared/utils/pendingCheckout'

type DeliveryType = 'pickup' | 'delivery'
type PaymentMethod = 'qr' | 'link' | 'card'
type Phase = 'cart' | 'payment' | 'success'

// Panel lateral del carrito — vive montado una sola vez a nivel de página y
// se abre/cierra según el estado global del carrito (CartContext), no según
// si algún componente en particular lo montó.
export function CartDrawer() {
  const { business } = useTenant()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const {
    items, removeItem, setQuantity, clear, total,
    isOpen, close, showFirstAddPrompt, dismissFirstAddPrompt,
  } = useCart()

  const [phase, setPhase] = useState<Phase>('cart')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [address, setAddress] = useState('')
  const [phone, setPhone]     = useState(user?.phone ?? '')
  const [notes, setNotes]     = useState('')
  const [method, setMethod]   = useState<PaymentMethod>('qr')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  if (!business) return null
  const { primaryColor, accentColor, contactInfo, name: businessName } = business

  const canContinue = items.length > 0 && (deliveryType === 'pickup' || address.trim().length > 0)

  const handleGoToLogin = () => {
    try { sessionStorage.setItem(PENDING_CART_CHECKOUT_KEY, '1') } catch { /* almacenamiento no disponible */ }
    close()
    navigate(ROUTES.LOGIN)
  }

  const handleConfirmPayment = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/api/client/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, promotionId: i.promotionId ?? null })),
        delivery: {
          type: deliveryType,
          address: deliveryType === 'delivery' ? address.trim() : null,
        },
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        paymentMethod: method,
      })
      clear()
      setPhase('success')
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo confirmar el pedido. Intentá de nuevo.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={close}
        className="fixed inset-0 z-[300] transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.5)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Panel lateral */}
      <div
        className="fixed top-0 right-0 h-full z-[301] w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
        role="dialog"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: '#f0f0f0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            {phase === 'success' ? '¡Pedido confirmado!' : phase === 'payment' ? 'Pagá tu pedido' : 'Tu carrito'}
          </h2>
          <button onClick={close} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showFirstAddPrompt && phase === 'cart' ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${primaryColor}12` }}>
                <ShoppingBag size={28} color={primaryColor} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                ¡Agregado al carrito!
              </h3>
              <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: 'var(--font-lato)' }}>
                ¿Querés ir a pagar ahora o seguir viendo más productos?
              </p>
              <div className="w-full flex flex-col gap-2 px-2">
                <button
                  onClick={dismissFirstAddPrompt}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
                >
                  Ir a pagar <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => { dismissFirstAddPrompt(); close() }}
                  className="w-full py-3.5 rounded-xl font-semibold transition-all"
                  style={{ background: '#f3f4f6', color: '#555', fontFamily: 'var(--font-lato)' }}
                >
                  Seguir viendo
                </button>
              </div>
            </div>
          ) : phase === 'success' ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
                <Check size={28} color="#16a34a" />
              </div>
              <p className="text-gray-500 mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
                {deliveryType === 'pickup'
                  ? 'Te esperamos en el local para retirar tu pedido.'
                  : 'Vamos a coordinar la entrega a la dirección que dejaste.'}
              </p>
              <button
                onClick={() => { close(); setPhase('cart') }}
                className="px-6 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
              >
                Cerrar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
              Todavía no agregaste productos.
            </div>
          ) : phase === 'payment' ? (
            <div className="p-5 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'var(--font-lato)' }}>Total a pagar</p>
                <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                  ${total.toLocaleString('es-AR')}
                </p>
              </div>

              <div className="flex gap-2">
                {([
                  { id: 'qr' as PaymentMethod,   label: 'QR',      Icon: QrCode     },
                  { id: 'link' as PaymentMethod, label: 'Link',    Icon: Link2      },
                  { id: 'card' as PaymentMethod, label: 'Tarjeta', Icon: CreditCard },
                ]).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: method === id ? primaryColor : '#f3f4f6',
                      color: method === id ? 'white' : '#555',
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              {method === 'qr' && (
                <div className="text-center">
                  <div
                    className="w-40 h-40 mx-auto rounded-xl flex items-center justify-center mb-3"
                    style={{ background: '#f3f4f6', border: '1px solid #e5e5e5' }}
                  >
                    <QrCode size={90} color="#999" />
                  </div>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
                    Escaneá el código con tu billetera virtual o app del banco.
                  </p>
                </div>
              )}

              {method === 'link' && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
                    Te generamos un link de pago único para completar la compra.
                  </p>
                  <div
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl"
                    style={{ background: '#f3f4f6', fontFamily: 'var(--font-lato)' }}
                  >
                    <span className="text-sm text-gray-500 truncate">pago.{businessName?.toLowerCase().replace(/\s+/g, '-') ?? 'nexa'}.com/pedido/...</span>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Número de tarjeta" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }} />
                  <div className="flex gap-3">
                    <input type="text" placeholder="MM/AA" className="flex-1 px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }} />
                    <input type="text" placeholder="CVV" className="flex-1 px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }} />
                  </div>
                  <input type="text" placeholder="Nombre del titular" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }} />
                </div>
              )}

              {error && (
                <p className="text-sm text-center" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setPhase('cart')}
                  disabled={submitting}
                  className="px-5 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#f3f4f6', color: '#555', fontFamily: 'var(--font-lato)' }}
                >
                  Atrás
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
                >
                  {submitting ? 'Procesando pago...' : `Pagar $${total.toLocaleString('es-AR')}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                {items.map(item => (
                  <div key={`${item.productId}::${item.promotionId ?? ''}`} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: `${primaryColor}10` }}>
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span>🛍️</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>{item.name}</p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>${item.price.toLocaleString('es-AR')} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(item.productId, item.quantity - 1, item.promotionId)} className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: '#e5e5e5' }}>
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm" style={{ fontFamily: 'var(--font-lato)' }}>{item.quantity}</span>
                      <button onClick={() => setQuantity(item.productId, item.quantity + 1, item.promotionId)} className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: '#e5e5e5' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.promotionId)} aria-label="Quitar" className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: '#f0f0f0' }}>
                <span className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>¿Cómo lo recibís?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: deliveryType === 'pickup' ? primaryColor : '#f3f4f6', color: deliveryType === 'pickup' ? 'white' : '#555', fontFamily: 'var(--font-lato)' }}
                  >
                    <Store size={15} /> Retiro en el local
                  </button>
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: deliveryType === 'delivery' ? primaryColor : '#f3f4f6', color: deliveryType === 'delivery' ? 'white' : '#555', fontFamily: 'var(--font-lato)' }}
                  >
                    <Truck size={15} /> Envío a domicilio
                  </button>
                </div>

                {deliveryType === 'pickup' ? (
                  contactInfo.address && (
                    <p className="text-sm text-gray-500 mt-3" style={{ fontFamily: 'var(--font-lato)' }}>
                      Retirás en: <strong>{contactInfo.address}</strong>
                    </p>
                  )
                ) : (
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Dirección de entrega"
                    className="w-full px-4 py-3 rounded-xl border outline-none mt-3"
                    style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>Teléfono de contacto</p>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Para coordinar la entrega"
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
                />
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>Notas (opcional)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Algo que debamos saber sobre tu pedido..."
                  className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                  style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
                />
              </div>

              {!isAuthenticated || user?.role !== 'client' ? (
                <button
                  onClick={handleGoToLogin}
                  disabled={!canContinue}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
                >
                  <LogIn size={16} /> Iniciá sesión para continuar
                </button>
              ) : (
                <button
                  onClick={() => setPhase('payment')}
                  disabled={!canContinue}
                  className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
                >
                  Continuar al pago · ${total.toLocaleString('es-AR')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
