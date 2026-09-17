import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox } from '@/shared/ui/dashboard/TooltipBox'
import type { PromotionConversionStat } from './types'

interface Props {
  data: PromotionConversionStat[]
}

const COLORS = ['#069494', '#a1887f']

export function PromotionConversionChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <DashboardCard title="Conversión de promociones y cupones">
      {total === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no hay turnos reservados en este período
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 14, fill: '#000', fontWeight: 600, fontFamily: "'Lato', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#000', fontWeight: 600 }} axisLine={false} tickLine={false} width={34} />
              <Tooltip
                cursor={{ fill: 'rgba(6,148,148,0.05)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox>
                      <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px', fontWeight: 600 }}>
                        {payload[0].payload.label}
                      </p>
                      <p style={{ fontSize: '18px', color: '#4dd0d0', margin: '0 0 2px', fontWeight: 700 }}>
                        {payload[0].payload.count} turnos
                      </p>
                      <p style={{ fontSize: '14px', color: '#fff', margin: 0, fontWeight: 600 }}>
                        {total > 0 ? `${Math.round((payload[0].payload.count / total) * 100)}%` : '—'} del total
                      </p>
                    </TooltipBox>
                  ) : null
                }
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={90}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '13px', color: '#888', margin: '10px 0 0' }}>
            {total > 0 ? `${Math.round((data[0]?.count ?? 0) / total * 100)}% de los turnos del período se reservaron con una promoción activa` : ''}
          </p>
        </>
      )}
    </DashboardCard>
  )
}
