//src/features/client/booking/BookingWizard.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'
import { BOOKING_STEPS, EMPTY_BOOKING } from './types'
import type { BookingSelection } from './types'
import { ServiceStep } from './steps/ServiceStep'
import { ProviderStep } from './steps/ProviderStep'
import { DateTimeStep } from './steps/DateTimeStep'
import { ConfirmationStep } from './steps/ConfirmationStep'
import type { ConfirmedSummary } from './steps/ConfirmationStep'
import { PaymentStep } from './PaymentStep'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function BookingWizard() {
  const { business } = useTenant()
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [selection, setSelection] = useState<BookingSelection>(EMPTY_BOOKING)
  const [paymentSummary, setPaymentSummary] = useState<ConfirmedSummary | null>(null)

  if (!business) return null
  const { primaryColor } = business
  const step = BOOKING_STEPS[stepIndex]

  const canAdvance =
    (step.id === 'service' && !!selection.serviceId) ||
    (step.id === 'professional' && !!selection.professionalId) ||
    (step.id === 'datetime' && !!selection.date && !!selection.time)

  const goBack = () => {
    if (stepIndex === 0) navigate(ROUTES.CLIENT_APPOINTMENTS)
    else setStepIndex(i => i - 1)
  }

  const goNext = () => setStepIndex(i => i + 1)

  const handleExpire = () => {
    setPaymentSummary(null)
    setSelection(s => ({ ...s, date: null, time: null }))
    setStepIndex(BOOKING_STEPS.findIndex(s => s.id === 'datetime'))
  }

  const handlePaymentSuccess = () => navigate(ROUTES.CLIENT_APPOINTMENTS)

  if (paymentSummary) {
    return (
      <div className="w-full px-8 py-8" style={{ boxSizing: 'border-box' }}>
        <PaymentStep summary={paymentSummary} onExpire={handleExpire} onSuccess={handlePaymentSuccess} />
      </div>
    )
  }

  return (
    <div className="w-full px-8 py-8" style={{ boxSizing: 'border-box' }}>
      <h1 className="text-3xl mb-6" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        Reservar Turno
      </h1>

      <div className="flex items-center mb-8">
        {BOOKING_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{ backgroundColor: i <= stepIndex ? primaryColor : '#e5e5e5', color: i <= stepIndex ? 'white' : '#999' }}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block" style={{ fontFamily: 'var(--font-lato)', color: i <= stepIndex ? primaryColor : '#999' }}>
                {s.label}
              </span>
            </div>
            {i < BOOKING_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: i < stepIndex ? primaryColor : '#e5e5e5' }} />
            )}
          </div>
        ))}
      </div>

      {step.id === 'service' && (
        <ServiceStep
          selectedServiceId={selection.serviceId}
          onSelect={id => setSelection(s => ({ ...s, serviceId: id, professionalId: id !== s.serviceId ? null : s.professionalId }))}
        />
      )}
      {step.id === 'professional' && (
        <ProviderStep
          serviceId={selection.serviceId}
          selectedProfessionalId={selection.professionalId}
          onSelect={id => setSelection(s => ({ ...s, professionalId: id }))}
        />
      )}
      {step.id === 'datetime' && (
        <DateTimeStep
          professionalId={selection.professionalId}
          selectedDate={selection.date}
          selectedTime={selection.time}
          onSelectDate={date => setSelection(s => ({ ...s, date, time: null }))}
          onSelectTime={time => setSelection(s => ({ ...s, time }))}
        />
      )}
      {step.id === 'confirmation' && <ConfirmationStep selection={selection} onConfirm={setPaymentSummary} />}

      {step.id !== 'confirmation' && (
        <div className="flex justify-between mt-8">
          <button onClick={goBack} className="flex items-center gap-2 text-sm transition-all" style={{ color: '#999', fontFamily: 'var(--font-lato)' }}>
            <ChevronLeft size={16} />
            {stepIndex === 0 ? 'Volver' : 'Anterior'}
          </button>
          <button
            onClick={goNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step.id === 'confirmation' && (
        <div className="mt-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm transition-all" style={{ color: '#999', fontFamily: 'var(--font-lato)' }}>
            <ChevronLeft size={16} />
            Anterior
          </button>
        </div>
      )}
    </div>
  )
}
