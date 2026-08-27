// src/features/professional/onboarding/OnboardingWizard.tsx
import { useState }    from 'react'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useTenant }   from '@/features/tenant/TenantContext'
import { useAuth }     from '@/features/auth/AuthContext'
import { api }         from '@/shared/utils/api'
import { PersonalStep }    from './steps/PersonalStep'
import { WorkStep }        from './steps/WorkStep'
import { ScheduleStep }    from './steps/ScheduleStep'
import { ServicesStep }    from './steps/ServicesStep'
import { PoliciesStep }    from './steps/PoliciesStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import {
  EMPTY_AVAILABILITY, EMPTY_PERSONAL, EMPTY_WORK, EMPTY_POLICIES,
} from './types'
import type { OnboardingData, PersonalData } from './types'
import './OnboardingWizard.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const STEPS = [
  { id: 'personal',     label: 'Perfil'      },
  { id: 'work',         label: 'Experiencia' },
  { id: 'schedule',     label: 'Horarios'    },
  { id: 'services',     label: 'Servicios'   },
  { id: 'policies',     label: 'Políticas'   },
  { id: 'confirmation', label: 'Confirmar'   },
]

interface Props {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: Props) {
  const { business } = useTenant()
  const { user }     = useAuth()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [data, setData]       = useState<OnboardingData>({
    personal: {
      ...EMPTY_PERSONAL,
      name:   user?.name  ?? '',
      email:  user?.email ?? '',
      phone:  user?.phone ?? '',
      gender: (user?.gender as PersonalData['gender']) ?? '',
    },
    work:         EMPTY_WORK,
    availability: EMPTY_AVAILABILITY,
    services:     [],
    policies:     EMPTY_POLICIES,
  })

  if (!business) return null
  const { primaryColor, accentColor } = business
  const isLast = step === STEPS.length - 1

  const validate = (): string | null => {
    if (step === 0 && (!data.personal.name || !data.personal.phone))
      return 'Completá tu nombre y teléfono.'
    if (step === 1 && !data.work.specialty)
      return 'Ingresá tu especialidad principal.'
    if (step === 2) {
      const active = Object.values(data.availability).some(ranges => ranges.length > 0)
      if (!active) return 'Activá al menos un día de trabajo.'
    }
    return null
  }

  const next = () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  const back = () => { setError(null); setStep(s => s - 1) }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/professional/onboarding', {
        // Si no eligió género, no mandamos la clave — el backend espera un
        // enum válido o directamente ausente, nunca un string vacío.
        personal:     { ...data.personal, gender: data.personal.gender || undefined },
        work:         data.work,
        availability: data.availability,
        services:     data.services,
        policies:     data.policies,
      })
      onComplete()
    } catch (err: any) {
      setError(safeErrorMessage(err, 'Error al guardar. Intentá de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0: return <PersonalStep data={data.personal} onChange={f => setData(d => ({ ...d, personal: { ...d.personal, ...f } }))} />
      case 1: return <WorkStep data={data.work} onChange={f => setData(d => ({ ...d, work: { ...d.work, ...f } }))} />
      case 2: return <ScheduleStep availability={data.availability} onChange={a => setData(d => ({ ...d, availability: a }))} />
      case 3: return <ServicesStep selected={data.services} onChange={s => setData(d => ({ ...d, services: s }))} />
      case 4: return <PoliciesStep data={data.policies} onChange={f => setData(d => ({ ...d, policies: { ...d.policies, ...f } }))} />
      case 5: return <ConfirmationStep data={data} />
      default: return null
    }
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-header-top">
            <div>
              <h2 className="onboarding-title">¡Bienvenida al sistema!</h2>
              <p className="onboarding-subtitle">Completá tu perfil para empezar a recibir turnos</p>
            </div>
            <span className="onboarding-counter" style={{ background: `${primaryColor}18`, color: primaryColor }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>

          <div className="onboarding-steps">
            {STEPS.map((s, i) => (
              <div key={s.id} className="onboarding-step-item">
                <div className="onboarding-step-bar" style={{
                  background: i < step ? primaryColor : i === step ? accentColor : '#e5e5e5',
                }} />
                <p className="onboarding-step-label" style={{
                  color:      i === step ? primaryColor : '#888',
                  fontWeight: i === step ? 700 : 400,
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="onboarding-content">
          {renderStep()}
          {error && <div className="onboarding-error">{error}</div>}
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <button
            onClick={back}
            disabled={step === 0}
            className="onboarding-btn-back"
          >
            <ChevronLeft size={17} /> Atrás
          </button>

          {isLast ? (
            <button onClick={handleSave} disabled={loading} className="onboarding-btn-primary"
              style={{ background: primaryColor }}>
              {loading
                ? <><Loader2 size={17} className="animate-spin" /> Guardando...</>
                : <><Check size={17} /> Guardar y continuar</>}
            </button>
          ) : (
            <button onClick={next} className="onboarding-btn-primary"
              style={{ background: primaryColor }}>
              Continuar <ChevronRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}