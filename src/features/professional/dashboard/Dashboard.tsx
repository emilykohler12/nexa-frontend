import { useState, useEffect } from 'react'
import {
  Calendar, DollarSign, Users,
  Star, Percent, CheckCircle,
} from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { StatCard }           from './cards/StatCard'
import { NextClientCard }     from './cards/NextClientCard'
import { RevenueChart }       from './charts/RevenueChart'
import { TopServicesChart }   from './charts/TopServicesChart'
import { TodayAppointments }  from './components/TodayAppointments'
import type { DashboardStats, RevenuePoint } from '@/features/professional/types/dashboard'
import type { Appointment } from '@/features/professional/types/appointment'

interface TopService { name: string; count: number; revenue: number; color: string }

const EMPTY_STATS: DashboardStats = {
  todayAppointments: 0, nextClientName: null, nextClientTime: null,
  monthRevenue: 0, monthServices: 0, newClients: 0, recurringClients: 0,
  totalClients: 0, avgRating: 0, hoursWorked: 0, occupancyPercent: 0,
}

export function Dashboard() {
  const { business } = useTenant()
  const { user }     = useAuth()
  const [stats, setStats]               = useState<DashboardStats>(EMPTY_STATS)
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([])
  const [topServices, setTopServices]   = useState<TopService[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<{ stats: DashboardStats; revenueChart: RevenuePoint[]; topServices: TopService[] }>('/api/professional/dashboard'),
      api.get<{ appointments: Appointment[] }>('/api/professional/appointments'),
    ])
      .then(([dashRes, apptRes]) => {
        setStats(dashRes.data.stats ?? EMPTY_STATS)
        setRevenueChart(dashRes.data.revenueChart ?? [])
        setTopServices(dashRes.data.topServices ?? [])
        setAppointments(apptRes.data.appointments ?? [])
      })
      .catch(() => {
        setStats(EMPTY_STATS)
        setRevenueChart([])
        setTopServices([])
        setAppointments([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null

  const { primaryColor: primary, accentColor: accent } = business
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  const nextAppt = appointments
    .filter(a => a.date === new Date().toISOString().split('T')[0] && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Lato', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>
          Hola, {user?.name?.split(' ')[0] ?? 'Profesional'} 👋
        </h1>
        <p style={{ fontSize: '16px', color: '#000', margin: 0, textTransform: 'capitalize' }}>{today}</p>
      </div>

      {loading ? (
        <p style={{ color: '#000', fontSize: '16px' }}>Cargando...</p>
      ) : (
        <>
          {/* Fila 1: próximo cliente + stats principales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
            <NextClientCard
              clientName={nextAppt?.client.name ?? stats.nextClientName}
              time={nextAppt?.time ?? stats.nextClientTime}
              service={nextAppt?.serviceName ?? '—'}
              primary={primary}
              accent={accent}
            />
            <StatCard label="Turnos hoy"       value={stats.todayAppointments}  icon={Calendar}   accentColor={primary} sub="confirmados" />
            <StatCard label="Ingresos del mes" value={`$${(stats.monthRevenue / 1000).toFixed(0)}k`} icon={DollarSign} accentColor={accent} sub="facturado" />
            <StatCard label="Servicios"        value={stats.monthServices}       icon={CheckCircle} accentColor="#7986cb" sub="este mes" />
          </div>

          {/* Fila 2: más stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <StatCard label="Clientes nuevos"    value={stats.newClients}        icon={Users}      accentColor="#4db6ac" sub="este mes" />
            <StatCard label="Clientes recurrentes" value={stats.recurringClients} icon={Users}     accentColor="#a1887f" sub="este mes" />
            <StatCard label="Calificación"       value={`⭐ ${stats.avgRating}`}  icon={Star}       accentColor={accent}  sub="promedio" />
            <StatCard label="Ocupación"          value={`${stats.occupancyPercent}%`} icon={Percent} accentColor={primary} sub="este mes" />
          </div>

          {/* Fila 3: turnos hoy + gráfico de ingresos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <TodayAppointments appointments={appointments} primary={primary} accent={accent} />
            <RevenueChart data={revenueChart} primary={primary} accent={accent} />
          </div>

          {/* Fila 4: servicios más realizados */}
          <TopServicesChart data={topServices} />
        </>
      )}

    </div>
  )
}
