// src/app/data/admin/promotions/autoPromotionTypes.ts
//
// Campañas automáticas (cumpleaños, turno N, etc.) — NUNCA se muestran en el
// home. Son reglas que el admin prende/apaga; un job diario las evalúa por
// cliente y manda el mail si corresponde.

export type AutoPromotionTrigger  = 'birthday' | 'appointment_milestone'
export type AutoPromotionDiscount = 'percent' | 'fixed'
export type AutoPromotionAudience = 'all' | 'manual' | 'category'

export interface AutoPromotion {
  id:                 string
  name:               string
  trigger:            AutoPromotionTrigger
  // birthday: { daysBefore } — cuántos días antes se manda (0 = el mismo día).
  // appointment_milestone: { count } — a qué turno número del cliente dispara.
  triggerConfig:      Record<string, number>
  discountType:       AutoPromotionDiscount
  discountValue:      number
  message:            string
  audienceType:       AutoPromotionAudience
  audienceClientIds:  string[]
  audienceCategoryId: string | null
  active:             boolean
  createdAt:          string
}

export type AutoPromotionFormValues = Omit<AutoPromotion, 'id' | 'createdAt'>
