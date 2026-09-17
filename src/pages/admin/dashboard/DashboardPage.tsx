import { useState, useEffect } from 'react'
import { DollarSign, CalendarCheck2, UserPlus, Percent, CalendarX2, Repeat, Wallet, Undo2 } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { formatCurrency } from '@/shared/utils/format'
import { KpiCard } from './KpiCard'
import { TopProductsChart } from './TopProductsChart'
import { RevenueByCategoryChart } from './RevenueByCategoryChart'
import { PeakHoursHeatmap } from './PeakHoursHeatmap'
import { PromotionConversionChart } from './PromotionConversionChart'
import { ServiceProfitabilityTable } from './ServiceProfitabilityTable'
import { ProfessionalPerformanceTable } from './ProfessionalPerformanceTable'
import type { PeriodFilter, DashboardData } from './types'

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: 'day',   label: 'Hoy'    },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes'    },
  { key: 'year',  label: 'Año'    },
]

const EMPTY_DASHBOARD_DATA: DashboardData = {
  depositRevenueTotal: 0,
  attendedAppointments: 0,
  newClients: 0,
  occupancyPercent: 0,
  topProducts: [],
  categoryRevenue: [],
  heatmap: [],
  promotionConversion: [],
  serviceProfitability: [],
  professionalPerformance: [],
  noShowAppointments: 0,
  returningClients: 0,
  returningWindowDays: 30,
  pendingBalance: 0,
  refundedDeposits: 0,
}

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const [data, setData]     = useState<DashboardData>(EMPTY_DASHBOARD_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<{ dashboard: DashboardData }>('/api/admin/dashboard', { params: { period } })
      .then(res => setData(res.data.dashboard ?? EMPTY_DASHBOARD_DATA))
      .catch(() => setData(EMPTY_DASHBOARD_DATA))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '24px',
      fontFamily: "'Lato', sans-serif",
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>Dashboard</h1>
          <p style={{ fontSize: '17px', color: '#000', margin: 0 }}>Métricas y rendimiento del negocio</p>
        </div>
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {PERIOD_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                padding: '7px 18px', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Lato', sans-serif",
                background: period === key ? '#069494' : 'transparent',
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
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#000', fontSize: '17px' }}>Cargando métricas...</p>
      ) : (
        <>
          {/* KPIs superiores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <KpiCard label="Ingresos por señas confirmadas" value={formatCurrency(data.depositRevenueTotal)} icon={<DollarSign size={18} />} accentColor="#069494" />
            <KpiCard label="Turnos asistidos"                value={String(data.attendedAppointments)}      icon={<CalendarCheck2 size={18} />} accentColor="#d4af37" />
            <KpiCard label="Clientes nuevos"                 value={String(data.newClients)}                 icon={<UserPlus size={18} />}       accentColor="#7986cb" />
            <KpiCard label="Ocupación de agenda"             value={`${data.occupancyPercent.toLocaleString('es-AR')}%`} icon={<Percent size={18} />} accentColor="#4db6ac" />
          </div>

          {/* Gráficos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            <TopProductsChart data={data.topProducts} />
            <RevenueByCategoryChart data={data.categoryRevenue} />
            <PromotionConversionChart data={data.promotionConversion} />
          </div>

          <PeakHoursHeatmap data={data.heatmap} />

          {/* Tablas */}
          <ServiceProfitabilityTable data={data.serviceProfitability} />
          <ProfessionalPerformanceTable data={data.professionalPerformance} />

          {/* KPIs inferiores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <KpiCard label="Turnos no asistidos" value={String(data.noShowAppointments)} icon={<CalendarX2 size={18} />} accentColor="#e53935" />
            <KpiCard
              label="Clientes que volvieron a agendar"
              value={String(data.returningClients)}
              icon={<Repeat size={18} />}
              accentColor="#069494"
              sublabel={`Dentro de los ${data.returningWindowDays} días`}
            />
            <KpiCard label="Saldo pendiente a cobrar en local" value={formatCurrency(data.pendingBalance)} icon={<Wallet size={18} />} accentColor="#d4af37" />
            <KpiCard label="Señas reembolsadas" value={String(data.refundedDeposits)} icon={<Undo2 size={18} />} accentColor="#a1887f" />
          </div>
        </>
      )}

    </div>
  )
}
