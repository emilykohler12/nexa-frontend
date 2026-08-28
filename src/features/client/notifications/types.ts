export type ClientNotificationType =
  | 'new_service'
  | 'new_product'
  | 'new_promotion'
  | 'special_service'
  | 'appointment_reminder'
  | 'system'

export interface ClientNotification {
  id:        string
  type:      ClientNotificationType
  title:     string
  body:      string
  read:      boolean
  createdAt: string
  link:      string | null
}
