//src/features/professional/types/professional.ts

export type ProfessionalStatus = 'active' | 'leave' | 'vacation' | 'suspended'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface SocialLinks {
  instagram: string | null
  facebook:  string | null
  tiktok:    string | null
  twitter:   string | null
}

export interface Certification {
  id:        string
  name:      string
  issuer:    string
  year:      number
}

export interface ProfessionalProfile {
  id:              string
  firstName:       string
  lastName:        string
  birthDate:       string | null
  gender:          Gender | null
  phone:           string
  email:           string
  dni:             string | null
  photo:           string | null
  bio:             string
  socials:         SocialLinks
  specialty:       string
  yearsExperience: number
  certifications:  Certification[]
  languages:       string[]
  joinedAt:        string
  status:          ProfessionalStatus
  profileComplete: boolean
  commissionPct:   number
}