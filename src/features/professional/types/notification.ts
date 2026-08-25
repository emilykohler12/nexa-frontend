export type NotificationType =
  | 'new_appointment'
  | 'cancelled_appointment'
  | 'rescheduled_appointment'
  | 'new_message'
  | 'payment_confirmed'
  | 'reminder'
  | 'admin_change'
  | 'system'

export interface ProfessionalNotification {
  id:        string
  type:      NotificationType
  title:     string
  body:      string
  read:      boolean
  createdAt: string
  link:      string | null
}