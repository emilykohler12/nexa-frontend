// Señas pagadas por Mercado Pago que el sistema marcó como devueltas y que todavía falta devolver de verdad (la
// devolución se hace a mano en Mercado Pago). Resumen: total, y por clienta el monto con una barra proporcional.
// «Marcar devuelta» registra que ya se devolvió y la saca de la lista.
import { useState } from 'react'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { formatCurrency } from '@/shared/utils/format'
import { formatDateDMY } from '@/shared/utils/dateFormat'
import type { PendingRefundStat } from './types'

interface Props {
  data:       PendingRefundStat[]
  onRefunded: (appointmentId: string) => void
}

export function PendingRefundsChart({ data, onRefunded }: Props) {
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const total = data.reduce((s, r) => s + r.amount, 0)
  const max   = data.reduce((m, r) => Math.max(m, r.amount), 0)

  const markDone = async (id: string) => {
    setWorkingId(id)
    setError(null)
    try {
      await api.patch(`/api/admin/appointments/${id}/refund-done`)
      onRefunded(id)
    } catch (err: unknown) {
      setError(safeErrorMessage(err, 'No se pudo marcar la seña como devuelta.'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <DashboardCard title="Señas por devolver (Mercado Pago)">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          No hay señas pendientes de devolver
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#a1887f' }}>{formatCurrency(total)}</span>
            <span style={{ fontSize: '14px', color: '#000' }}>
              {data.length === 1 ? 'a 1 clienta' : `a ${new Set(data.map(r => r.clientName)).size} clientas`} · {data.length} {data.length === 1 ? 'seña' : 'señas'}
            </span>
          </div>

          {data.map(r => (
            <div key={r.appointmentId} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#000' }}>{r.clientName}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{r.serviceName} · {formatDateDMY(r.date)} {r.time}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>{formatCurrency(r.amount)}</span>
                  <button
                    type="button"
                    onClick={() => markDone(r.appointmentId)}
                    disabled={workingId !== null}
                    aria-label={`Marcar devuelta la seña de ${r.clientName}`}
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: workingId ? 'wait' : 'pointer', fontFamily: "'Lato', sans-serif" }}
                  >
                    {workingId === r.appointmentId ? 'Guardando...' : 'Marcar devuelta'}
                  </button>
                </div>
              </div>
              <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${max > 0 ? Math.max(6, Math.round((r.amount / max) * 100)) : 0}%`, background: '#a1887f', borderRadius: '3px' }} />
              </div>
            </div>
          ))}

          {error && <p role="alert" style={{ margin: 0, fontSize: '13px', color: '#c33', fontWeight: 600 }}>{error}</p>}
        </div>
      )}
    </DashboardCard>
  )
}
