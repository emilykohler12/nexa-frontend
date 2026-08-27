export type PromotionType   = 'service' | 'product'
export type PromotionStatus = 'active' | 'inactive'

// discount: un solo ítem real con precio promocional (% o $ fijo, vía price/originalPrice).
// bundle: dos o más ítems reales vendidos juntos a un precio combo.
// buy_x_pay_y: un solo ítem real con oferta "llevás X, pagás Y" (2x1, 3x2, etc.).
export type PromotionKind = 'discount' | 'bundle' | 'buy_x_pay_y'

export interface PromotionItem {
  id:    string
  name:  string
  price: number
}

export interface Promotion {
  id:            string
  type:          PromotionType
  kind:          PromotionKind
  title:         string
  description:   string
  image:         string | null
  price:         number
  originalPrice: number | null
  status:        PromotionStatus
  // Servicios o productos reales a los que aplica la promo — obligatorio, así
  // "Reservar"/"Comprar" siempre apunta a algo que existe de verdad.
  items:         PromotionItem[]
  // Solo para kind: 'buy_x_pay_y' — ej. buyQty:3, payQty:2 = "3x2".
  buyQty:        number | null
  payQty:        number | null
  // Ventana de vigencia — fuera de este rango la promo no se muestra en el home.
  startDate:     string | null
  endDate:       string | null
}
