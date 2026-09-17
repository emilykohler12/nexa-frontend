import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { formatCurrency } from '@/shared/utils/format'
import { ServiceStatsTable } from './ServiceStatsTable'
import { PeakHoursHeatmap } from './PeakHoursHeatmap'
import type { ProfessionalDashboardData } from './types'

type PeriodFilter = 'day' | 'week' | 'month' | 'year'

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: 'day',   label: 'Hoy'    },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes'    },
  { key: 'year',  label: 'Año'    },
]

const PERIOD_SUB: Record<PeriodFilter, string> = {
  day: 'hoy', week: 'esta semana', month: 'este mes', year: 'este año',
}

const EMPTY_DATA: ProfessionalDashboardData = {
  futureConfirmedAppointments: 0,
  hoursWorked: 0,
  occupancyPercent: 0,
  totalRevenue: 0,
  avgRating: 0,
  serviceStats: [],
  heatmap: [],
}

export function Statistics() {
  const { business } = useTenant()
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const [data, setData] = useState<ProfessionalDashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<{ dashboard: ProfessionalDashboardData }>('/api/professional/dashboard', { params: { period } })
      .then(res => setData(res.data.dashboard ?? EMPTY_DATA))
      .catch(() => setData(EMPTY_DATA))
      .finally(() => setLoading(false))
  }, [period])

  if (!business) return null
  const { primaryColor: primary, accentColor: accent } = business

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px', fontFamily: 'var(--font-playfair)' }}>Estadísticas</h1>
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
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {[
              { label: 'Turnos futuros',   value: String(data.futureConfirmedAppointments), color: primary,   sub: `confirmados con seña pagada, ${PERIOD_SUB[period]}` },
              { label: 'Horas trabajadas', value: data.hoursWorked.toLocaleString('es-AR'),  color: '#7986cb', sub: `turnos finalizados, ${PERIOD_SUB[period]}` },
              { label: 'Ocupación',        value: `${data.occupancyPercent.toLocaleString('es-AR')}%`, color: '#4db6ac', sub: `de tu agenda, ${PERIOD_SUB[period]}` },
              { label: 'Dinero ganado',    value: formatCurrency(data.totalRevenue),         color: accent,    sub: `servicios realizados, ${PERIOD_SUB[period]}` },
              { label: 'Calificación',     value: `⭐ ${data.avgRating}`,                     color: '#d4af37', sub: 'promedio histórico de clientes' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.color }} />
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#000', margin: 0, fontFamily: "'Lato', sans-serif" }}>{kpi.value}</p>
                <p style={{ fontSize: '12px', color: '#000', margin: '4px 0 0', fontFamily: "'Lato', sans-serif" }}>{kpi.label}</p>
                <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0', fontFamily: "'Lato', sans-serif" }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráficos */}
          <ServiceStatsTable data={data.serviceStats} />
          <PeakHoursHeatmap data={data.heatmap} />
        </>
      )}
    </div>
  )
}
