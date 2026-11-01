// Confirmación con la que la clienta cancela su turno. Antes de confirmar le dice, según las horas que faltan,
// si la seña se devuelve o queda retenida. El turno se puede cancelar aunque ya haya empezado (la seña queda
// retenida). La devolución del dinero se hace por fuera del sistema. La decisión real la toma el backend.
import { usePaymentRules } from '@/shared/hooks/usePaymentRules'
import { ConfirmModal } from '@/shared/ui/molecules/ConfirmModal'
import { decideRefund, describeClientOutcome, noticeHoursBefore } from '@/shared/utils/cancellation'

interface Props {
  title:       string
  message:     string
  // Inicio del turno (si es un combo, el del primer servicio) y si hay seña paga en alguno de sus servicios.
  date:        string   // YYYY-MM-DD (hora de Argentina)
  time:        string   // HH:mm
  paid:        boolean
  accentColor: string
  loading:     boolean
  onConfirm:   () => void
  onCancel:    () => void
}

export function ClientCancelConfirm({ title, message, date, time, paid, accentColor, loading, onConfirm, onCancel }: Props) {
  const rule  = usePaymentRules()
  const hours = noticeHoursBefore(date, time, new Date())
  const outcome = decideRefund({ rule, cancelledBy: 'client', paid, hours })

  return (
    <ConfirmModal
      title={title}
      message={message}
      confirmLabel="Sí, cancelar"
      cancelLabel="Volver"
      accentColor={accentColor}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <div role="status" className="rounded-xl p-3 text-left text-sm" style={{ background: `${accentColor}0d`, border: `1px solid ${accentColor}33`, color: '#1a1a1a' }}>
        <p className="font-semibold">{describeClientOutcome(outcome, { hours, rule })}</p>
        {paid && (
          <p className="mt-1 text-xs text-gray-600">
            Cuando corresponde, la seña se devuelve por fuera de la aplicación: el estudio lo coordina con vos.
          </p>
        )}
      </div>
    </ConfirmModal>
  )
}
