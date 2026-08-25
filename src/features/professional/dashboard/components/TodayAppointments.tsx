import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/config/routes.config'
import { appointmentStatusConfig } from '@/features/professional/utils/appointmentStatus'
import type { Appointment } from '@/features/professional/types/appointment'

interface Props {
  appointments: Appointment[]
  primary:      string
  accent:       string
}

export function TodayAppointments({ appointments, primary, accent }: Props) {
  const navigate = useNavigate()
  const today    = appointments.filter(a => a.date === new Date().toISOString().split('T')[0])

  return (
    <div style={{
      background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px',
      padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: "'Lato', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
          Turnos de hoy
        </p>
        <button
          onClick={() => navigate(ROUTES.PROFESSIONAL_AGENDA)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: primary, fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" }}
        >
          Ver agenda →
        </button>
      </div>

      {today.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#000', padding: '24px 0', fontSize: '16px' }}>
          No tenés turnos para hoy
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {today.map(apt => {
            const cfg = appointmentStatusConfig[apt.status]
            return (
              <div key={apt.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '12px',
                border: '1px solid #f0f0f0', background: '#fafafa',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: `${primary}15`, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700, color: primary,
                }}>
                  {apt.client.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '17px', color: '#000' }}>{apt.client.name}</p>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                      background: cfg.bg, color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#000' }}>{apt.time}</span>
                    <span style={{ fontSize: '14px', color: '#000' }}>{apt.serviceName}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: accent }}>${apt.servicePrice.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}