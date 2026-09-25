// src/features/client/booking/PaymentStep.tsx
//
// Pasarela real de Mercado Pago (Checkout Pro), con credenciales de PRUEBA
// por ahora — ver MERCADOPAGO_ACCESS_TOKEN en el backend. El turno se crea
// con paymentStatus 'pending' y solo pasa a 'partial' (seña pagada) cuando
// llega el webhook de Mercado Pago confirmando el pago real — nunca antes.
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, RefreshCw, Check, Clock, MapPin, Info, Shield, MessageCircle } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ConfirmedSummary } from './steps/ConfirmationStep'
import { PostBookingDetails } from './PostBookingDetails'
import { ANY_PROFESSIONAL_ID } from './steps/ProviderStep'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { ROUTES } from '@/app/config/routes.config'

const HOLD_MINUTES = 15
const POLL_MS = 5000

type Phase = 'paying' | 'processing' | 'waitingPayment' | 'details' | 'success' | 'expired' | 'slotTaken'

interface Props {
  summary:   ConfirmedSummary
  onExpire:  () => void
  onSuccess: () => void
}

export function PaymentStep({ summary, onExpire, onSuccess }: Props) {
  const { business } = useTenant()
  const [phase,  setPhase]      = useState<Phase>('paying')
  const [secondsLeft, setSecondsLeft] = useState(HOLD_MINUTES * 60)
  const [payError, setPayError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [assignedProfessionalId, setAssignedProfessionalId]     = useState<string | null>(null)
  const [assignedProfessionalName, setAssignedProfessionalName] = useState<string | null>(null)
  const [careInfo, setCareInfo] = useState<{ priorRecommendations: string | null; afterCare: string | null } | null>(null)
  const [proPolicies, setProPolicies] = useState<{
    toleranceMinutes: number | null; latePenalty: string | null
    cancellationPolicy: string | null; reschedulePolicy: string | null; depositPolicy: string | null
  } | null>(null)
  const deadlineRef = useRef(Date.now() + HOLD_MINUTES * 60 * 1000)

  useEffect(() => {
    if (phase !== 'paying' && phase !== 'waitingPayment') return
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

  // Al llegar a éxito, traemos las recomendaciones/cuidados y las políticas
  // que cargó el profesional, para mostrárselas al cliente junto con la
  // confirmación (ubicación, qué incluye el servicio, políticas del profesional).
  useEffect(() => {
    if (phase !== 'success') return
    const proId = assignedProfessionalId ?? summary.professionalId
    if (!proId || proId === ANY_PROFESSIONAL_ID) return
    api.get<{ professionals: {
      id: string
      priorRecommendations?: string | null; afterCare?: string | null
      toleranceMinutes?: number | null; latePenalty?: string | null
      cancellationPolicy?: string | null; reschedulePolicy?: string | null; depositPolicy?: string | null
    }[] }>('/api/professional/public')
      .then(res => {
        const pro = res.data.professionals.find(p => p.id === proId)
        if (!pro) return
        if (pro.priorRecommendations || pro.afterCare) {
          setCareInfo({ priorRecommendations: pro.priorRecommendations ?? null, afterCare: pro.afterCare ?? null })
        }
        if (pro.latePenalty || pro.cancellationPolicy || pro.reschedulePolicy || pro.depositPolicy || pro.toleranceMinutes) {
          setProPolicies({
            toleranceMinutes:   pro.toleranceMinutes   ?? null,
            latePenalty:        pro.latePenalty        ?? null,
            cancellationPolicy: pro.cancellationPolicy ?? null,
            reschedulePolicy:   pro.reschedulePolicy   ?? null,
            depositPolicy:      pro.depositPolicy      ?? null,
          })
        }
      })
      .catch(() => {})
  }, [phase])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const urgent = secondsLeft <= 120

  // Crea el turno (queda 'pending' de pago) y de inmediato le pide a Mercado
  // Pago el checkout de esa seña. El pago en sí pasa en la pestaña de
  // Mercado Pago, no acá — por eso después pasamos a 'waitingPayment' en vez
  // de a 'details' directo.
  const handlePay = () => {
    if (!termsAccepted) {
      setTermsError(true)
      return
    }
    setTermsError(false)
    setPhase('processing')
    setPayError(null)
    ;(async () => {
      try {
        const res = await api.post<{ appointment: { id: string; professionalId?: string; professionalName?: string } }>('/api/client/appointments', {
          serviceId:      summary.serviceId,
          professionalId: summary.professionalId,
          date:           summary.date,
          time:           summary.time,
          termsAccepted:  true,
          promotionId:    summary.promotionId,
        })
        const newAppointmentId = res.data.appointment?.id ?? null
        setAppointmentId(newAppointmentId)
        // Si se reservó con "Cualquiera", el backend ya asignó un profesional real.
        if (summary.professionalId === ANY_PROFESSIONAL_ID) {
          if (res.data.appointment?.professionalName) setAssignedProfessionalName(res.data.appointment.professionalName)
          if (res.data.appointment?.professionalId)   setAssignedProfessionalId(res.data.appointment.professionalId)
        }

        if (!newAppointmentId) { setPhase('details'); return }

        const pref = await api.post<{ checkoutUrl: string }>(`/api/client/appointments/${newAppointmentId}/payment`)
        window.open(pref.data.checkoutUrl, '_blank', 'noopener,noreferrer')
        setPhase('waitingPayment')
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (err?.response?.status === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
          setPhase('slotTaken')
        } else {
          setPayError(safeErrorMessage(err, 'No pudimos iniciar el pago. Intentá de nuevo.'))
          setPhase('paying')
        }
      }
    })()
  }

  // Alternativa a Mercado Pago: el turno se guarda YA (sin que el admin tenga
  // que cargar nada antes), pero la seña queda 'pending' hasta que el admin la
  // marque paga a mano — ver registerWhatsappDepositPaid en el backend. Por
  // eso salta directo a 'details', nunca pasa por 'waitingPayment'.
  const handlePayViaWhatsapp = () => {
    if (!termsAccepted) {
      setTermsError(true)
      return
    }
    setTermsError(false)
    setPhase('processing')
    setPayError(null)
    ;(async () => {
      try {
        const res = await api.post<{ appointment: { id: string; professionalId?: string; professionalName?: string } }>('/api/client/appointments', {
          serviceId:      summary.serviceId,
          professionalId: summary.professionalId,
          date:           summary.date,
          time:           summary.time,
          termsAccepted:  true,
          promotionId:    summary.promotionId,
          depositMethod:  'whatsapp',
        })
        const newAppointmentId = res.data.appointment?.id ?? null
        setAppointmentId(newAppointmentId)
        if (summary.professionalId === ANY_PROFESSIONAL_ID) {
          if (res.data.appointment?.professionalName) setAssignedProfessionalName(res.data.appointment.professionalName)
          if (res.data.appointment?.professionalId)   setAssignedProfessionalId(res.data.appointment.professionalId)
        }

        if (whatsapp) {
          const proName = res.data.appointment?.professionalName ?? summary.professionalName
          const message = `Hola! Reservé el turno de ${summary.serviceName} con ${proName} para el ${summary.dateLabel} a las ${summary.time} y quiero coordinar el pago de la seña ($${summary.depositAmount.toLocaleString('es-AR')}) por este medio.`
          window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
        }

        setPhase(newAppointmentId ? 'details' : 'success')
      } catch (err: any) {
        const code = err?.response?.data?.code
        if (err?.response?.status === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
          setPhase('slotTaken')
        } else {
          setPayError(safeErrorMessage(err, 'No pudimos reservar el turno. Intentá de nuevo.'))
          setPhase('paying')
        }
      }
    })()
  }

  // El pago real se confirma por webhook en el backend, no en esta pestaña —
  // así que preguntamos cada unos segundos si ya se acreditó. También hay un
  // botón manual para el caso de que el usuario vuelva antes de que dispare
  // el polling.
  const checkPaymentStatus = async () => {
    if (!appointmentId) return
    setCheckingPayment(true)
    try {
      // Le pregunta al backend que a su vez le pregunta a Mercado Pago — no
      // depende de que el webhook haya llegado.
      const res = await api.post<{ paymentStatus: string }>(`/api/client/appointments/${appointmentId}/verify-payment`)
      if (res.data.paymentStatus === 'partial') setPhase('details')
    } catch {
      // silencioso — es un chequeo de fondo, no queremos tapar la pantalla de espera con un error
    } finally {
      setCheckingPayment(false)
    }
  }

  useEffect(() => {
    if (phase !== 'waitingPayment') return
    const interval = setInterval(checkPaymentStatus, POLL_MS)
    return () => clearInterval(interval)
  }, [phase, appointmentId])

  // Guard después de todos los hooks — mantiene el orden de hooks estable
  // aunque el tenant todavía no haya cargado.
  if (!business) return null
  const { primaryColor, accentColor, contactInfo, ubicacion, whatsapp } = business

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

  if (phase === 'waitingPayment') {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f3f4f6' }}>
          <Clock size={28} color="#666" />
        </div>
        <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
          Esperando la confirmación del pago
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-2" style={{ fontFamily: 'var(--font-lato)' }}>
          Se abrió una pestaña nueva con el checkout de Mercado Pago. Completá el pago ahí — apenas se confirme, esta pantalla avanza sola.
        </p>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 my-6 max-w-md mx-auto"
          style={{ background: urgent ? '#fee2e2' : '#f3f4f6' }}
        >
          <Clock size={18} color={urgent ? '#e53935' : '#666'} />
          <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: urgent ? '#c33' : '#555' }}>
            Tenés <strong>{timeLabel}</strong> para completarlo antes de que se libere el horario.
          </p>
        </div>
        <button
          onClick={checkPaymentStatus}
          disabled={checkingPayment}
          className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          <RefreshCw size={16} className={checkingPayment ? 'animate-spin' : ''} />
          {checkingPayment ? 'Verificando...' : 'Ya pagué, verificar'}
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

        <div className="text-left max-w-md mx-auto mb-6 flex flex-col gap-4">
          {/* Ubicación */}
          {(contactInfo.address || ubicacion) && (
            <div className="rounded-xl p-4" style={{ background: '#f3f4f6' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                <MapPin size={13} /> Dónde es
              </p>
              {contactInfo.address && (
                <p className="text-sm mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333', lineHeight: 1.5 }}>
                  {contactInfo.address}
                </p>
              )}
              {ubicacion && (
                <a
                  href={ubicacion} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80"
                  style={{ fontFamily: 'var(--font-lato)', color: primaryColor }}
                >
                  Ver en Google Maps <ExternalLink size={13} />
                </a>
              )}
            </div>
          )}

          {/* Qué incluye el servicio — lo que cargó el admin */}
          {summary.serviceDescription && (
            <div className="rounded-xl p-4" style={{ background: '#f3f4f6' }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                <Info size={13} /> Sobre el servicio
              </p>
              <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#333', lineHeight: 1.5 }}>
                {summary.serviceDescription}
              </p>
            </div>
          )}
        </div>

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

        {/* Políticas del profesional — cancelación, reprogramación, seña, tolerancia */}
        {proPolicies && (proPolicies.cancellationPolicy || proPolicies.reschedulePolicy || proPolicies.depositPolicy || proPolicies.latePenalty || proPolicies.toleranceMinutes) && (
          <div className="text-left max-w-md mx-auto mb-6">
            <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
              <Shield size={13} /> Políticas de {assignedProfessionalName ?? summary.professionalName}
            </p>
            <ul className="flex flex-col gap-2" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {proPolicies.toleranceMinutes != null && (
                <li className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>
                  · Tolerancia de {proPolicies.toleranceMinutes} minutos
                </li>
              )}
              {proPolicies.latePenalty && (
                <li className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>· {proPolicies.latePenalty}</li>
              )}
              {proPolicies.cancellationPolicy && (
                <li className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>· {proPolicies.cancellationPolicy}</li>
              )}
              {proPolicies.reschedulePolicy && (
                <li className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>· {proPolicies.reschedulePolicy}</li>
              )}
              {proPolicies.depositPolicy && (
                <li className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>· {proPolicies.depositPolicy}</li>
              )}
            </ul>
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

      {/* Al confirmar se abre el checkout de Mercado Pago en una pestaña nueva —
          ahí la clienta elige si paga con QR, tarjeta o dinero en cuenta. */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: '#f3f4f6' }}>
        <ExternalLink size={18} color="#666" />
        <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
          Vas a pagar en una pestaña nueva de Mercado Pago.
        </p>
      </div>

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

      {whatsapp && (
        <button
          onClick={handlePayViaWhatsapp}
          disabled={phase === 'processing'}
          className="w-full mt-3 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: '#25D36615', color: '#1a1a1a', fontFamily: 'var(--font-lato)' }}
        >
          <MessageCircle size={17} color="#25D366" /> Coordinar el pago por WhatsApp
        </button>
      )}
    </div>
  )
}
