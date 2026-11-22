// src/features/professional/onboarding/steps/PoliciesStep.tsx
//
// La profesional solo carga las recomendaciones previas y los cuidados posteriores de su trabajo. Tolerancia, llegadas
// tarde, cancelación, reprogramación, seña y métodos de pago los define el administrador para todo el negocio.
import { useTenant } from '@/features/tenant/TenantContext'
import type { PolicyData } from '../types'
import './PoliciesStep.css'

interface Props {
  data: PolicyData
  onChange: (fields: Partial<PolicyData>) => void
}

export function PoliciesStep({ data, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'

  return (
    <div className="policies-step">
      <Field label="Recomendaciones previas">
        <Textarea value={data.priorRecommendations} onChange={v => onChange({ priorRecommendations: v })}
          placeholder="Ej: Venir con el cabello limpio y seco..." primary={primary} />
      </Field>
      <Field label="Cuidados posteriores">
        <Textarea value={data.afterCare} onChange={v => onChange({ afterCare: v })}
          placeholder="Ej: No lavar el cabello por 48hs..." primary={primary} />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="policies-field">
      <span className="policies-field-label">{label}</span>
      {children}
    </label>
  )
}

function Textarea({ value, onChange, placeholder, primary }: {
  value: string; onChange: (v: string) => void
  placeholder: string; primary: string
}) {
  return (
    <textarea
      className="policies-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={3}
      placeholder={placeholder}
      onFocus={e => (e.currentTarget.style.borderColor = primary)}
      onBlur={e => (e.currentTarget.style.borderColor = '#e0e0e0')}
    />
  )
}
