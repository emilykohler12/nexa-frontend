// src/shared/types/review.ts
//
// El puntaje (rating) siempre cuenta para el promedio que se muestra en el
// home apenas se envía — no necesita aprobación del admin. El mensaje escrito
// sí necesita que el admin lo apruebe desde Actividad antes de mostrarse en
// "Opiniones de clientes".
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id:             string
  clientId?:      string
  clientName:     string
  appointmentId:  string
  serviceName?:   string
  rating:         number
  message:        string | null
  status:         ReviewStatus
  createdAt:      string
}
