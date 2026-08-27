// src/shared/utils/promotionWindow.ts
//
// Una promo con startDate en el futuro todavía no arrancó, y una con endDate
// en el pasado ya terminó — en ninguno de los dos casos debe verse en el home.
// Defensivo: si el backend todavía no filtra esto server-side, al menos no
// se cuela una promo fuera de vigencia.
interface PromotionWindow {
  startDate: string | null
  endDate:   string | null
}

export function isPromotionLive(promo: PromotionWindow): boolean {
  const today = new Date().toISOString().split('T')[0]
  if (promo.startDate && promo.startDate > today) return false
  if (promo.endDate && promo.endDate < today) return false
  return true
}
