import type { Appointment } from '@/features/professional/types/appointment'
import { appointmentStatusConfig } from '@/features/professional/utils/appointmentStatus'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

interface Props {
  appointments: Appointment[]
  day:          Date
  primary:      string
  onEventClick: (a: Appointment) => void
}

export function AgendaDay({ appointments, day, primary, onEventClick }: Props) {
  const getAppts = (hour: number) =>
    appointments.filter(a => {
      const d = new Date(a.date + 'T00:00:00')
      return d.toDateString() === day.toDateString() && parseInt(a.time.split(':')[0]) === hour
    })

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {HOURS.map(hour => {
            const appts = getAppts(hour)
            return (
              <tr key={hour}>
                <td style={{ width: '52px', padding: '0 10px 0 0', textAlign: 'right', verticalAlign: 'top', paddingTop: '8px', fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
                  {String(hour).padStart(2, '0')}:00
                </td>
                <td style={{ borderTop: '1px solid #f0f0f0', padding: '4px', height: '64px', verticalAlign: 'top' }}>
                  {appts.map(a => {
                    const cfg = appointmentStatusConfig[a.status]
                    return (
                      <button
                        key={a.id}
                        onClick={() => onEventClick(a)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          width: '100%', border: 'none', borderRadius: '8px',
                          padding: '8px 12px', marginBottom: '3px',
                          background: `${primary}15`,
                          borderLeft: `3px solid ${primary}`,
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: "'Lato', sans-serif",
                        }}
                      >
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#000', flex: 1 }}>{a.client.name}</span>
                        <span style={{ fontSize: '13px', color: '#000' }}>{a.serviceName}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </button>
                    )
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}