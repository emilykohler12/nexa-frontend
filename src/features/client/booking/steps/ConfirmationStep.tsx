import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api }        from '@/shared/utils/api'
import type { BookingSelection } from '../types'
import { ANY_PROFESSIONAL_ID } from './ProviderStep'

interface Service {
  id:          string
  name:        string
  price:       number
  categoryId:  string
  description: string
}

interface Professional {
  id:   string
  name: string
}

interface PaymentSettings {
  depositAmount:  number
  depositPercent: boolean
}

interface Promotion {
  id:    string
  price: number
  items: { id: string }[]
}

export interface ConfirmedSummary {
  serviceId:        string
  categoryId:       string
  professionalId:   string
  date:             string
  serviceName:      string
  serviceDescription: string
  professionalName: string
  dateLabel:        string
  time:             string
  price:            number
  originalPrice:    number | null
  depositAmount:    number
  promotionId:      string | null
}

interface Props {
  selection: BookingSelection
  onConfirm: (summary: ConfirmedSummary) => void
}

// La seña fija que configura el admin es siempre la misma, sin importar el
// precio del servicio — no se recorta al precio (eso hacía que un servicio
// de $0 mostrara una seña de $0 en vez de la seña real configurada).
function computeDeposit(price: number, settings: PaymentSettings): number {
  if (settings.depositPercent) return Math.round((price * settings.depositAmount) / 100)
  return settings.depositAmount
}

export function ConfirmationStep({ selection, onConfirm }: Props) {
  const { business } = useTenant()
  const [service,      setService]      = useState<Service | null>(null)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [promotion,     setPromotion]   = useState<Promotion | null>(null)
  const [loading,       setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<{ services: Service[] }>('/api/services'),
      api.get<{ professionals: Professional[] }>('/api/professional/public'),
      api.get<{ settings: PaymentSettings }>('/api/business/payments/public'),
      selection.promotionId
        ? api.get<{ promotions: Promotion[] }>('/api/promotions/public')
        : Promise.resolve({ data: { promotions: [] } }),
      // Solo para mostrar un nombre real en vez de "cualquier profesional
      // disponible" — la reserva sigue mandando el sentinel "any" al backend,
      // que vuelve a resolver quién queda asignado en el momento de crear el
      // turno (puede diferir de este preview si la carga cambió mientras tanto).
      selection.professionalId === ANY_PROFESSIONAL_ID && selection.serviceId
        ? api.get<{ professionalId: string; professionalName: string }>(`/api/services/${selection.serviceId}/preferred-professional`).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([servicesRes, professionalsRes, paymentsRes, promotionsRes, preferredRes]) => {
        setService(servicesRes.data.services.find(s => s.id === selection.serviceId) ?? null)
        setProfessional(
          selection.professionalId === ANY_PROFESSIONAL_ID
            ? { id: ANY_PROFESSIONAL_ID, name: preferredRes?.data.professionalName ?? 'Cualquier profesional disponible' }
            : professionalsRes.data.professionals.find(p => p.id === selection.professionalId) ?? null
        )
        setPaymentSettings(paymentsRes.data.settings)
        // Si la promo ya no está vigente o no corresponde a este servicio, se ignora
        // silenciosamente y se cobra el precio de lista — el backend la vuelve a
        // validar igual al confirmar, así que nunca se cuela un precio incorrecto.
        const promo = selection.promotionId
          ? promotionsRes.data.promotions.find(p => p.id === selection.promotionId && p.items[0]?.id === selection.serviceId) ?? null
          : null
        setPromotion(promo)
      })
      .catch(() => {
        setService(null)
        setProfessional(null)
        setPaymentSettings(null)
        setPromotion(null)
      })
      .finally(() => setLoading(false))
  }, [selection.serviceId, selection.professionalId, selection.promotionId])

  if (!business) return null
  const { primaryColor, accentColor } = business

  const dateLabel = selection.date
    ? new Date(selection.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : undefined

  const finalPrice = promotion ? promotion.price : service?.price ?? null
  const deposit = finalPrice !== null && paymentSettings ? computeDeposit(finalPrice, paymentSettings) : null

  const handleConfirm = () => {
    if (!service || !professional || !dateLabel || !selection.time || !selection.date || deposit === null || finalPrice === null) return
    onConfirm({
      serviceId:        service.id,
      categoryId:       service.categoryId,
      professionalId:   professional.id,
      date:             selection.date,
      serviceName:      service.name,
      serviceDescription: service.description ?? '',
      professionalName: professional.name,
      dateLabel,
      time:              selection.time,
      price:             finalPrice,
      originalPrice:     promotion ? service.price : null,
      depositAmount:     deposit,
      promotionId:       promotion ? promotion.id : null,
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
              <div className="border-t pt-4 flex justify-between items-end" style={{ borderColor: '#f3f4f6' }}>
                <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>Total</span>
                <div className="flex items-center gap-2">
                  {promotion && service && (
                    <span className="text-sm text-gray-400 line-through" style={{ fontFamily: 'var(--font-lato)' }}>
                      ${service.price.toLocaleString('es-AR')}
                    </span>
                  )}
                  <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
                    {finalPrice !== null ? `$${finalPrice.toLocaleString('es-AR')}` : '—'}
                  </span>
                </div>
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
