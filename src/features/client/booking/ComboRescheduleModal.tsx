import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { TimeSlotPicker } from './TimeSlotPicker'
import {
  type AvailabilityResponse, type DaySlots,
  EMPTY_DAY, intersectSlots, localTodayISO, slotsFromAvailability,
} from './availability'
import { formatDateDMY } from '@/shared/utils/dateFormat'
import '@/pages/client/AppointmentsPage.css'
import { safeErrorMessage, apiErrorCode, apiErrorStatus } from '@/shared/utils/errorMessage'

// Códigos del servidor por los que el horario elegido dejó de servir: hay que elegir otro.
const SLOT_NO_LONGER_VALID = ['PROFESSIONAL_SLOT_TAKEN', 'REOPENED_SLOT_CLOSED', 'REOPENED_SLOT_UNAVAILABLE', 'SERVICE_DOES_NOT_FIT', 'START_TIME_PASSED', 'OUT_OF_HOURS']

export interface ComboRescheduleLeg {
  id:               string
  serviceId:        string
  serviceName:      string
  professionalId:   string
  professionalName: string
}

interface Props<T extends { id: string }> {
  legs: ComboRescheduleLeg[]
  initialDate: string
  initialTime: string
  onClose: () => void
  // Las patas actualizadas que devuelve el backend, con la forma que use quien abre el modal.
  onSuccess: (updated: T[]) => void
}

// Reprograma un combo ENTERO: todas las patas pasan al mismo día y hora, así que se ofrecen solo los horarios en que
// están libres TODAS las profesionales del combo (la intersección de la disponibilidad de cada una). Qué horarios
// sirven hoy lo decide el servidor (earliestStart, reopenedStarts, vacaciones): el navegador no filtra con su reloj.
export function ComboRescheduleModal<T extends { id: string }>({ legs, initialDate, initialTime, onClose, onSuccess }: Props<T>) {
  const { business } = useTenant()
  const [date, setDate]       = useState<string>(initialDate)
  const [time, setTime]       = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  // Resultado de la última consulta; los horarios y el "cargando" se derivan de si corresponde a lo elegido ahora.
  const [loaded, setLoaded] = useState<{ key: string; slots: DaySlots; vacationOf: string | null } | null>(null)
  const key = `${date}|${refresh}`
  const current = loaded?.key === key ? loaded : null
  const loading = !current
  const slots = current?.slots ?? EMPTY_DAY

  useEffect(() => {
    let cancelled = false
    Promise.all(legs.map(leg =>
      api.get<AvailabilityResponse>(`/api/professional/${leg.professionalId}/availability`, { params: { date, serviceId: leg.serviceId } })
        .then(res => ({ leg, slots: slotsFromAvailability(res.data, date) }))
        .catch(() => ({ leg, slots: EMPTY_DAY })),
    )).then(results => {
      if (cancelled) return
      const onVacation = results.find(r => r.slots.vacation)
      setLoaded({ key, slots: intersectSlots(results.map(r => r.slots)), vacationOf: onVacation ? onVacation.leg.professionalName : null })
    })
    return () => { cancelled = true }
  }, [key, date, legs])

  if (!business) return null
  const { primaryColor } = business

  const unchanged = date === initialDate && time === initialTime
  const canSave = Boolean(date && time) && !unchanged

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.patch<{ appointment: T; appointments: T[] }>(`/api/client/appointments/${legs[0].id}/reschedule`, { date, time })
      onSuccess(res.data.appointments ?? [res.data.appointment])
    } catch (err: unknown) {
      const code = apiErrorCode(err)
      if (apiErrorStatus(err) === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
        setError('Uno de los horarios del combo ya se ocupó. Elegí otro horario disponible.')
        setTime(null)
        setRefresh(s => s + 1)
      } else if (code && SLOT_NO_LONGER_VALID.includes(code)) {
        setError(safeErrorMessage(err, 'Ese horario ya no está disponible. Elegí otro horario.'))
        setTime(null)
        setRefresh(s => s + 1)
      } else {
        setError(safeErrorMessage(err, 'No se pudo reprogramar el combo.'))
      }
    } finally {
      setSaving(false)
    }
  }

  const noTimes = slots.regular.length === 0 && slots.reopened.length === 0

  return (
    <div className="reschedule-overlay" onClick={onClose}>
      <div className="reschedule-modal" onClick={e => e.stopPropagation()}>
        <div className="reschedule-header">
          <h2 style={{ color: primaryColor }}>Reprogramar combo</h2>
          <button onClick={onClose} className="reschedule-close" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="reschedule-body">
          <p className="reschedule-note" style={{ margin: '0 0 12px', fontSize: '14px', color: '#555' }}>
            Se mueven todos los servicios del combo al mismo día y horario, con las mismas profesionales
            ({legs.map(l => `${l.serviceName} con ${l.professionalName}`).join(', ')}). Solo se muestran los horarios en que están libres todas.
          </p>

          <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>¿Cuándo querés venir?</h2>
          <input
            type="date"
            value={date}
            min={localTodayISO()}
            onChange={e => { setDate(e.target.value); setTime(null) }}
            className="w-full border rounded-xl p-3 mb-6 outline-none"
            style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)', color: primaryColor }}
          />

          {loading && (
            <p className="text-gray-400 text-center py-6" style={{ fontFamily: 'var(--font-lato)' }}>Cargando horarios...</p>
          )}

          {!loading && (
            <>
              <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>Horarios disponibles para todas las profesionales</p>
              {noTimes ? (
                <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
                  {current?.vacationOf
                    ? `${current.vacationOf} está de vacaciones ese día. Elegí otra fecha.`
                    : slots.dayKind === 'past'
                    ? 'Esa fecha ya pasó. Elegí otra fecha.'
                    : `No hay un horario en que estén libres todas las profesionales el ${formatDateDMY(date)}. Probá con otra fecha.`}
                </p>
              ) : (
                <TimeSlotPicker
                  regular={slots.regular}
                  reopened={slots.reopened}
                  selectedTime={time}
                  onSelect={setTime}
                  primaryColor={primaryColor}
                />
              )}
            </>
          )}
        </div>

        {error && <p className="reschedule-error">{error}</p>}

        <div className="reschedule-footer">
          <button onClick={onClose} className="reschedule-cancel-btn" disabled={saving}>Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="reschedule-save-btn"
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? 'Guardando...' : 'Confirmar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
