import type { Appointment, Professional } from './types'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

interface Props {
  appointments:  Appointment[]
  professionals: Professional[]
  day:           Date
  onEventClick:  (a: Appointment) => void
}

export function CalendarDay({ appointments, professionals, day, onEventClick }: Props) {
  const colorFor = (a: Appointment) =>
    professionals.find(p => p.id === a.professionalId)?.color ?? '#069494'
  const getAppts = (hour: number) =>
    appointments.filter(a => {
      const s = new Date(a.start)
      return (
        s.getDate()     === day.getDate()     &&
        s.getMonth()    === day.getMonth()    &&
        s.getFullYear() === day.getFullYear() &&
        s.getHours()    === hour
      )
    })

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {HOURS.map(hour => {
            const appts = getAppts(hour)
            return (
              <tr key={hour}>
                <td style={{
                  width: '60px', padding: '0 12px 0 0',
                  textAlign: 'right', verticalAlign: 'top',
                  paddingTop: '10px', fontSize: '14px', color: '#000',
                  whiteSpace: 'nowrap', fontWeight: 500,
                }}>
                  {String(hour).padStart(2, '0')}:00
                </td>
                <td style={{ borderTop: '1px solid #f0f0f0', padding: '4px', height: '64px', verticalAlign: 'top' }}>
                  {appts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => onEventClick(a)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', border: 'none', borderRadius: '6px',
                        padding: '7px 12px', marginBottom: '3px',
                        background: `${colorFor(a)}22`,
                        borderLeft: `3px solid ${colorFor(a)}`,
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: "'Lato', sans-serif",
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#000', flex: 1 }}>
                        {a.clientName}
                      </span>
                      <span style={{ fontSize: '14px', color: '#000', fontWeight: 500 }}>{a.serviceName}</span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: colorFor(a) }} />
                    </button>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}