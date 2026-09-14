// src/app/data/admin/promotions/specialEventTypes.ts
//
// Evento especial destacado en el home (ej: jornada de Depilación definitiva
// con una profesional puntual) — a diferencia de las campañas automáticas,
// esto SÍ se muestra en la página principal.

export interface SpecialEvent {
  id:          string
  date:        string
  title:       string | null
  description: string | null
  active:      boolean
  createdAt:   string
  service: {
    id:          string
    name:        string
    description: string
    price:       number
    duration:    number
    image:       string | null
  }
  professional: {
    id:        string
    name:      string
    photo:     string | null
    specialty: string | null
  }
}

export interface SpecialEventFormValues {
  serviceId:      string
  professionalId: string
  date:           string
  title:          string
  description:    string
  active:         boolean
}
