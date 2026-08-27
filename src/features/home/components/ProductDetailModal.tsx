import { useState } from 'react'
import { X, ChevronLeft, Minus, Plus } from 'lucide-react'

interface Product {
  id:       string
  name:     string
  brand:    string
  category: string
  imageUrl: string | null
  price:    number
  description?: string | null
}

interface Props {
  product:      Product
  primaryColor: string
  accentColor:  string
  onClose:      () => void
  onAddToCart:  (quantity: number) => void
}

export function ProductDetailModal({ product, primaryColor, accentColor, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart(quantity)
    setAdded(true)
    setTimeout(onClose, 700)
  }

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

        <div className="w-full h-56 flex items-center justify-center" style={{ background: `${primaryColor}10` }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl" style={{ color: `${primaryColor}50` }}>🛍️</span>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            {product.name}
          </h2>
          {product.brand && (
            <p className="text-sm text-gray-400 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>{product.brand}</p>
          )}

          <span className="text-2xl font-bold block mb-4" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
            ${product.price.toLocaleString('es-AR')}
          </span>

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
            {product.description || 'Sin descripción cargada todavía.'}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{ borderColor: '#e5e5e5' }}
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-semibold" style={{ fontFamily: 'var(--font-lato)' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{ borderColor: '#e5e5e5' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: added ? accentColor : primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
