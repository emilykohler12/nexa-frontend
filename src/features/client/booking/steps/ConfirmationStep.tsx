import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api }        from '@/shared/utils/api'
import type { BookingSelection } from '../types'

interface Service {
  id:         string
  name:       string
  price:      number
  categoryId: string
}

interface Professional {
  id:   string
  name: string
}

interface PaymentSettings {
  depositAmount:  number
  depositPercent: boolean
}

export interface ConfirmedSummary {
  serviceId:        string
  categoryId:       string
  professionalId:   string
  date:             string
  serviceName:      string
  professionalName: string
  dateLabel:        string
  time:             string
  price:            number
  depositAmount:    number
}

interface Props {
  selection: BookingSelection
  onConfirm: (summary: ConfirmedSummary) => void
}

function computeDeposit(price: number, settings: PaymentSettings): number {
  if (settings.depositPercent) return Math.round((price * settings.depositAmount) / 100)
  return Math.min(settings.depositAmount, price)
}

export function ConfirmationStep({ selection, onConfirm }: Props) {
  const { business } = useTenant()
  const [service,      setService]      = useState<Service | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [loading,       setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<{ services: Service[] }>('/api/services'),
      api.get<{ professionals: Professional[] }>('/api/professional/public'),
      api.get<{ settings: PaymentSettings }>('/api/business/payments/public'),
    ])
      .then(([servicesRes, professionalsRes, paymentsRes]) => {
        setService(servicesRes.data.services.find(s => s.id === selection.serviceId) ?? null)
        setProfessional(professionalsRes.data.professionals.find(p => p.id === selection.professionalId) ?? null)
        setPaymentSettings(paymentsRes.data.settings)
      })
      .catch(() => {
        setService(null)
        setProfessional(null)
        setPaymentSettings(null)
      })
      .finally(() => setLoading(false))
  }, [selection.serviceId, selection.professionalId])

  if (!business) return null
  const { primaryColor, accentColor } = business

  const dateLabel = selection.date
    ? new Date(selection.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : undefined

  const deposit = service && paymentSettings ? computeDeposit(service.price, paymentSettings) : null

  const handleConfirm = () => {
    if (!service || !professional || !dateLabel || !selection.time || !selection.date || deposit === null) return
    onConfirm({
      serviceId:        service.id,
      categoryId:       service.categoryId,
      professionalId:   professional.id,
      date:             selection.date,
      serviceName:      service.name,
      professionalName: professional.name,
      dateLabel,
      time:              selection.time,
      price:             service.price,
      depositAmount:     deposit,
    })
  }

  return (
    <div>
      <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        Confirmá tu turno
      </h2>

      {loading ? (
        <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
          Cargando resumen...
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6" style={{ borderColor: '#f3f4f6' }}>
            <div className="flex flex-col gap-4">
              <Row label="Servicio" value={service?.name} primaryColor={primaryColor} />
              <Row label="Profesional" value={professional?.name} primaryColor={primaryColor} />
              <Row label="Fecha" value={dateLabel} primaryColor={primaryColor} />
              <Row label="Hora" value={selection.time ?? undefined} primaryColor={primaryColor} />
              <div className="border-t pt-4 flex justify-between" style={{ borderColor: '#f3f4f6' }}>
                <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                  {service ? `$${service.price.toLocaleString('es-AR')}` : '—'}
                </span>
              </div>
              {deposit !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>Seña a pagar ahora</span>
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                    ${deposit.toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(!service || !professional || deposit === null) && (
            <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>
              No pudimos recuperar los datos de tu selección. Volvé a los pasos anteriores e intentá de nuevo.
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!service || !professional || !dateLabel || !selection.time || deposit === null}
            className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            Confirmar reserva
          </button>
        </>
      )}
    </div>
  )
}

function Row({ label, value, primaryColor }: { label: string; value?: string; primaryColor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>{label}</span>
      <span className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>{value ?? '—'}</span>
    </div>
  )
}
