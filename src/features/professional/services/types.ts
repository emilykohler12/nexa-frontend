// src/features/professional/services/types.ts

export interface CatalogService {
  id:          string
  name:        string
  categoryId:  string
  description: string
  duration:    number
  price:       number
  image:       string | null
  status:      string
}

export type AssignedStatus = 'active' | 'inactive'

export interface AssignedService {
  serviceId: string
  status:    AssignedStatus
}
