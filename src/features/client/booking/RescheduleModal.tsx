import { useState } from 'react'
import { X } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { ServiceStep } from './steps/ServiceStep'
import { ProviderStep } from './steps/ProviderStep'
import { DateTimeStep } from './steps/DateTimeStep'
import '@/pages/client/AppointmentsPage.css'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

interface Props {
  appointmentId: string
  initialServiceId: string
  initialProfessionalId: string
  initialDate: string
  initialTime: string
  onClose: () => void
  onSuccess: (updated: any) => void
}

export function RescheduleModal({
  appointmentId,
  initialServiceId,
  initialProfessionalId,
  initialDate,
  initialTime,
  onClose,
  onSuccess,
}: Props) {
  const { business } = useTenant()
  const [serviceId, setServiceId]           = useState(initialServiceId)
  const [professionalId, setProfessionalId] = useState(initialProfessionalId)
  const [date, setDate]                     = useState<string | null>(initialDate)
  const [time, setTime]                     = useState<string | null>(initialTime)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [refreshSignal, setRefreshSignal]   = useState(0)

  if (!business) return null
  const { primaryColor } = business

  const handleProfessionalChange = (id: string) => {
    if (id === professionalId) return
    setProfessionalId(id)
    setDate(null)
    setTime(null)
  }

  const handleDateChange = (d: string) => {
    setDate(d)
    setTime(null)
  }

  const canSave = Boolean(serviceId && professionalId && date && time)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.patch(`/api/client/appointments/${appointmentId}/reschedule`, {
        serviceId, professionalId, date, time,
      })
      onSuccess(res.data.appointment)
    } catch (err: any) {
      const code = err?.response?.data?.code
      if (err?.response?.status === 409 && code === 'PROFESSIONAL_SLOT_TAKEN') {
        setError('Ese horario ya se ocupó. Elegí otro horario disponible.')
        setTime(null)
        setRefreshSignal(s => s + 1)
      } else {
        setError(
          code === 'COMBO_NOT_RESCHEDULABLE'
            ? 'Este turno es parte de un combo y no se puede reprogramar. Cancelalo y reservá de nuevo si necesitás cambiar el horario.'
            : safeErrorMessage(err, 'No se pudo reprogramar el turno.')
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="reschedule-overlay" onClick={onClose}>
      <div className="reschedule-modal" onClick={e => e.stopPropagation()}>
        <div className="reschedule-header">
          <h2 style={{ color: primaryColor }}>Reprogramar turno</h2>
          <button onClick={onClose} className="reschedule-close" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="reschedule-body">
          <ServiceStep
            selectedServiceId={serviceId}
            onSelect={service => { setServiceId(service.id); if (service.id !== serviceId) handleProfessionalChange('') }}
          />
          <div className="reschedule-divider" />
          <ProviderStep serviceId={serviceId} selectedProfessionalId={professionalId} onSelect={handleProfessionalChange} />
          <div className="reschedule-divider" />
          <DateTimeStep
            professionalId={professionalId}
            serviceId={serviceId}
            selectedDate={date}
            selectedTime={time}
            onSelectDate={handleDateChange}
            onSelectTime={setTime}
            refreshSignal={refreshSignal}
          />
        </div>

        {error && <p className="reschedule-error">{error}</p>}

        <div className="reschedule-footer">
          <button onClick={onClose} className="reschedule-cancel-btn" disabled={saving}>
            Cancelar
          </button>
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
