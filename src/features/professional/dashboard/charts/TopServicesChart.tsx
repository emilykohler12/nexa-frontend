import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; count: number; revenue: number; color: string }[]
}

export function TopServicesChart({ data }: Props) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px',
      padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: "'Lato', sans-serif",
    }}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>
        Servicios más realizados
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#555' }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '10px 14px', fontFamily: "'Lato', sans-serif" }}>
                  <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px' }}>{payload[0].payload.name}</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: payload[0].payload.color, margin: 0 }}>{payload[0].value} turnos</p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}