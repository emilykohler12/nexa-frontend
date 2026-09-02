// src/features/client/booking/PaymentStep.tsx
//
// NOTA: no existe pasarela de pago real — el botón "pagar" de cada método
// no cobra nada real, solo simula el pago. Sí crea un turno real en la base
// de datos (POST /api/client/appointments) al completarse el pago simulado.
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Link2, CreditCard, Check, Clock } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ConfirmedSummary } from './steps/ConfirmationStep'
import { PostBookingDetails } from './PostBookingDetails'
import { ANY_PROFESSIONAL_ID } from './steps/ProviderStep'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { ROUTES } from '@/app/config/routes.config'

const HOLD_MINUTES = 15

type Method = 'qr' | 'link' | 'card'
type Phase  = 'paying' | 'processing' | 'details' | 'success' | 'expired' | 'slotTaken'

interface Props {
  summary:   ConfirmedSummary
  onExpire:  () => void
  onSuccess: () => void
}

export function PaymentStep({ summary, onExpire, onSuccess }: Props) {
  const { business } = useTenant()
  const [method, setMethod]     = useState<Method>('qr')
  const [phase,  setPhase]      = useState<Phase>('paying')
  const [secondsLeft, setSecondsLeft] = useState(HOLD_MINUTES * 60)
  const [payError, setPayError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [assignedProfessionalId, setAssignedProfessionalId]     = useState<string | null>(null)
  const [assignedProfessionalName, setAssignedProfessionalName] = useState<string | null>(null)
  const [careInfo, setCareInfo] = useState<{ priorRecommendations: string | null; afterCare: string | null } | null>(null)
  const deadlineRef = useRef(Date.now() + HOLD_MINUTES * 60 * 1000)

  useEffect(() => {
    if (phase !== 'paying') return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        setPhase('expired')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Si el POST no devolvió un id (contrato viejo del backend), no podemos
  // mandar los detalles extra — saltamos directo a la confirmación.
  useEffect(() => {
    if (phase === 'details' && !appointmentId) setPhase('success')
  }, [phase, appointmentId])

  // Si reservó con "Cualquiera" y el POST no devolvió quién quedó asignado
  // (contrato viejo del backend), lo buscamos en la lista de turnos del
  // cliente — nunca debería quedar mostrando "Cualquier profesional disponible".
  useEffect(() => {
    if (phase !== 'success' || summary.professionalId !== ANY_PROFESSIONAL_ID || assignedProfessionalName || !appointmentId) return
    api.get<{ appointments: { id: string; professionalId?: string; professionalName?: string }[] }>('/api/client/appointments')
      .then(res => {
        const appt = res.data.appointments.find(a => a.id === appointmentId)
        if (appt?.professionalName) setAssignedProfessionalName(appt.professionalName)
        if (appt?.professionalId)   setAssignedProfessionalId(appt.professionalId)
      })
      .catch(() => {})
  }, [phase, appointmentId])

  // Al llegar a éxito, traemos las recomendaciones/cuidados que cargó el
  // profesional para mostrárselas al cliente junto con la confirmación.
  useEffect(() => {
    if (phase !== 'success') return
    const proId = assignedProfessionalId ?? summary.professionalId
    if (!proId || proId === ANY_PROFESSIONAL_ID) return
    api.get<{ professionals: { id: string; priorRecommendations?: string | null; afterCare?: string | null }[] }>('/api/professional/public')
      .then(res => {
        const pro = res.data.professionals.find(p => p.id === proId)
        if (pro && (pro.priorRecommendations || pro.afterCare)) {
          setCareInfo({ priorRecommendations: pro.priorRecommendations ?? null, afterCare: pro.afterCare ?? null })
        }
      })
      .catch(() => {})
  }, [phase])

  if (!business) return null
  const { primaryColor, accentColor } = business

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const urgent = secondsLeft <= 120

  const handlePay = () => {
    if (!termsAccepted) {
      setTermsError(true)
      return
    }
    setTermsError(false)
    setPhase('processing')
    setPayError(null)
    setTimeout(async () => {
      try {
        const res = await api.post<{ appointment: { id: string; professionalId?: string; professionalName?: string } }>('/api/client/appointments', {
          serviceId:      summary.serviceId,
          professionalId: summary.professionalId,
          date:           summary.date,
          time:           summary.time,
          termsAccepted:  true,
        })
        setAppointmentId(res.data.appointment?.id ?? null)
        // Si se reservó con "Cualquiera", el backend ya asignó un profesional real.
        if (summary.professionalId === ANY_PROFESSIONAL_ID) {
          if (res.data.appointment?.professionalName) setAssignedProfessionalName(res.data.appointment.professionalName)
          if (res.data.appointment?.professionalId)   setAssignedProfessionalId(res.data.appointment.professionalId)
        }
        setPhase('details')
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (err?.response?.status === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
          setPhase('slotTaken')
        } else {
          setPayError(safeErrorMessage(err, 'No pudimos confirmar el turno. Intentá de nuevo.'))
          setPhase('paying')
        }
      }
    }, 1200)
  }

  if (phase === 'expired') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
          <Clock size={28} color="#e53935" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          Se acabó el tiempo
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Pasaron los {HOLD_MINUTES} minutos para pagar la seña, así que liberamos el horario y tu turno no quedó reservado. Podés elegir otro horario y volver a intentar.
        </p>
        <button
          onClick={onExpire}
          className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          Elegir otro horario
        </button>
      </div>
    )
  }

  if (phase === 'slotTaken') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
          <Clock size={28} color="#e53935" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          Ese horario ya se ocupó
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Alguien reservó el mismo horario justo antes que vos. Elegí otro horario disponible para tu turno.
        </p>
        <button
          onClick={onExpire}
          className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          Elegir otro horario
        </button>
      </div>
    )
  }

  if (phase === 'details' && appointmentId) {
    return (
      <PostBookingDetails
        appointmentId={appointmentId}
        categoryId={summary.categoryId}
        onDone={() => setPhase('success')}
        onCancel={() => setPhase('success')}
      />
    )
  }

  if (phase === 'success') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
          <Check size={28} color="#16a34a" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          ¡Turno reservado!
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Te esperamos el {summary.dateLabel} a las {summary.time} para tu turno de {summary.serviceName} con {assignedProfessionalName ?? summary.professionalName}.
        </p>

        {careInfo && (careInfo.priorRecommendations || careInfo.afterCare) && (
          <div className="text-left max-w-md mx-auto mb-6 flex flex-col gap-4">
            {careInfo.priorRecommendations && (
              <div className="rounded-xl p-4" style={{ background: '#f3f4f6' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                  Antes de tu turno
                </p>
                <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#333', lineHeight: 1.5 }}>
                  {careInfo.priorRecommendations}
                </p>
              </div>
            )}
            {careInfo.afterCare && (
              <div className="rounded-xl p-4" style={{ background: '#f3f4f6' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                  Cuidados posteriores
                </p>
                <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#333', lineHeight: 1.5 }}>
                  {careInfo.afterCare}
                </p>
              </div>
            )}
          </div>
        )}

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

  return (
    <div>
      <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        Pagá la seña para confirmar
      </h2>
      <p className="text-sm text-gray-500 mb-5" style={{ fontFamily: 'var(--font-lato)' }}>
        {summary.serviceName} con {summary.professionalName} · {summary.dateLabel} a las {summary.time}
      </p>

      {/* Countdown */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
        style={{ background: urgent ? '#fee2e2' : '#f3f4f6' }}
      >
        <Clock size={18} color={urgent ? '#e53935' : '#666'} />
        <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: urgent ? '#c33' : '#555' }}>
          Tenés <strong>{timeLabel}</strong> para completar el pago. Si no pagás a tiempo, el horario se libera automáticamente y el turno no queda confirmado.
        </p>
      </div>

      {/* Monto */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: 'var(--font-lato)' }}>Seña a pagar</p>
        <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-cormorant)', color: accentColor }}>
          ${summary.depositAmount.toLocaleString('es-AR')}
        </p>
        <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
          Se descuenta del total del servicio (${summary.price.toLocaleString('es-AR')}) el día de tu turno.
        </p>
      </div>

      {payError && (
        <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>
          {payError}
        </p>
      )}

      {/* Métodos de pago */}
      <div className="flex gap-2 mb-5">
        {([
          { id: 'qr' as Method,   label: 'QR',      Icon: QrCode     },
          { id: 'link' as Method, label: 'Link',    Icon: Link2      },
          { id: 'card' as Method, label: 'Tarjeta',  Icon: CreditCard },
        ]).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: method === id ? primaryColor : '#f3f4f6',
              color: method === id ? 'white' : '#555',
              fontFamily: 'var(--font-lato)',
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {method === 'qr' && (
        <div className="text-center mb-6">
          <div
            className="w-44 h-44 mx-auto rounded-xl flex items-center justify-center mb-3"
            style={{ background: '#f3f4f6', border: '1px solid #e5e5e5' }}
          >
            <QrCode size={100} color="#999" />
          </div>
          <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
            Escaneá el código con tu billetera virtual o app del banco.
          </p>
        </div>
      )}

      {method === 'link' && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
            Te generamos un link de pago único para completar la seña.
          </p>
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl mb-2"
            style={{ background: '#f3f4f6', fontFamily: 'var(--font-lato)' }}
          >
            <span className="text-sm text-gray-500 truncate">pago.{business.name?.toLowerCase().replace(/\s+/g, '-') ?? 'nexa'}.com/sena/...</span>
          </div>
        </div>
      )}

      {method === 'card' && (
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Número de tarjeta"
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="MM/AA"
              className="flex-1 px-4 py-3 rounded-xl border outline-none"
              style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
            />
            <input
              type="text"
              placeholder="CVV"
              className="flex-1 px-4 py-3 rounded-xl border outline-none"
              style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
            />
          </div>
          <input
            type="text"
            placeholder="Nombre del titular"
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)' }}
          />
        </div>
      )}

      {/* Términos y Política de Privacidad — RF-06.01 */}
      <label className="flex items-start gap-2 mb-3 text-sm cursor-pointer" style={{ fontFamily: 'var(--font-lato)' }}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked) setTermsError(false) }}
          disabled={phase === 'processing'}
          className="mt-0.5"
        />
        <span style={{ color: '#555' }}>
          Acepto los Términos de Servicio y la{' '}
          <Link to={ROUTES.PRIVACY_POLICY} target="_blank" rel="noopener noreferrer" className="underline">
            Política de Privacidad
          </Link>.
        </span>
      </label>
      {termsError && (
        <p className="text-sm mb-3" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>
          Tenés que aceptar los Términos y la Política de Privacidad para confirmar la reserva.
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={phase === 'processing'}
        className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
      >
        {phase === 'processing' ? 'Procesando pago...' : `Pagar $${summary.depositAmount.toLocaleString('es-AR')}`}
      </button>
    </div>
  )
}
