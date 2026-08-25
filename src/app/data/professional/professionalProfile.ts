import type { ProfessionalProfile } from '@/features/professional/types/professional'

// Datos de ejemplo — reemplazar por fetch real al backend
export const mockProfessionalProfile: ProfessionalProfile = {
  id:              'prof-1',
  firstName:       'Lucía',
  lastName:        'Martínez',
  birthDate:       '1995-03-15',
  gender:          'female',
  phone:           '+54 376 401-1111',
  email:           'lucia@lorenestudio.com',
  dni:             null,
  photo:           null,
  bio:             'Especialista en cabello con más de 5 años de experiencia.',
  socials:         { instagram: 'https://instagram.com/lucia.hair', facebook: null, tiktok: null, twitter: null },
  specialty:       'Cabello',
  yearsExperience: 5,
  certifications:  [
    { id: 'c1', name: 'Colorimetría avanzada', issuer: 'Instituto Belleza Pro', year: 2022 },
    { id: 'c2', name: 'Técnicas de keratina', issuer: 'L\'Oréal Argentina', year: 2023 },
  ],
  languages:       ['Español'],
  joinedAt:        '2024-01-15',
  status:          'active',
  profileComplete: true,
  commissionPct:   20,
}