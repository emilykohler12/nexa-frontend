import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox } from '@/shared/ui/dashboard/TooltipBox'
import type { HeatmapRow } from './types'

interface Props {
  data: HeatmapRow[]
}

const SERIES = [
  { key: 'morning',   label: 'Mañana', color: '#069494' },
  { key: 'afternoon', label: 'Siesta', color: '#d4af37' },
  { key: 'evening',   label: 'Tarde',  color: '#e57373' },
] as const

const axisTick = { fontSize: 13, fill: '#000', fontWeight: 600, fontFamily: "'Lato', sans-serif" }

export function PeakHoursHeatmap({ data }: Props) {
  const hasData = data.some(row => row.morning + row.afternoon + row.evening > 0)

  return (
    <DashboardCard title="Mis horas pico y días más concurridos">
      {!hasData ? (
        <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
          Todavía no tenés turnos registrados
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '480px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
                <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                <Legend wrapperStyle={{ fontSize: '13px', fontFamily: "'Lato', sans-serif", fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(6,148,148,0.05)' }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipBox>
                        <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
                        {payload.map((entry, i) => (
                          <p key={i} style={{ fontSize: '14px', color: entry.color, margin: '0 0 2px', fontWeight: 700 }}>
                            {SERIES.find(s => s.key === entry.dataKey)?.label}: {entry.value} turnos
                          </p>
                        ))}
                      </TooltipBox>
                    ) : null
                  }
                />
                {SERIES.map(s => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardCard>
  )
}
