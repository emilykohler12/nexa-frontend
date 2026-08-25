import { useState, useEffect } from 'react'
import { DollarSign, CalendarDays, Users, TrendingUp } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { KpiCard } from './KpiCard'
import { RevenueChart, AppointmentsChart } from './RevenueChart'
import { ProfessionalStats } from './ProfessionalStats'
import { StatusAndPayments } from './StatusAndPayments'
import type { PeriodFilter, DashboardData } from './types'

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: 'day',   label: 'Hoy'    },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes'    },
  { key: 'year',  label: 'Año'    },
]

const EMPTY_DASHBOARD_DATA: DashboardData = {
  totalRevenue: 0, prevRevenue: 0,
  totalAppointments: 0, prevAppointments: 0,
  newClients: 0, prevNewClients: 0,
  avgTicket: 0, prevAvgTicket: 0,
  revenueChart: [],
  serviceStats: [],
  professionalStats: [],
  appointmentStatus: [],
  paymentStats: [],
}

const pct = (current: number, prev: number) =>
  prev === 0 ? 0 : ((current - prev) / prev) * 100

const money = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(0)}k`
  : `$${n}`

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
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Métricas y rendimiento del negocio</p>
        </div>
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          {PERIOD_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              style={{
                padding: '7px 18px', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
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
        <p style={{ fontFamily: "'Lato', sans-serif", color: '#000', fontSize: '16px' }}>Cargando métricas...</p>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <KpiCard label="Ingresos"        value={money(data.totalRevenue)}     prev={money(data.prevRevenue)}          changePercent={pct(data.totalRevenue, data.prevRevenue)}         icon={<DollarSign size={18} />}  accentColor="#069494" />
            <KpiCard label="Turnos"          value={String(data.totalAppointments)} prev={String(data.prevAppointments)} changePercent={pct(data.totalAppointments, data.prevAppointments)} icon={<CalendarDays size={18} />} accentColor="#d4af37" />
            <KpiCard label="Clientes nuevos" value={String(data.newClients)}       prev={String(data.prevNewClients)}     changePercent={pct(data.newClients, data.prevNewClients)}           icon={<Users size={18} />}       accentColor="#7986cb" />
            <KpiCard label="Ticket promedio" value={money(data.avgTicket)}         prev={money(data.prevAvgTicket)}       changePercent={pct(data.avgTicket, data.prevAvgTicket)}             icon={<TrendingUp size={18} />}  accentColor="#a1887f" />
          </div>

          {/* Gráficos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <RevenueChart      data={data.revenueChart} title="Ingresos por período" />
            <AppointmentsChart data={data.revenueChart} title="Turnos por período"   />
          </div>

          {/* Estado turnos + señas + servicios */}
          <StatusAndPayments
            statusData={data.appointmentStatus}
            paymentData={data.paymentStats}
            serviceData={data.serviceStats}
          />

          {/* Profesionales */}
          <ProfessionalStats data={data.professionalStats} />
        </>
      )}

    </div>
  )
}
