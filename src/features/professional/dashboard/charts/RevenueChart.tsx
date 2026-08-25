import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { RevenuePoint } from '@/features/professional/types/dashboard'

interface Props {
  data:    RevenuePoint[]
  primary: string
  accent:  string
}

export function RevenueChart({ data, primary, accent }: Props) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px',
      padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: "'Lato', sans-serif",
    }}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
        Ingresos del mes
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primary} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#888', fontFamily: "'Lato', sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#aaa', fontFamily: "'Lato', sans-serif" }} axisLine={false} tickLine={false} width={44}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '10px 14px', fontFamily: "'Lato', sans-serif" }}>
                  <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: accent, margin: 0 }}>
                    ${(payload[0].value as number).toLocaleString('es-AR')}
                  </p>
                </div>
              ) : null
            }
          />
          <Area type="monotone" dataKey="revenue" stroke={primary} strokeWidth={2.5}
            fill="url(#profRevGrad)" dot={{ fill: primary, r: 3 }} activeDot={{ r: 6, fill: primary, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}