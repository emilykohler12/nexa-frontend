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
}
// La sección «Clientes» solo lista clientas con un turno finalizado con la profesional. La alergia del perfil puede venir
// vacía, null o ausente: si no hay, no se muestra nada.
