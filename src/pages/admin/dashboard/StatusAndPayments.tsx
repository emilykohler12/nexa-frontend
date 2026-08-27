import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardCard } from '@/shared/ui/dashboard/DashboardCard'
import { TooltipBox, TooltipLine } from '@/shared/ui/dashboard/TooltipBox'
import { formatCurrency } from '@/shared/utils/format'
import { ServiceStats } from './ServiceStats'
import type { AppointmentStatusStat, PaymentStat, ServiceStat } from './types'
import './dashboard.css'

interface Props {
  statusData: AppointmentStatusStat[]
  paymentData: PaymentStat[]
  serviceData: ServiceStat[]
}

export function StatusAndPayments({ statusData, paymentData, serviceData }: Props) {
  const totalAppointments = statusData.reduce((s, x) => s + x.count, 0)
  const totalPayments     = paymentData.reduce((s, x) => s + x.amount, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>

      {/* Estado de turnos */}
      <DashboardCard title="Estado de turnos">
        {statusData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
            Todavía no hay turnos registrados
          </p>
        ) : (
        <div className="status-payments-layout">
          <div className="status-payments-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="count" paddingAngle={2}>
                  {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <TooltipBox>
                        <TooltipLine
                          label={payload[0].payload.label}
                          value={`${payload[0].payload.count} turnos`}
                          color={payload[0].payload.color}
                        />
                      </TooltipBox>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="status-payments-list">
            {statusData.map((s, i) => (
              <div key={i} className="status-payments-row">
                <span className="status-payments-dot" style={{ background: s.color }} />
                <span className="status-payments-label">{s.label}</span>
                <span className="status-payments-count">{s.count}</span>
                <span className="status-payments-percent">
                  {totalAppointments > 0 ? `${Math.round((s.count / totalAppointments) * 100)}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
        )}
      </DashboardCard>

      {/* Estado de señas */}
      <DashboardCard title="Estado de señas">
        {paymentData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#000', fontSize: '15px', padding: '24px 0', margin: 0 }}>
            Todavía no hay señas registradas
          </p>
        ) : (
        <div className="status-payments-bars">
          {paymentData.map((p, i) => {
            const percent = totalPayments > 0 ? p.amount / totalPayments : 0
            return (
              <div key={i} className="status-payments-bar-row">
                <div className="status-payments-bar-header">
                  <span style={{ color: '#000', fontWeight: 700, fontSize: '16px' }}>{p.label}</span>
                  <span className="status-payments-amount">{formatCurrency(p.amount)}</span>
                </div>
                <div className="status-payments-bar-track">
                  <div className="status-payments-bar-fill" style={{ background: p.color, width: `${Math.round(percent * 100)}%` }} />
                </div>
              </div>
            )
          })}
          <div className="status-payments-total">
            <span style={{ color: '#000', fontWeight: 700, fontSize: '17px' }}>Total señas</span>
            <span className="status-payments-total-amount">{formatCurrency(totalPayments)}</span>
          </div>
        </div>
        )}
      </DashboardCard>

      {/* Servicios más realizados */}
      <ServiceStats data={serviceData} />

    </div>
  )
}