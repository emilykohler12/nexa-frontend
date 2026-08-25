import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'

interface MonthlyRevenuePoint { label: string; revenue: number; services: number }
interface TopService { name: string; count: number; revenue: number; color: string }
interface PeakHour { hour: string; count: number }

type PeriodFilter = 'day' | 'week' | 'month' | 'year'

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: 'day',   label: 'Hoy'    },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes'    },
  { key: 'year',  label: 'Año'    },
]

const PERIOD_KPI_LABEL: Record<PeriodFilter, string> = {
  day: 'Facturación de hoy', week: 'Facturación de la semana',
  month: 'Facturación del mes', year: 'Facturación del año',
}

interface ProfessionalStatistics {
  monthRevenue:      number
  monthServices:     number
  totalClients:      number
  avgRating:         number
  hoursWorked:       number
  occupancyPercent:  number
  monthlyRevenue:    MonthlyRevenuePoint[]
  topServices:       TopService[]
  peakHours:         PeakHour[]
}

const EMPTY_STATS: ProfessionalStatistics = {
  monthRevenue: 0, monthServices: 0, totalClients: 0, avgRating: 0,
  hoursWorked: 0, occupancyPercent: 0,
  monthlyRevenue: [], topServices: [], peakHours: [],
}

export function Statistics() {
  const { business } = useTenant()
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const [stats, setStats] = useState<ProfessionalStatistics>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<{ statistics: ProfessionalStatistics }>('/api/professional/statistics', { params: { period } })
      .then(res => setStats(res.data.statistics ?? EMPTY_STATS))
      .catch(() => setStats(EMPTY_STATS))
      .finally(() => setLoading(false))
  }, [period])

  if (!business) return null
  const { primaryColor: primary, accentColor: accent } = business

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px', padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', fontFamily: "'Lato', sans-serif" }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px' }}>{title}</p>
      {children}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Estadísticas</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Tu rendimiento y actividad</p>
        </div>
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {PERIOD_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                padding: '7px 18px', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600,
                fontFamily: "'Lato', sans-serif",
                background: period === key ? primary : 'transparent',
                color: period === key ? '#fff' : '#000',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#000', fontSize: '16px' }}>Cargando estadísticas...</p>
      ) : (
        <>
          {/* KPIs rápidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {[
              { label: PERIOD_KPI_LABEL[period], value: `$${(stats.monthRevenue / 1000).toFixed(0)}k`, color: primary },
              { label: 'Servicios realizados',  value: stats.monthServices,                            color: accent  },
              { label: 'Clientes únicos',       value: stats.totalClients,                             color: '#7986cb' },
              { label: 'Calificación promedio', value: `⭐ ${stats.avgRating}`,                        color: '#d4af37' },
              { label: 'Horas trabajadas',      value: stats.hoursWorked,                              color: '#4db6ac' },
              { label: 'Ocupación',             value: `${stats.occupancyPercent}%`,                   color: '#a1887f' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.color }} />
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#000', margin: 0, fontFamily: "'Lato', sans-serif" }}>{kpi.value}</p>
                <p style={{ fontSize: '12px', color: '#000', margin: '4px 0 0', fontFamily: "'Lato', sans-serif" }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Ingresos por período */}
          <Card title="Ingresos por período">
            {stats.monthlyRevenue.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '40px 0' }}>Todavía no hay datos de ingresos</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="statsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={primary} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px' }}>{label}</p>
                      <p style={{ fontSize: '17px', fontWeight: 700, color: accent, margin: 0 }}>${(payload[0].value as number).toLocaleString('es-AR')}</p>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="revenue" stroke={primary} strokeWidth={2.5} fill="url(#statsGrad)" dot={{ fill: primary, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Servicios más realizados */}
            <Card title="Servicios más realizados">
              {stats.topServices.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '20px 0' }}>Sin datos todavía</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.topServices.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '14px', color: '#000' }}>{s.name}</span>
                      <span style={{ fontSize: '13px', color: '#000' }}>{s.count} turnos</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>${(s.revenue / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Horarios pico */}
            <Card title="Horarios con mayor demanda">
              {stats.peakHours.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '20px 0' }}>Sin datos todavía</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.peakHours} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} width={20} />
                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                      <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '8px 12px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: accent, margin: 0 }}>{payload[0].value} turnos</p>
                      </div>
                    ) : null} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                      {stats.peakHours.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? primary : accent} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
