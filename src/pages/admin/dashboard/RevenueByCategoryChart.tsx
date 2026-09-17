import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox } from '@/shared/ui/dashboard/TooltipBox'
import { formatCurrency } from '@/shared/utils/format'
import { SERVICE_CATEGORIES } from '@/app/data/shared/categories.data'
import type { CategoryRevenueStat } from './types'
import './dashboard.css'

interface Props {
  data: CategoryRevenueStat[]
}

function categoryLabel(categoryId: string): string {
  return SERVICE_CATEGORIES.find(c => c.id === categoryId)?.label ?? categoryId
}

export function RevenueByCategoryChart({ data }: Props) {
  const total = data.reduce((s, c) => s + c.revenue, 0)

  return (
    <DashboardCard title="Ingresos por categoría de servicio">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no hay turnos finalizados en este período
        </p>
      ) : (
        <div className="service-stats-layout">
          <div className="service-stats-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="revenue" paddingAngle={2}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox>
                        <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px', fontWeight: 600 }}>
                          {categoryLabel(payload[0].payload.categoryId)}
                        </p>
                        <p style={{ fontSize: '18px', color: '#4dd0d0', margin: 0, fontWeight: 700 }}>
                          {formatCurrency(payload[0].payload.revenue)}
                        </p>
                      </TooltipBox>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="service-stats-list">
            {data.map((c, i) => (
              <div key={i} className="service-stats-row">
                <span className="service-stats-dot" style={{ background: c.color }} />
                <span className="service-stats-name">{categoryLabel(c.categoryId)}</span>
                <span className="service-stats-count">{total > 0 ? `${Math.round((c.revenue / total) * 100)}%` : '—'}</span>
                <span className="service-stats-revenue">{formatCurrency(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  )
}
