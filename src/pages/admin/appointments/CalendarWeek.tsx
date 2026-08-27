import type { Appointment, Professional } from './types'
import { groupByCombo } from '@/shared/utils/comboGroup'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

interface Props {
  appointments:  Appointment[]
  professionals: Professional[]
  weekStart:     Date
  onEventClick:  (a: Appointment) => void
}

export function CalendarWeek({ appointments, professionals, weekStart, onEventClick }: Props) {
  const colorFor = (a: Appointment) =>
    professionals.find(p => p.id === a.professionalId)?.color ?? '#069494'
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  const today   = new Date()
  const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

  const getAppts = (day: Date, hour: number) =>
    appointments.filter(a => {
      const s = new Date(a.start)
      return s.getDate() === day.getDate() && s.getMonth() === day.getMonth() && s.getFullYear() === day.getFullYear() && s.getHours() === hour
    })

  return (
    <div style={{ overflowX: 'auto', fontFamily: "'Lato', sans-serif" }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '60px' }} />
          {days.map((_, i) => <col key={i} style={{ width: '14.28%' }} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ padding: '8px 0' }} />
            {days.map((day, i) => (
              <th key={i} style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 700, fontSize: '14px', borderBottom: '2px solid #eeeeee', background: isToday(day) ? 'rgba(6,148,148,0.04)' : '#fafafa' }}>
                <div style={{ fontSize: '13px', color: isToday(day) ? '#069494' : '#000', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{DAYS[i]}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, width: '32px', height: '32px', borderRadius: '50%', background: isToday(day) ? '#069494' : 'transparent', color: isToday(day) ? '#fff' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  {day.getDate()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td style={{ padding: '0 10px 0 4px', textAlign: 'right', fontSize: '14px', color: '#000', fontWeight: 500, verticalAlign: 'top', paddingTop: '8px', whiteSpace: 'nowrap' }}>
                {String(hour).padStart(2, '0')}:00
              </td>
              {days.map((day, di) => {
                const appts = getAppts(day, hour)
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
                        {group.items.map(a => (
                          <button key={a.id} onClick={() => onEventClick(a)} title={`${a.clientName} — ${a.serviceName}`}
                            style={{ display: 'block', width: '100%', background: colorFor(a), color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 7px', fontSize: '13px', fontWeight: 700, fontFamily: "'Lato', sans-serif", textAlign: 'left', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px', transition: 'opacity 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            {a.clientName}
                          </button>
                        ))}
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