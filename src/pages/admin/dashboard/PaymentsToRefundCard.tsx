// Pagos de Mercado Pago en los que la clienta pagó y NO se reservó nada (monto menor, otra moneda o pago que llegó después de
// liberarse el turno). El administrador los devuelve a mano en Mercado Pago y los marca acá; cada uno muestra el motivo.
import { useState } from 'react'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { formatCurrency } from '@/shared/utils/format'
import { formatDateDMY } from '@/shared/utils/dateFormat'
import type { PaymentToRefundStat } from './types'

interface Props {
  data:       PaymentToRefundStat[]
  onRefunded: (id: string) => void
}

export function PaymentsToRefundCard({ data, onRefunded }: Props) {
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const markDone = async (id: string) => {
    setWorkingId(id)
    setError(null)
    try {
      await api.patch(`/api/admin/payments/${id}/refund-done`)
      onRefunded(id)
    } catch (err: unknown) {
      setError(safeErrorMessage(err, 'No se pudo marcar el pago como devuelto.'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <DashboardCard title="Pagos para devolver (Mercado Pago)">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          No hay pagos pendientes de devolver
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#000' }}>{p.clientName ?? 'Clienta'}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>
                  {p.label ?? 'Pago'}{p.date ? ` · ${formatDateDMY(p.date)} ${p.time ?? ''}` : ''}
                </p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#c33' }}>{p.reason}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>
                  {p.paidAmount === null ? 'Sin monto' : formatCurrency(p.paidAmount)}
                </span>
                <button
                  type="button"
                  onClick={() => markDone(p.id)}
                  disabled={workingId !== null}
                  aria-label={`Marcar devuelto el pago de ${p.clientName ?? 'la clienta'}`}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: workingId ? 'wait' : 'pointer', fontFamily: "'Lato', sans-serif" }}
                >
                  {workingId === p.id ? 'Guardando...' : 'Marcar devuelto'}
                </button>
              </div>
            </div>
          ))}

          {error && <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#c33', fontWeight: 600 }}>{error}</p>}
        </div>
      )}
    </DashboardCard>
  )
}
