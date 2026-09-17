import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { formatCurrency } from '@/shared/utils/format'
import type { ServiceProfitabilityStat } from './types'
import './dashboard.css'

interface Props {
  data: ServiceProfitabilityStat[]
}

export function ServiceProfitabilityTable({ data }: Props) {
  return (
    <DashboardCard title="Ranking de servicios más rentables">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no hay turnos registrados en este período
        </p>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Turnos realizados</th>
                <th>Ingreso de seña</th>
                <th>Facturación total</th>
                <th>Cancelados</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={i}>
                  <td className="dashboard-table-name">{s.name}</td>
                  <td>{s.realized}</td>
                  <td>{formatCurrency(s.depositRevenue)}</td>
                  <td>{formatCurrency(s.totalRevenue)}</td>
                  <td className={s.cancelled > 0 ? 'dashboard-table-cancel' : ''}>{s.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}
