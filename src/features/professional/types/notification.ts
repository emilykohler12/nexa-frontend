export type NotificationType =
  | 'new_appointment'
  | 'cancelled_appointment'
  | 'rescheduled_appointment'

export interface ProfessionalNotification {
  id:        string
  type:      NotificationType
  title:     string
  body:      string
  read:      boolean
  createdAt: string
  link:      string | null
}