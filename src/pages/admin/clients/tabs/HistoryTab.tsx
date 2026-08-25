import { useState, useEffect } from 'react'
import { api } from '@/shared/utils/api'
import type { AdminClient, AppointmentHistoryStatus, ClientAppointmentHistory } from '../types'

const STATUS_CONFIG: Record<AppointmentHistoryStatus, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: '#069494' },
  finished:  { label: 'Realizado',  color: '#4caf50' },
  cancelled: { label: 'Cancelado',  color: '#e53935' },
  no_show:   { label: 'No asistió', color: '#000'    },
}

export function HistoryTab({ client }: { client: AdminClient }) {
  const [history, setHistory] = useState<ClientAppointmentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ history: ClientAppointmentHistory[] }>(`/api/admin/clients/${client.id}/history`)
      // Solo turnos ya resueltos: realizados, cancelados o no asistió — los confirmados
      // a futuro todavía no "pasaron" y no deberían aparecer como historial.
      .then(res => setHistory((res.data.history ?? []).filter(h => h.status !== 'confirmed')))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [client.id])

  if (loading) {
    return (
      <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px', fontFamily: "'Lato', sans-serif" }}>
        Cargando...
      </p>
    )
  }

  if (history.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px', fontFamily: "'Lato', sans-serif" }}>
        Sin historial de turnos
      </p>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', overflow: 'auto' }}>
      <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse', fontSize: '15px', fontFamily: "'Lato', sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            {['Servicio', 'Profesional', 'Fecha', 'Precio', 'Estado'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((appt) => {
            const status = STATUS_CONFIG[appt.status]
            return (
              <tr key={appt.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '13px 16px', color: '#000', fontWeight: 700 }}>{appt.service}</td>
                <td style={{ padding: '13px 16px', color: '#000' }}>{appt.professional}</td>
                <td style={{ padding: '13px 16px', color: '#000' }}>
                  {new Date(appt.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })} · {appt.time}
                </td>
                <td style={{ padding: '13px 16px', color: '#069494', fontWeight: 700 }}>
                  ${appt.price.toLocaleString('es-AR')}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', background: `${status.color}18`, color: status.color }}>
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
