import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { formatCurrency } from '@/shared/utils/format'
import type { ProfessionalPerformanceStat } from './types'
import './dashboard.css'

interface Props {
  data: ProfessionalPerformanceStat[]
}

export function ProfessionalPerformanceTable({ data }: Props) {
  return (
    <DashboardCard title="Rendimiento por profesional">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no hay profesionales con turnos en este período
        </p>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Turnos atendidos</th>
                <th>Horas trabajadas</th>
                <th>Facturación total</th>
                <th>Cancelados</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td className="dashboard-table-name">{p.name}</td>
                  <td>{p.attended}</td>
                  <td>{p.hoursWorked.toLocaleString('es-AR')} hs</td>
                  <td>{formatCurrency(p.revenue)}</td>
                  <td className={p.cancelled > 0 ? 'dashboard-table-cancel' : ''}>{p.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}
