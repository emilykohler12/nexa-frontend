import { useState, useEffect } from 'react'
import { ChevronLeft, Check, Clock, Users2, Shuffle, ExternalLink, RefreshCw } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { generateSlots } from '@/features/professional/onboarding/types'
import type { Service } from './steps/ServiceStep'
import { ANY_PROFESSIONAL_ID } from './steps/ProviderStep'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { PostBookingDetails } from './PostBookingDetails'

// Mismas categorías que en PostBookingDetails.tsx — ahí vive la lógica de
// qué preguntas mostrar según la categoría del servicio.
const DETAILS_CATEGORIES = ['unas', 'cabello', 'rostro']

// El backend usa 0=lunes...6=domingo; Date#getDay() usa 0=domingo...6=sábado
const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5]

interface Professional {
  id: string
  name: string
  photo: string | null
}

interface ComponentAssignment {
  serviceId: string
  serviceName: string
  categoryId: string
  price: number
  duration: number
  professionals: Professional[]
  loadingProfessionals: boolean
  professionalId: string | null
  // Solo se usan en modo "por separado" — cada componente tiene su propia fecha/hora
  date: string | null
  time: string | null
  availableTimes: string[]
  loadingTimes: boolean
}

interface AvailabilityRow { dayOfWeek: number; startTime: string; endTime: string }
interface AvailabilityResponse { availability: AvailabilityRow[]; bookedTimes?: string[] }
interface PaymentSettings { depositAmount: number; depositPercent: boolean }

type Phase = 'assign' | 'datetime' | 'confirm' | 'waitingPayment' | 'details' | 'success'

const POLL_MS = 5000

interface DetailsQueueItem { appointmentId: string; categoryId: string }

interface Props {
  combo: Service
  onBack: () => void
  onSuccess: () => void
}

function computeDeposit(price: number, settings: PaymentSettings): number {
  const amount = Number(settings.depositAmount) || 0
  if (settings.depositPercent) return Math.round((price * amount) / 100)
  return Math.min(amount, price)
}

function filterPastToday(slots: string[], date: string): string[] {
  const now = new Date()
  const isToday = date === now.toISOString().split('T')[0]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return slots.filter(t => {
    if (!isToday) return true
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m > nowMinutes
  })
}

// Horarios libres de UN profesional puntual (descuenta bookedTimes que ya vienen del backend).
async function fetchSlotsFor(professionalId: string, date: string): Promise<string[]> {
  const res = await api.get<AvailabilityResponse>(`/api/professional/${professionalId}/availability`, { params: { date } })
  const backendDay = JS_DAY_TO_BACKEND_DAY[new Date(`${date}T00:00:00`).getDay()]
  const dayRows = res.data.availability.filter(a => a.dayOfWeek === backendDay)
  if (dayRows.length === 0) return []
  const booked = new Set(res.data.bookedTimes ?? [])
  const slots = dayRows.flatMap(row => generateSlots({ start: row.startTime, end: row.endTime })).filter(t => !booked.has(t))
  return filterPastToday(slots, date)
}

// Horarios libres para "cualquiera" en un servicio del combo: unión de los horarios
// libres de todos los profesionales que hacen ese servicio (alcanza con que uno esté libre).
async function fetchAnySlotsFor(serviceId: string, date: string): Promise<string[]> {
  const res = await api.get<{ professionals: { id: string }[] }>(`/api/professional/public?serviceId=${encodeURIComponent(serviceId)}`)
  const results = await Promise.all(res.data.professionals.map(p => fetchSlotsFor(p.id, date).catch((): string[] => [])))
  return Array.from(new Set(results.flat())).sort()
}

export function ComboBookingFlow({ combo, onBack, onSuccess }: Props) {
  const { business } = useTenant()
  // Un combo AHORA siempre es en simultáneo: todos los servicios el mismo día
  // y hora, cada uno con una profesional distinta.
  const simultaneous = true
  const [phase, setPhase] = useState<Phase>('assign')
  const [components, setComponents] = useState<ComponentAssignment[]>([])
  const [loadingComponents, setLoadingComponents] = useState(true)

  // Solo para modo simultáneo: una fecha y hora compartidas por todos
  const [sharedDate, setSharedDate] = useState<string | null>(null)
  const [sharedTimes, setSharedTimes] = useState<string[]>([])
  const [loadingSharedTimes, setLoadingSharedTimes] = useState(false)
  const [sharedTime, setSharedTime] = useState<string | null>(null)

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailsQueue, setDetailsQueue] = useState<DetailsQueueItem[]>([])
  const [comboGroupId, setComboGroupId] = useState<string | null>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)

  useEffect(() => {
    api.get<{ services: Service[] }>('/api/services')
      .then(res => {
        const all = res.data.services
        const comps: ComponentAssignment[] = (combo.comboServiceIds ?? []).map(id => {
          const s = all.find(x => x.id === id)
          return {
            serviceId: id,
            serviceName: s?.name ?? 'Servicio',
            categoryId: s?.categoryId ?? '',
            // La API serializa price como string (Decimal de Prisma) — hay que
            // convertirlo o las sumas terminan concatenando ("$010000200002...").
            price: Number(s?.price ?? 0),
            duration: Number(s?.duration ?? 0),
            professionals: [],
            loadingProfessionals: true,
            professionalId: null,
            date: null,
            time: null,
            availableTimes: [],
            loadingTimes: false,
          }
        })
        setComponents(comps)
      })
      .finally(() => setLoadingComponents(false))

    api.get<{ settings: PaymentSettings }>('/api/business/payments/public')
      .then(res => setPaymentSettings(res.data.settings))
      .catch(() => setPaymentSettings(null))
  }, [combo.id])

  // Trae los profesionales que hacen cada servicio del combo, una vez que ya sabemos cuáles son
  useEffect(() => {
    components.forEach((c, idx) => {
      if (!c.loadingProfessionals || c.professionals.length > 0) return
      api.get<{ professionals: Professional[] }>(`/api/professional/public?serviceId=${encodeURIComponent(c.serviceId)}`)
        .then(res => {
          setComponents(prev => prev.map((p, i) => i === idx ? { ...p, professionals: res.data.professionals, loadingProfessionals: false } : p))
        })
        .catch(() => {
          setComponents(prev => prev.map((p, i) => i === idx ? { ...p, professionals: [], loadingProfessionals: false } : p))
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components.length])

  if (!business) return null
  const { primaryColor, accentColor } = business

  const allAssigned = components.length > 0 && components.every(c => c.professionalId)
  const assignedProfessionalIds = Array.from(new Set(components.map(c => c.professionalId).filter(Boolean))) as string[]

  // En simultáneo cada profesional puede hacer un solo servicio a la vez, así
  // que una vez elegida para un servicio no se puede elegir para otro ("Cualquiera"
  // sí se puede repetir — el backend resuelve profesionales distintos).
  const setProfessional = (idx: number, professionalId: string) => {
    setComponents(prev => prev.map((c, i) => {
      if (i === idx) return { ...c, professionalId }
      // Si ese profesional ya estaba elegido en otro servicio, se lo saca de ahí.
      if (professionalId !== ANY_PROFESSIONAL_ID && c.professionalId === professionalId) {
        return { ...c, professionalId: null }
      }
      return c
    }))
  }

  const professionalTakenElsewhere = (idx: number, proId: string) =>
    proId !== ANY_PROFESSIONAL_ID && components.some((c, i) => i !== idx && c.professionalId === proId)

  // El precio del combo es el que cargó el admin en el servicio combo (no la
  // suma de los componentes), y la seña se calcula sobre ese precio.
  const totalPrice = Number(combo.price) || 0
  const totalDuration = components.reduce((max, c) => Math.max(max, c.duration), 0)
  const deposit = paymentSettings ? computeDeposit(totalPrice, paymentSettings) : 0

  const handleSharedDateChange = async (d: string) => {
    setSharedDate(d)
    setSharedTime(null)
    setSharedTimes([])
    if (components.length === 0) return
    setLoadingSharedTimes(true)
    try {
      const slotLists = await Promise.all(
        components.map(c =>
          (c.professionalId === ANY_PROFESSIONAL_ID
            ? fetchAnySlotsFor(c.serviceId, d)
            : c.professionalId
            ? fetchSlotsFor(c.professionalId, d)
            : Promise.resolve([] as string[])
          ).catch((): string[] => [])
        )
      )
      setSharedTimes(slotLists.reduce((acc, list) => acc.filter(t => list.includes(t))))
    } finally {
      setLoadingSharedTimes(false)
    }
  }

  // Trae el estado de la seña del combo directo de Mercado Pago (no depende del
  // webhook). Cuando queda paga, sigue a las preguntas post-reserva.
  const checkComboPayment = async () => {
    if (!comboGroupId) return
    setCheckingPayment(true)
    try {
      const res = await api.post<{ paymentStatus: string }>(`/api/client/appointments/combo/${comboGroupId}/verify-payment`)
      if (res.data.paymentStatus === 'partial') {
        setPhase(detailsQueue.length > 0 ? 'details' : 'success')
      }
    } catch {
      /* chequeo de fondo */
    } finally {
      setCheckingPayment(false)
    }
  }

  useEffect(() => {
    if (phase !== 'waitingPayment') return
    const interval = setInterval(checkComboPayment, POLL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, comboGroupId, detailsQueue.length])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post<{ comboGroupId: string; appointments?: { id: string; serviceId: string }[] }>('/api/client/appointments/combo', {
        comboServiceId: combo.id,
        simultaneous: true,
        components: components.map(c => ({
          serviceId: c.serviceId,
          professionalId: c.professionalId,
          date: sharedDate,
          time: sharedTime,
        })),
      })

      const newGroupId = res.data.comboGroupId
      setComboGroupId(newGroupId)

      // Para cada turno del combo que quedó en una categoría con preguntas
      // post-reserva (uñas/cabello/rostro), las encolamos para preguntarlas
      // una por una — después del pago.
      const createdAppointments = res.data.appointments ?? []
      const queue = createdAppointments
        .map(a => {
          const comp = components.find(c => c.serviceId === a.serviceId)
          return comp && DETAILS_CATEGORIES.includes(comp.categoryId) ? { appointmentId: a.id, categoryId: comp.categoryId } : null
        })
        .filter((x): x is DetailsQueueItem => x !== null)
      setDetailsQueue(queue)

      // Si no hay seña que cobrar (combo sin precio / seña 0), no se abre
      // Mercado Pago — se pasa directo a las preguntas.
      if (deposit <= 0) {
        setPhase(queue.length > 0 ? 'details' : 'success')
        return
      }

      // Una sola seña para todo el combo — se abre el checkout de Mercado Pago.
      const pref = await api.post<{ checkoutUrl: string }>(`/api/client/appointments/combo/${newGroupId}/payment`)
      window.open(pref.data.checkoutUrl, '_blank', 'noopener,noreferrer')
      setPhase('waitingPayment')
    } catch (err: any) {
      const code = err?.response?.data?.code
      if (err?.response?.status === 400 && code === 'NO_PROFESSIONAL_AVAILABLE') {
        setError('No hay ningún profesional disponible para uno de los servicios de "cualquiera" en el horario elegido. Probá con otro horario o elegí un profesional específico.')
      } else if (err?.response?.status === 409 && code === 'SAME_PROFESSIONAL_SIMULTANEOUS') {
        setError('No se puede hacer dos servicios en simultáneo con la misma profesional. Elegí una profesional distinta para cada uno.')
        setPhase('assign')
      } else if (err?.response?.status === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
        setError('Uno de los horarios elegidos ya se ocupó. Elegí otro horario e intentá de nuevo.')
        setPhase('datetime')
        setSharedTime(null)
        if (sharedDate) handleSharedDateChange(sharedDate)
      } else {
        setError(safeErrorMessage(err, 'No pudimos confirmar el combo. Intentá de nuevo.'))
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

  // Cuadro fijo arriba a la derecha aclarando que el combo es en simultáneo.
  const SimultaneousNote = () => (
    <div
      className="absolute top-0 right-0 flex items-start gap-2 rounded-xl px-3 py-2 max-w-[240px]"
      style={{ background: `${primaryColor}0d`, border: `1px solid ${primaryColor}33` }}
    >
      <Users2 size={16} color={primaryColor} style={{ marginTop: 2, flexShrink: 0 }} />
      <p className="text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#555', lineHeight: 1.35 }}>
        Estos {components.length || (combo.comboServiceIds?.length ?? 0)} servicios se hacen <strong>en simultáneo</strong>: el mismo día y hora, cada uno con una profesional distinta.
      </p>
    </div>
  )

  if (phase === 'assign') {
    return (
      <div className="relative pt-2">
        <SimultaneousNote />
        <Header title="¿Quién hace cada servicio?" onBackClick={onBack} />
        {loadingComponents ? (
          <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>Cargando...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {components.map((c, idx) => (
              <div key={c.serviceId}>
                <p className="font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#333' }}>{c.serviceName}</p>
                {c.loadingProfessionals ? (
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>Cargando profesionales...</p>
                ) : c.professionals.length === 0 ? (
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>No hay profesionales disponibles para este servicio</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {c.professionals.length > 1 && (
                      <button
                        onClick={() => setProfessional(idx, ANY_PROFESSIONAL_ID)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                        style={{
                          borderColor: c.professionalId === ANY_PROFESSIONAL_ID ? primaryColor : '#e5e5e5',
                          backgroundColor: c.professionalId === ANY_PROFESSIONAL_ID ? `${primaryColor}10` : 'white',
                          fontFamily: 'var(--font-lato)',
                        }}
                      >
                        <Shuffle size={13} color={primaryColor} />
                        Cualquiera
                      </button>
                    )}
                    {c.professionals.map(pro => {
                      const taken = professionalTakenElsewhere(idx, pro.id)
                      return (
                        <button
                          key={pro.id}
                          onClick={() => !taken && setProfessional(idx, pro.id)}
                          disabled={taken}
                          title={taken ? 'Ya la elegiste para otro servicio del combo' : undefined}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            borderColor: c.professionalId === pro.id ? primaryColor : '#e5e5e5',
                            backgroundColor: c.professionalId === pro.id ? `${primaryColor}10` : 'white',
                            fontFamily: 'var(--font-lato)',
                          }}
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                            {pro.photo ? <img src={pro.photo} alt={pro.name} className="w-full h-full object-cover" /> : pro.name.charAt(0).toUpperCase()}
                          </div>
                          {pro.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setPhase('datetime')}
          disabled={!allAssigned}
          className="w-full mt-8 py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          Siguiente
        </button>
      </div>
    )
  }

  if (phase === 'datetime') {
    return (
      <div className="relative pt-2">
        <SimultaneousNote />
        <Header title="¿Cuándo?" onBackClick={() => setPhase('assign')} />
        {error && (
          <p className="text-sm text-center mb-4" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>{error}</p>
        )}
        <input
          type="date"
          value={sharedDate ?? ''}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => handleSharedDateChange(e.target.value)}
          className="w-full border rounded-xl p-3 mb-6 outline-none"
          style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)', color: primaryColor }}
        />
        {sharedDate && (
          loadingSharedTimes ? (
            <p className="text-gray-400 text-center py-6" style={{ fontFamily: 'var(--font-lato)' }}>Buscando un horario que le sirva a todos...</p>
          ) : sharedTimes.length === 0 ? (
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
              No encontramos un horario donde los {assignedProfessionalIds.length} profesionales elegidos estén libres a la vez este día. Probá con otra fecha.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>Horarios donde todos están libres</p>
              <div className="grid grid-cols-4 gap-2">
                {sharedTimes.map(t => (
                  <button
                    key={t}
                    onClick={() => setSharedTime(t)}
                    className="py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ backgroundColor: sharedTime === t ? primaryColor : '#f3f4f6', color: sharedTime === t ? 'white' : '#555', fontFamily: 'var(--font-lato)' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )
        )}
        <button
          onClick={() => setPhase('confirm')}
          disabled={!sharedDate || !sharedTime}
          className="w-full mt-8 py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40"
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
        <Header title="Confirmá tu combo" onBackClick={() => setPhase('datetime')} />
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-6" style={{ borderColor: '#f3f4f6' }}>
          <div className="flex flex-col gap-3 mb-4">
            {components.map(c => (
              <div key={c.serviceId} className="flex justify-between text-sm">
                <div className="text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
                  <div>{c.serviceName} · {c.professionals.find(p => p.id === c.professionalId)?.name}</div>
                  {!simultaneous && c.date && (
                    <div className="text-xs">
                      {new Date(c.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} a las {c.time}
                    </div>
                  )}
                </div>
                <span className="font-semibold" style={{ fontFamily: 'var(--font-lato)' }}>${c.price.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          {simultaneous && (
            <div className="flex items-center gap-2 text-sm mb-1" style={{ fontFamily: 'var(--font-lato)', color: '#555' }}>
              <Clock size={14} /> {sharedDate && new Date(sharedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} a las {sharedTime} · {totalDuration} min (en simultáneo)
            </div>
          )}
          <div className="border-t pt-4 mt-4 flex justify-between" style={{ borderColor: '#f3f4f6' }}>
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

        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4" style={{ background: '#f3f4f6' }}>
          <ExternalLink size={18} color="#666" />
          <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
            Vas a pagar en una pestaña nueva de Mercado Pago. Es una sola seña para todo el combo.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
        >
          {submitting ? 'Procesando...' : `Pagar seña · $${deposit.toLocaleString('es-AR')}`}
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
        <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Se abrió una pestaña nueva con el checkout de Mercado Pago. Completá el pago ahí — apenas se confirme, esta pantalla avanza sola.
        </p>
        <button
          onClick={checkComboPayment}
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

  if (phase === 'details' && detailsQueue.length > 0) {
    const current = detailsQueue[0]
    const advance = () => {
      setDetailsQueue(prev => {
        const next = prev.slice(1)
        if (next.length === 0) setPhase('success')
        return next
      })
    }
    return (
      <PostBookingDetails
        appointmentId={current.appointmentId}
        categoryId={current.categoryId}
        onDone={advance}
        onCancel={advance}
      />
    )
  }

  // success
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
        <Check size={28} color="#16a34a" />
      </div>
      <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>¡Combo reservado!</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6" style={{ fontFamily: 'var(--font-lato)' }}>
        {simultaneous
          ? `Te esperamos el ${sharedDate && new Date(sharedDate + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} a las ${sharedTime} para tus ${components.length} servicios en simultáneo.`
          : `Reservamos tus ${components.length} servicios del combo, cada uno en su horario.`}
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
