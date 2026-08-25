// src/features/professional/onboarding/steps/WorkStep.tsx
import { useTenant } from '@/features/tenant/TenantContext'
import type { WorkData } from '../types'
import './WorkStep.css'

interface Props {
  data: WorkData
  onChange: (fields: Partial<WorkData>) => void
}

export function WorkStep({ data, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'

  return (
    <div className="work-step">
      <div className="work-step-grid">
        <Field label="Especialidad principal *">
          <input
            className="work-input"
            value={data.specialty}
            onChange={e => onChange({ specialty: e.target.value })}
            placeholder="Ej: Cabello, Uñas, Estética..."
            onFocus={e => e.currentTarget.style.borderColor = primary}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </Field>
        <Field label="Años de experiencia">
          <input
            className="work-input"
            type="number" min={0} max={50}
            value={data.yearsExperience}
            onChange={e => onChange({ yearsExperience: Number(e.target.value) })}
            onFocus={e => e.currentTarget.style.borderColor = primary}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
        </Field>
      </div>

      <Field label="Idiomas que hablás" hint="Separados por coma">
        <input
          className="work-input"
          value={data.languages}
          onChange={e => onChange({ languages: e.target.value })}
          placeholder="Español, Inglés..."
          onFocus={e => e.currentTarget.style.borderColor = primary}
          onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
      </Field>

      <Field label="Certificaciones y cursos" hint="Una por línea">
        <textarea
          className="work-input work-textarea"
          value={data.certifications}
          onChange={e => onChange({ certifications: e.target.value })}
          rows={4}
          placeholder={"Ej: Colorimetría avanzada — L'Oréal (2022)\nKeratina profesional — Instituto Belleza (2023)"}
          onFocus={e => e.currentTarget.style.borderColor = primary}
          onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'}
        />
      </Field>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="work-field">
      <span className="work-field-label">{label}</span>
      {children}
      {hint && <span className="work-field-hint">{hint}</span>}
    </label>
  )
}