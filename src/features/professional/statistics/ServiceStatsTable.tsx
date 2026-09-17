import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { formatCurrency } from '@/shared/utils/format'
import type { ServiceStat } from './types'
import './statistics-extra.css'

interface Props {
  data: ServiceStat[]
}

export function ServiceStatsTable({ data }: Props) {
  return (
    <DashboardCard title="Mis servicios más realizados">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no tenés turnos registrados
        </p>
      ) : (
        <div className="pro-stats-table-wrap">
          <table className="pro-stats-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Turnos asistidos</th>
                <th>Total generado</th>
                <th>Cancelados</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={i}>
                  <td className="pro-stats-table-name">{s.name}</td>
                  <td>{s.attended}</td>
                  <td>{formatCurrency(s.revenue)}</td>
                  <td className={s.cancelled > 0 ? 'pro-stats-table-cancel' : ''}>{s.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}
