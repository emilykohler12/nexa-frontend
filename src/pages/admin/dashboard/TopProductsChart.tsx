import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox } from '@/shared/ui/dashboard/TooltipBox'
import { formatCurrency, formatCurrencyCompact } from '@/shared/utils/format'
import type { TopProductStat } from './types'

interface Props {
  data: TopProductStat[]
}

const MAX_LABEL = 16
const truncate = (name: string) => name.length > MAX_LABEL ? `${name.slice(0, MAX_LABEL - 1)}…` : name

function YAxisTick({ x, y, payload }: any) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={13} fontWeight={600} fill="#000">
      {truncate(payload.value)}
    </text>
  )
}

export function TopProductsChart({ data }: Props) {
  return (
    <DashboardCard title="Productos más vendidos">
      {data.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no hay ventas de productos en este período
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(140, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#000', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={104} tick={<YAxisTick />} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(6,148,148,0.05)' }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox>
                    <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px', fontWeight: 600 }}>
                      {payload[0].payload.name}
                    </p>
                    <p style={{ fontSize: '18px', color: '#4dd0d0', margin: '0 0 2px', fontWeight: 700 }}>
                      {payload[0].payload.quantity} unidades
                    </p>
                    <p style={{ fontSize: '14px', color: '#fff', margin: 0, fontWeight: 600 }}>
                      {formatCurrency(payload[0].payload.revenue)}
                    </p>
                  </TooltipBox>
                ) : null
              }
            />
            <Bar dataKey="quantity" radius={[0, 6, 6, 0]} barSize={18} label={{ position: 'right', fontSize: 12, fontWeight: 700, fill: '#000', formatter: (v: any) => v }}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <p style={{ fontSize: '13px', color: '#888', margin: '10px 0 0' }}>
        Unidades vendidas por producto {data.length > 0 && `· ${formatCurrencyCompact(data.reduce((s, p) => s + p.revenue, 0))} en total`}
      </p>
    </DashboardCard>
  )
}
