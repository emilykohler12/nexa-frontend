import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox, TooltipLine } from '@/shared/ui/dashboard/TooltipBox'
import { formatCurrency, formatCurrencyCompact } from '@/shared/utils/format'
import type { RevenueDataPoint } from './types'

interface Props {
  data: RevenueDataPoint[]
  title: string
}

const axisTick      = { fontSize: 14, fill: '#000', fontWeight: 600, fontFamily: "'Lato', sans-serif" }
const axisTickSmall = { fontSize: 13, fill: '#000', fontWeight: 600, fontFamily: "'Lato', sans-serif" }

export function RevenueChart({ data, title }: Props) {
  return (
    <DashboardCard title={title}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#069494" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#069494" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCurrencyCompact} tick={axisTickSmall} axisLine={false} tickLine={false} width={56} />
          <Tooltip
            cursor={{ stroke: '#069494', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox>
                  <TooltipLine label={String(label)} value={formatCurrency(payload[0].value as number)} color="#4dd0d0" />
                </TooltipBox>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#069494"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: '#069494', r: 3 }}
            activeDot={{ r: 6, fill: '#069494', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </DashboardCard>
  )
}

export function AppointmentsChart({ data, title }: Props) {
  return (
    <DashboardCard title={title}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#d4af37" stopOpacity={1}   />
              <stop offset="100%" stopColor="#b8960c" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickSmall} axisLine={false} tickLine={false} width={38} />
          <Tooltip
            cursor={{ fill: 'rgba(212,175,55,0.08)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox>
                  <TooltipLine label={String(label)} value={`${payload[0].value} turnos`} color="#d4af37" />
                </TooltipBox>
              ) : null
            }
          />
          <Bar
            dataKey="appointments"
            fill="url(#appointmentGradient)"
            radius={[5, 5, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </DashboardCard>
  )
}