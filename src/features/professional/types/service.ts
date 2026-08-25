export type ServiceStatus = 'active' | 'inactive'

export interface PriceExtra {
  id:    string
  label: string
  price: number
}

export interface ProfessionalService {
  id:              string
  categoryId:      string
  categoryName:    string
  name:            string
  description:     string
  basePrice:       number
  duration:        number
  minAdvanceHours: number
  maxAdvanceDays:  number
  extras:          PriceExtra[]
  photos:          string[]
  status:          ServiceStatus
}