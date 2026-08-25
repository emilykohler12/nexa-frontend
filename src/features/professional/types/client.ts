export interface ClientVisit {
  id:          string
  date:        string
  serviceName: string
  price:       number
  notes:       string
}

export interface ProfessionalClient {
  id:            string
  name:          string
  email:         string
  phone:         string
  photo:         string | null
  allergies:     string
  preferences:   string
  visits:        ClientVisit[]
  nextAppointment: string | null
  cancellations: number
}