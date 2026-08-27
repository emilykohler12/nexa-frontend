import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  productId:    string
  name:         string
  price:        number
  image:        string | null
  quantity:     number
  // Si esta línea viene de una promo (combo o Nx M), mandamos el id de la
  // promo al backend — así puede validar que sigue vigente y aplicar su
  // precio real en vez de recalcular todo desde el catálogo sin descuento.
  promotionId?: string | null
}

interface CartContextValue {
  items:       CartItem[]
  addItem:     (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem:  (productId: string, promotionId?: string | null) => void
  setQuantity: (productId: string, quantity: number, promotionId?: string | null) => void
  clear:       () => void
  total:       number
  count:       number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'nexa_cart'

// Dos líneas son "la misma" solo si son el mismo producto Y la misma promo
// (o ninguna) — así un producto a precio normal y ese mismo producto dentro
// de un combo no se mezclan en una sola línea con un precio ambiguo.
const lineKey = (productId: string, promotionId?: string | null) => `${productId}::${promotionId ?? ''}`

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* almacenamiento no disponible */ }
  }, [items])

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems(prev => {
      const key = lineKey(item.productId, item.promotionId)
      const existing = prev.find(i => lineKey(i.productId, i.promotionId) === key)
      if (existing) {
        return prev.map(i => lineKey(i.productId, i.promotionId) === key ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeItem = (productId: string, promotionId?: string | null) => {
    const key = lineKey(productId, promotionId)
    setItems(prev => prev.filter(i => lineKey(i.productId, i.promotionId) !== key))
  }

  const setQuantity = (productId: string, quantity: number, promotionId?: string | null) => {
    if (quantity <= 0) { removeItem(productId, promotionId); return }
    const key = lineKey(productId, promotionId)
    setItems(prev => prev.map(i => lineKey(i.productId, i.promotionId) === key ? { ...i, quantity } : i))
  }

  const clear = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
