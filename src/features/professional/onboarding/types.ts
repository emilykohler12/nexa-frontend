//src/features/professional/onboarding/types.ts

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export const WEEK_DAYS: WeekDay[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export const WEEK_DAY_LABEL: Record<WeekDay, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
}

export interface DayRange {
  start: string
  end: string
}

// Varios rangos por día para poder dejar huecos (ej: 08–12 y 14–20 con un
// bloque sin turnos entre las 12 y las 14). Día libre = array vacío.
export type WeeklyAvailability = Record<WeekDay, DayRange[]>

export const EMPTY_AVAILABILITY: WeeklyAvailability = {
  monday: [], tuesday: [], wednesday: [], thursday: [],
  friday: [], saturday: [], sunday: [],
}

export const SLOT_DURATION_MINUTES = 120

export function generateSlots(range: DayRange): string[] {
  const slots: string[] = []
  const [sh, sm] = range.start.split(':').map(Number)
  const [eh, em] = range.end.split(':').map(Number)
  let current = sh * 60 + sm
  const end = eh * 60 + em
  while (current + SLOT_DURATION_MINUTES <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += SLOT_DURATION_MINUTES
  }
  return slots
}

// Valida las franjas antes de enviarlas: el backend responde 400 VALIDATION_ERROR si el inicio no
// es menor al fin o si falta una hora. Devuelve el mensaje del primer problema o null si está bien.
// Las horas son texto «HH:MM», así que comparar como texto es correcto (no se usa Date).
export function validateAvailability(availability: WeeklyAvailability): string | null {
  for (const day of WEEK_DAYS) {
    for (const range of availability[day]) {
      if (!range.start || !range.end) {
        return `${WEEK_DAY_LABEL[day]}: completá la hora de inicio y la de fin.`
      }
      if (range.start >= range.end) {
        return `${WEEK_DAY_LABEL[day]}: la hora de inicio tiene que ser anterior a la de fin.`
      }
    }
  }
  return null
}

export type Gender ='male' | 'female' | 'other' | 'prefer_not_to_say'
export type ProfessionalStatus = 'active' | 'leave' | 'vacation' | 'suspended'
export type CommissionType = 'earned' | 'to_owner'
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mp'

export interface PersonalData {
  name:            string
  gender:          Gender | ''
  phone:           string
  email:           string
  photo:           string | null
  bio:             string
  instagram:       string
  facebook:        string
  tiktok:          string
  twitter:         string
}

export interface WorkData {
  specialty:       string
  yearsExperience: number
  certifications:  string
  languages:       string
}

export interface SelectedService {
  serviceId:  string
  ownPrice:   number
  ownDuration: number
}

export interface PolicyData {
  toleranceMinutes:    number
  latePenalty:         string
  cancellationPolicy:  string
  reschedulePolicy:    string
  depositPolicy:       string
  paymentMethods:      PaymentMethod[]
  priorRecommendations: string
  afterCare:           string
}

export interface OnboardingData {
  personal:     PersonalData
  work:         WorkData
  availability: WeeklyAvailability
  services:     SelectedService[]
  policies:     PolicyData
}

export const EMPTY_PERSONAL: PersonalData = {
  name: '', gender: '',
  phone: '', email: '', photo: null, bio: '',
  instagram: '', facebook: '', tiktok: '', twitter: '',
}

export const EMPTY_WORK: WorkData = {
  specialty: '', yearsExperience: 0, certifications: '', languages: 'Español',
}

export const EMPTY_POLICIES: PolicyData = {
  toleranceMinutes: 15, latePenalty: '',
  cancellationPolicy: '', reschedulePolicy: '',
  depositPolicy: '', paymentMethods: ['cash', 'transfer'],
  priorRecommendations: '', afterCare: '',
}