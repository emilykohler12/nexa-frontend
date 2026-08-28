// src/features/client/booking/SpecialServiceBookingFlow.tsx
//
// Flujo de reserva para un "servicio especial": el cliente elige qué zonas
// y/o paquetes quiere (el precio/duración se arman con eso), y después elige
// uno de los horarios puntuales que el admin dejó configurados para el único
// día que existe este servicio — no hay paso de "elegir profesional", ya
// viene asignado por horario.
import { useState, useEffect } from 'react'
import { ChevronLeft, Check, Clock } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { Service } from './steps/ServiceStep'
import { PostBookingDetails } from './PostBookingDetails'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

type Phase = 'select' | 'datetime' | 'confirm' | 'details' | 'success'
interface PaymentSettings { depositAmount: number; depositPercent: boolean }

interface Props {
  service: Service
  onBack: () => void
  onSuccess: () => void
}

function computeDeposit(price: number, settings: PaymentSettings): number {
  if (settings.depositPercent) return Math.round((price * settings.depositAmount) / 100)
  return settings.depositAmount
}

export function SpecialServiceBookingFlow({ service: initialService, onBack, onSuccess }: Props) {
  const { business } = useTenant()
  const [service, setService] = useState(initialService)
  const [phase, setPhase] = useState<Phase>('select')
  const [zoneIds, setZoneIds]       = useState<string[]>([])
  const [packageIds, setPackageIds] = useState<string[]>([])
  const [slotTime, setSlotTime]     = useState<string | null>(null)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ settings: PaymentSettings }>('/api/business/payments/public')
      .then(res => setPaymentSettings(res.data.settings))
      .catch(() => setPaymentSettings(null))
  }, [])

  // Refresca los horarios (por si alguien reservó uno justo antes) al entrar
  // al paso de elegir horario.
  const refreshSlots = () => {
    api.get<{ services: Service[] }>('/api/services')
      .then(res => {
        const fresh = res.data.services.find(s => s.id === service.id)
        if (fresh) setService(fresh)
      })
      .catch(() => {})
  }

  if (!business) return null
  const { primaryColor, accentColor } = business

  const activeZones    = (service.zones ?? []).filter(z => z.active)
  const activePackages = (service.packages ?? []).filter(p => p.active)
  const activeSlots    = (service.specialSlots ?? []).filter(s => s.active && !s.booked)

  const toggleZone    = (id: string) => setZoneIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const togglePackage = (id: string) => setPackageIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const selectedZones    = activeZones.filter(z => zoneIds.includes(z.id))
  const selectedPackages = activePackages.filter(p => packageIds.includes(p.id))
  const totalPrice    = selectedZones.reduce((s, z) => s + z.price, 0) + selectedPackages.reduce((s, p) => s + p.price, 0)
  const totalDuration = selectedZones.reduce((s, z) => s + z.duration, 0) + selectedPackages.reduce((s, p) => s + p.duration, 0)
  const hasSelection = zoneIds.length > 0 || packageIds.length > 0

  const deposit = paymentSettings ? computeDeposit(totalPrice, paymentSettings) : 0
  const selectedSlot = activeSlots.find(s => s.time === slotTime)

  const handleSubmit = async () => {
    if (!slotTime) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post<{ appointment: { id: string } }>('/api/client/appointments/special', {
        serviceId: service.id,
        time: slotTime,
        zoneIds,
        packageIds,
      })
      setAppointmentId(res.data.appointment?.id ?? null)
      setPhase(res.data.appointment?.id ? 'details' : 'success')
    } catch (err: any) {
      const code = err?.response?.data?.code
      if (err?.response?.status === 409 && code === 'SLOT_TAKEN') {
        setError('Ese horario ya se ocupó. Elegí otro.')
        setSlotTime(null)
        setPhase('datetime')
        refreshSlots()
      } else {
        setError(safeErrorMessage(err, 'No pudimos confirmar la reserva. Intentá de nuevo.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const Header = ({ title, onBackClick }: { title: string; onBackClick: () => void }) => (
    <div>
      <button onClick={onBackClick} className="flex items-center gap-2 text-sm mb-4" style={{ color: '#999', fontFamily: 'var(--font-lato)' }}>
        <ChevronLeft size={16} /> Volver
      </button>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>{title}</h2>
    </div>
  )

  if (phase === 'select') {
    return (
      <div>
        <Header title={service.name} onBackClick={onBack} />
        <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Elegí las zonas y/o paquetes que querés — podés combinar los que quieras.
        </p>

        {activeZones.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>Zonas</p>
            <div className="flex flex-col gap-2">
              {activeZones.map(zone => {
                const selected = zoneIds.includes(zone.id)
                return (
                  <button
                    key={zone.id}
                    onClick={() => toggleZone(zone.id)}
                    className="flex items-center justify-between p-4 rounded-xl border text-left transition-all"
                    style={{ borderColor: selected ? primaryColor : '#e5e5e5', background: selected ? `${primaryColor}10` : 'white' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${selected ? primaryColor : '#ccc'}`, background: selected ? primaryColor : 'transparent' }}>
                        {selected && <Check size={12} color="white" />}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>{zone.name}</p>
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>{zone.duration} min</p>
                      </div>
                    </div>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>${zone.price.toLocaleString('es-AR')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activePackages.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>Paquetes</p>
            <div className="flex flex-col gap-2">
              {activePackages.map(pack => {
                const selected = packageIds.includes(pack.id)
                return (
                  <button
                    key={pack.id}
                    onClick={() => togglePackage(pack.id)}
                    className="flex items-center justify-between p-4 rounded-xl border text-left transition-all"
                    style={{ borderColor: selected ? primaryColor : '#e5e5e5', background: selected ? `${primaryColor}10` : 'white' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ border: `1.5px solid ${selected ? primaryColor : '#ccc'}`, background: selected ? primaryColor : 'transparent' }}>
                        {selected && <Check size={12} color="white" />}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>{pack.name}</p>
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>{pack.duration} min</p>
                      </div>
                    </div>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>${pack.price.toLocaleString('es-AR')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {hasSelection && (
          <div className="rounded-xl p-4 mb-6 flex items-center justify-between" style={{ background: '#f3f4f6' }}>
            <span className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>Total · {totalDuration} min</span>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>${totalPrice.toLocaleString('es-AR')}</span>
          </div>
        )}

        <button
          onClick={() => { refreshSlots(); setPhase('datetime') }}
          disabled={!hasSelection}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          Siguiente
        </button>
      </div>
    )
  }

  if (phase === 'datetime') {
    return (
      <div>
        <Header title="¿A qué hora?" onBackClick={() => setPhase('select')} />
        {service.specialDate && (
          <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
            Este servicio solo se ofrece el{' '}
            <strong>{new Date(service.specialDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>.
          </p>
        )}

        {error && (
          <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>{error}</p>
        )}

        {activeSlots.length === 0 ? (
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
            No quedan horarios disponibles para este servicio.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {activeSlots.map(slot => (
              <button
                key={slot.time}
                onClick={() => setSlotTime(slot.time)}
                className="flex flex-col items-center py-3 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: slotTime === slot.time ? primaryColor : '#f3f4f6', color: slotTime === slot.time ? 'white' : '#555', fontFamily: 'var(--font-lato)' }}
              >
                <span className="font-bold">{slot.time}</span>
                {slot.professionalName && (
                  <span className="text-xs" style={{ opacity: 0.85 }}>{slot.professionalName}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setPhase('confirm')}
          disabled={!slotTime}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          Siguiente
        </button>
      </div>
    )
  }

  if (phase === 'confirm') {
    return (
      <div>
        <Header title="Confirmá tu reserva" onBackClick={() => setPhase('datetime')} />
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-6" style={{ borderColor: '#f3f4f6' }}>
          <div className="flex flex-col gap-2 mb-4">
            {selectedZones.map(z => (
              <div key={z.id} className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
                <span className="text-gray-500">{z.name}</span>
                <span className="font-semibold">${z.price.toLocaleString('es-AR')}</span>
              </div>
            ))}
            {selectedPackages.map(p => (
              <div key={p.id} className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
                <span className="text-gray-500">{p.name}</span>
                <span className="font-semibold">${p.price.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm mb-3" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>
            <Clock size={14} />
            {service.specialDate && new Date(service.specialDate + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} a las {slotTime} · {totalDuration} min
            {selectedSlot?.professionalName && ` · ${selectedSlot.professionalName}`}
          </div>
          <div className="border-t pt-4 flex justify-between" style={{ borderColor: '#f3f3f3' }}>
            <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>Total</span>
            <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>${totalPrice.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>Seña a pagar ahora</span>
            <span className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>${deposit.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          {submitting ? 'Confirmando...' : `Pagar seña · $${deposit.toLocaleString('es-AR')}`}
        </button>
      </div>
    )
  }

  if (phase === 'details' && appointmentId) {
    return (
      <PostBookingDetails
        appointmentId={appointmentId}
        categoryId={service.categoryId}
        onDone={() => setPhase('success')}
        onCancel={() => setPhase('success')}
      />
    )
  }

  // success
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
        <Check size={28} color="#16a34a" />
      </div>
      <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>¡Turno reservado!</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
        Te esperamos {service.specialDate && new Date(service.specialDate + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} a las {slotTime}.
      </p>
      <button
        onClick={onSuccess}
        className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
        style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
      >
        Ver mis turnos
      </button>
    </div>
  )
}
