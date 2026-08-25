// src/features/professional/onboarding/steps/PersonalStep.tsx
import { useTenant }    from '@/features/tenant/TenantContext'
import type { PersonalData } from '../types'
import { PhotoUpload }  from '@/shared/ui/atoms/PhotoUpload'
import './PersonalStep.css'

interface Props {
  data:     PersonalData
  onChange: (fields: Partial<PersonalData>) => void
}

// Sin duplicados — un solo "Prefiero no decir" con su value correcto
const GENDER_OPTIONS = [
  { value: 'female',            label: 'Femenino'          },
  { value: 'male',              label: 'Masculino'         },
  { value: 'other',             label: 'Otro'              },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' },
]

export function PersonalStep({ data, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'

  return (
    <div className="personal-step">

      <Section title="Datos personales">
        <div className="personal-step-grid">
          <Field label="Nombre *">
            <input className="ps-input" value={data.firstName}
              onChange={e => onChange({ firstName: e.target.value })}
              placeholder="Tu nombre"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Apellido *">
            <input className="ps-input" value={data.lastName}
              onChange={e => onChange({ lastName: e.target.value })}
              placeholder="Tu apellido"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Fecha de nacimiento">
            <input className="ps-input" type="date" value={data.birthDate}
              onChange={e => onChange({ birthDate: e.target.value })}
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Género">
            <select
              className="ps-input"
              value={data.gender}
              onChange={e => onChange({ gender: e.target.value as PersonalData['gender'] })}
            >
              {/* Placeholder vacío — así no aparece ningún valor como "seleccionado" al abrir */}
              <option value="" disabled>Seleccioná</option>
              {GENDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Teléfono *">
            <input className="ps-input" value={data.phone}
              onChange={e => onChange({ phone: e.target.value })}
              placeholder="+54 376 ..."
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Email *">
            <input className="ps-input" type="email" value={data.email}
              onChange={e => onChange({ email: e.target.value })}
              placeholder="tu@email.com"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="DNI">
            <input className="ps-input" value={data.dni}
              onChange={e => onChange({ dni: e.target.value })}
              placeholder="12.345.678"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <div className="ps-photo-wrap">
            <PhotoUpload value={data.photo} onChange={v => onChange({ photo: v })} primary={primary} size={90} />
          </div>
        </div>
        <Field label="Biografía / Descripción">
          <textarea className="ps-input ps-textarea" value={data.bio} rows={3}
            onChange={e => onChange({ bio: e.target.value })}
            placeholder="Contale algo a tus clientes sobre vos..."
            onFocus={e => e.currentTarget.style.borderColor = primary}
            onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
        </Field>
      </Section>

      <Section title="Redes sociales">
        <div className="personal-step-grid">
          <Field label="Instagram">
            <input className="ps-input" value={data.instagram}
              onChange={e => onChange({ instagram: e.target.value })}
              placeholder="https://instagram.com/tu_perfil"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Facebook">
            <input className="ps-input" value={data.facebook}
              onChange={e => onChange({ facebook: e.target.value })}
              placeholder="https://facebook.com/tu_pagina"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="TikTok">
            <input className="ps-input" value={data.tiktok}
              onChange={e => onChange({ tiktok: e.target.value })}
              placeholder="https://tiktok.com/@tu_perfil"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
          <Field label="Twitter / X">
            <input className="ps-input" value={data.twitter}
              onChange={e => onChange({ twitter: e.target.value })}
              placeholder="https://x.com/tu_usuario"
              onFocus={e => e.currentTarget.style.borderColor = primary}
              onBlur={e => e.currentTarget.style.borderColor = '#e0e0e0'} />
          </Field>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ps-section">
      <p className="ps-section-title">{title}</p>
      <div className="ps-section-body">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="ps-field">
      <span className="ps-field-label">{label}</span>
      {children}
    </label>
  )
}