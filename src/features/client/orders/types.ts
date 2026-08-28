export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name:      string
  quantity:  number
  price:     number
  image:     string | null
}

export interface ClientOrder {
  id:            string
  items:         OrderItem[]
  total:         number
  delivery: {
    type:    'pickup' | 'delivery'
    address: string | null
  }
  phone:         string | null
  notes:         string | null
  paymentMethod: string | null
  status:        OrderStatus
  createdAt:     string
}
