import { CalendarClock } from 'lucide-react'
import type { Appointment } from '@/features/professional/types/appointment'
import { appointmentStatusConfig } from '@/features/professional/utils/appointmentStatus'
import { groupByCombo } from '@/shared/utils/comboGroup'

export interface SpecialAssignment {
  serviceId:   string
  serviceName: string
  time:        string
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

interface Props {
  appointments: Appointment[]
  day:          Date
  primary:      string
  onEventClick: (a: Appointment) => void
  specialAssignments?: SpecialAssignment[]
}

export function AgendaDay({ appointments, day, primary, onEventClick, specialAssignments = [] }: Props) {
  const getAppts = (hour: number) =>
    appointments.filter(a => {
      const d = new Date(a.date + 'T00:00:00')
      return d.toDateString() === day.toDateString() && parseInt(a.time.split(':')[0]) === hour
    })

  const getSpecial = (hour: number) =>
    specialAssignments.filter(sa => parseInt(sa.time.split(':')[0]) === hour)

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {HOURS.map(hour => {
            const appts = getAppts(hour)
            const special = getSpecial(hour)
            return (
              <tr key={hour}>
                <td style={{ width: '52px', padding: '0 10px 0 0', textAlign: 'right', verticalAlign: 'top', paddingTop: '8px', fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>
                  {String(hour).padStart(2, '0')}:00
                </td>
                <td style={{ borderTop: '1px solid #f0f0f0', padding: '4px', height: '64px', verticalAlign: 'top' }}>
                  {groupByCombo(appts).map((group, gi) => (
                    <div
                      key={group.comboGroupId ?? gi}
                      style={group.items.length > 1 ? { border: '1px dashed #d4af37', borderRadius: '10px', padding: '3px', marginBottom: '3px' } : undefined}
                    >
                      {group.items.length > 1 && (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#8a6800', padding: '0 4px 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Combo</div>
                      )}
                      {group.items.map(a => {
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
                    </div>
                  ))}
                  {special.map((sa, si) => (
                    <div
                      key={`special-${si}`}
                      title="Horario reservado para este servicio — todavía no lo reservó ningún cliente"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', borderRadius: '8px',
                        padding: '8px 12px', marginBottom: '3px',
                        background: 'repeating-linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.08) 6px, rgba(212,175,55,0.14) 6px, rgba(212,175,55,0.14) 12px)',
                        border: '1px dashed #d4af37',
                      }}
                    >
                      <CalendarClock size={14} color="#8a6800" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#8a6800', flex: 1 }}>{sa.serviceName}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#8a6800' }}>{sa.time} · sin reservar</span>
                    </div>
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