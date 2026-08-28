import { CalendarClock } from 'lucide-react'
import type { Appointment } from '@/features/professional/types/appointment'
import { appointmentStatusConfig } from '@/features/professional/utils/appointmentStatus'
import { groupByCombo } from '@/shared/utils/comboGroup'
import type { SpecialAssignment } from './AgendaDay'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)
const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface Props {
  appointments: Appointment[]
  weekStart:    Date
  primary:      string
  onEventClick: (a: Appointment) => void
  getSpecialAssignments?: (date: string) => SpecialAssignment[]
}

export function AgendaWeek({ appointments, weekStart, primary, onEventClick, getSpecialAssignments }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  const today = new Date()
  const isToday = (d: Date) => d.toDateString() === today.toDateString()

  const getAppts = (day: Date, hour: number) =>
    appointments.filter(a => {
      const d = new Date(a.date + 'T00:00:00')
      return d.toDateString() === day.toDateString() && parseInt(a.time.split(':')[0]) === hour
    })

  const getSpecial = (day: Date, hour: number) =>
    (getSpecialAssignments?.(toISODate(day)) ?? []).filter(sa => parseInt(sa.time.split(':')[0]) === hour)

  return (
    <div style={{ overflowX: 'auto', fontFamily: "'Lato', sans-serif" }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '52px' }} />
          {days.map((_, i) => <col key={i} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ padding: '8px 0' }} />
            {days.map((day, i) => (
              <th key={i} style={{ padding: '10px 4px', textAlign: 'center', borderBottom: '2px solid #eeeeee', background: isToday(day) ? 'rgba(6,148,148,0.04)' : '#fafafa' }}>
                <div style={{ fontSize: '11px', color: isToday(day) ? primary : '#999', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{DAYS[i]}</div>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: isToday(day) ? primary : 'transparent', color: isToday(day) ? '#fff' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '16px', fontWeight: 700 }}>
                  {day.getDate()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td style={{ padding: '0 8px 0 4px', textAlign: 'right', fontSize: '12px', color: '#aaa', verticalAlign: 'top', paddingTop: '6px', whiteSpace: 'nowrap' }}>
                {String(hour).padStart(2, '0')}:00
              </td>
              {days.map((day, di) => {
                const appts = getAppts(day, hour)
                const special = getSpecial(day, hour)
                return (
                  <td key={di} style={{ borderTop: '1px solid #f0f0f0', borderLeft: '1px solid #f5f5f5', padding: '3px', verticalAlign: 'top', height: '56px', background: isToday(day) ? 'rgba(6,148,148,0.02)' : '#fff' }}>
                    {groupByCombo(appts).map((group, gi) => (
                      <div
                        key={group.comboGroupId ?? gi}
                        style={group.items.length > 1 ? { border: '1px dashed #d4af37', borderRadius: '6px', padding: '2px', marginBottom: '2px' } : undefined}
                      >
                        {group.items.length > 1 && (
                          <div style={{ fontSize: '9px', fontWeight: 700, color: '#8a6800', padding: '0 2px 1px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Combo</div>
                        )}
                        {group.items.map(a => {
                          const cfg = appointmentStatusConfig[a.status]
                          return (
                            <button
                              key={a.id}
                              onClick={() => onEventClick(a)}
                              title={`${a.client.name} — ${a.serviceName}`}
                              style={{
                                display: 'block', width: '100%', border: 'none', borderRadius: '5px',
                                padding: '4px 7px', fontSize: '12px', fontWeight: 600,
                                fontFamily: "'Lato', sans-serif",
                                textAlign: 'left', cursor: 'pointer', marginBottom: '2px',
                                background: cfg.bg, color: cfg.color,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}
                            >
                              {a.time} {a.serviceName}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                    {special.map((sa, si) => (
                      <div
                        key={`special-${si}`}
                        title={`${sa.serviceName} — sin reservar todavía`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          borderRadius: '5px', padding: '4px 6px', marginBottom: '2px',
                          background: 'repeating-linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.1) 5px, rgba(212,175,55,0.16) 5px, rgba(212,175,55,0.16) 10px)',
                          border: '1px dashed #d4af37',
                          overflow: 'hidden',
                        }}
                      >
                        <CalendarClock size={11} color="#8a6800" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#8a6800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sa.time} {sa.serviceName}
                        </span>
                      </div>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}