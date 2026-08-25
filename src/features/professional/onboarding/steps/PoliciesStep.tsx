// src/features/professional/onboarding/steps/PoliciesStep.tsx
import { useTenant } from '@/features/tenant/TenantContext'
import type { PolicyData, PaymentMethod } from '../types'
import './PoliciesStep.css'

interface Props {
  data: PolicyData
  onChange: (fields: Partial<PolicyData>) => void
}

// Mercado Pago eliminado — solo efectivo, transferencia y tarjeta
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',     label: 'Efectivo'      },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card',     label: 'Tarjeta'       },
]

export function PoliciesStep({ data, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'

  const togglePayment = (method: PaymentMethod) => {
    const current = data.paymentMethods
    const next = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method]
    onChange({ paymentMethods: next })
  }

  return (
    <div className="policies-step">

      <div className="policies-grid-2">
        <Field label="Tolerancia (minutos)">
          <input
            type="number" min={0} max={60}
            className="policies-input"
            value={data.toleranceMinutes}
            onChange={e => onChange({ toleranceMinutes: Number(e.target.value) })}
          />
        </Field>
        <Field label="Métodos de pago">
          <div className="policies-payment-row">
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePayment(opt.value)}
                className="policies-payment-btn"
                style={{
                  borderColor: data.paymentMethods.includes(opt.value) ? primary : '#e0e0e0',
                  background:  data.paymentMethods.includes(opt.value) ? `${primary}14` : '#fff',
                  color:       data.paymentMethods.includes(opt.value) ? primary : '#444',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Política de llegadas tarde">
        <Textarea value={data.latePenalty} onChange={v => onChange({ latePenalty: v })}
          placeholder="Ej: Si llegás más de 15 min tarde, el turno se reprograma..." primary={primary} />
      </Field>
      <Field label="Política de cancelación">
        <Textarea value={data.cancellationPolicy} onChange={v => onChange({ cancellationPolicy: v })}
          placeholder="Ej: Cancelaciones con al menos 24hs de anticipación..." primary={primary} />
      </Field>
      <Field label="Política de reprogramación">
        <Textarea value={data.reschedulePolicy} onChange={v => onChange({ reschedulePolicy: v })}
          placeholder="Ej: Reprogramaciones con 12hs de anticipación..." primary={primary} />
      </Field>
      <Field label="Política de señas">
        <Textarea value={data.depositPolicy} onChange={v => onChange({ depositPolicy: v })}
          placeholder="Ej: Se requiere seña del 50% para confirmar el turno..." primary={primary} />
      </Field>
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