//src/features/professional/onboarding/steps/ConfirmationStep.tsx

import { useTenant } from '@/features/tenant/TenantContext'
import { WEEK_DAYS, WEEK_DAY_LABEL, generateSlots } from '../types'
import type { OnboardingData } from '../types'

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', mp: 'Mercado Pago',
}

interface Props { data: OnboardingData }

export function ConfirmationStep({ data }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'
  const accent  = business?.accentColor  ?? '#d4af37'
  const services = business?.services ?? []

  const activeDays = WEEK_DAYS.filter(d => data.availability[d].length > 0)
  const getName = (id: string) => services.find(s => s.id === id)?.name ?? id

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#fafafa', border: '1px solid #eeeeee', borderRadius: '12px', padding: '16px' }}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  )

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontSize: '16px', color: '#666', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{value}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ background: `${primary}10`, border: `1px solid ${primary}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '20px', fontWeight: 700, color: primary, margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>¡Todo listo para guardar!</p>
        <p style={{ fontSize: '15px', color: '#888', margin: '4px 0 0' }}>Revisá el resumen antes de confirmar.</p>
      </div>

      <Section title="Datos personales">
        <Row label="Nombre" value={data.personal.name || '—'} />
        <Row label="Especialidad" value={data.work.specialty || '—'} />
        <Row label="Experiencia" value={`${data.work.yearsExperience} años`} />
        <Row label="Teléfono" value={data.personal.phone || '—'} />
      </Section>

      <Section title={`Servicios (${data.services.length})`}>
        {data.services.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: '16px', margin: 0 }}>Sin servicios seleccionados</p>
        ) : data.services.map(s => (
          <div key={s.serviceId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: '16px', color: '#333', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{getName(s.serviceId)}</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: accent, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>${s.ownPrice.toLocaleString('es-AR')}</span>
          </div>
        ))}
      </Section>

      <Section title={`Disponibilidad (${activeDays.length} días)`}>
        {activeDays.length === 0 ? (
          <p style={{ color: '#e53935', fontSize: '16px', margin: 0 }}>No configuraste ningún día</p>
        ) : activeDays.map(day => {
          const ranges = data.availability[day]
          const totalSlots = ranges.reduce((sum, r) => sum + generateSlots(r).length, 0)
          return (
            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '16px', color: '#333', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{WEEK_DAY_LABEL[day]}</span>
              <span style={{ fontSize: '15px', color: '#888', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {ranges.map(r => `${r.start}—${r.end}`).join(', ')} · {totalSlots} turnos
              </span>
            </div>
          )
        })}
      </Section>

      <Section title="Métodos de pago">
        <p style={{ margin: 0, fontSize: '16px', color: '#333', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          {data.policies.paymentMethods.map(m => PAYMENT_LABEL[m]).join(', ') || '—'}
        </p>
      </Section>
    </div>
  )
}