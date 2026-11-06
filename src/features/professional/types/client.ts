export interface ClientVisit {
  id:             string
  date:           string
  serviceName:    string
  price:          number
  notes:          string
  status?:        string
  internalNotes?: string | null
}

export interface ProfessionalClient {
  id:            string
  name:          string
  email:         string
  phone:         string
  photo:         string | null
  allergies?:    string | null
  preferences:   string
  observations:  string
  visits:        ClientVisit[]
  nextAppointment: string | null
  cancellations: number
}
// La alergia del perfil solo llega si la profesional atendió a la clienta (turno finalizado):
// puede venir vacía, null o ausente.
export const NO_ALLERGY_INFO =
  'Sin alergias para mostrar. La alergia del perfil de la clienta se ve recién después de un turno finalizado con ella; la que anotó en un turno aparece en ese turno.'
