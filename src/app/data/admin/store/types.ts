export type ProductStatus  = 'active' | 'inactive' | 'out_of_stock'
export type OrderStatus    = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus  = 'pending' | 'paid' | 'refunded'
export type MovementType   = 'entry' | 'exit'

export interface StoreProduct {
  id: string; name: string; brand: string; category: string; description: string
  imageUrl: string | null; price: number; stock: number; minStock: number; status: ProductStatus
}

export interface InventoryMovement {
  id: string; productId: string; productName: string
  type: MovementType; quantity: number; note: string; date: string
}

export interface StoreOrder {
  id: string; clientName: string; clientEmail: string
  status: OrderStatus; paymentStatus: PaymentStatus; total: number; date: string
  items: { productName: string; quantity: number; price: number }[]
}