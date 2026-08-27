import type { Appointment, Professional } from './types'

const DAYS_HEADER = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

interface Props {
  appointments:  Appointment[]
  professionals: Professional[]
  month:         Date
  onEventClick:  (a: Appointment) => void
}

export function CalendarMonth({ appointments, professionals, month, onEventClick }: Props) {
  const colorFor = (a: Appointment) =>
    professionals.find(p => p.id === a.professionalId)?.color ?? '#069494'
  const today    = new Date()
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  let startIndex = firstDay.getDay() - 1
  if (startIndex < 0) startIndex = 6

  const cells: (number | null)[] = [
    ...Array(startIndex).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const isToday = (day: number) =>
    day === today.getDate() &&
    month.getMonth()    === today.getMonth() &&
    month.getFullYear() === today.getFullYear()

  const getAppts = (day: number) =>
    appointments.filter(a => {
      const s = new Date(a.start)
      return s.getDate() === day && s.getMonth() === month.getMonth() && s.getFullYear() === month.getFullYear()
    })

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #eeeeee' }}>
        {DAYS_HEADER.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#000', padding: '10px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
          {week.map((day, di) => (
            <div key={di} style={{ minHeight: '100px', minWidth: 0, overflow: 'hidden', borderRight: di < 6 ? '1px solid #f5f5f5' : 'none', padding: '8px 6px', background: day && isToday(day) ? 'rgba(6,148,148,0.04)' : '#fff' }}>
              {day !== null && (
                <>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: isToday(day) ? 700 : 500, color: isToday(day) ? '#fff' : '#000', background: isToday(day) ? '#069494' : 'transparent', marginBottom: '6px' }}>
                    {day}
                  </div>
                  {getAppts(day).slice(0, 3).map(a => (
                    <button key={a.id} onClick={() => onEventClick(a)} title={a.comboGroupId ? `Combo — ${a.clientName} — ${a.serviceName}` : `${a.clientName} — ${a.serviceName}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', border: 'none', borderLeft: a.comboGroupId ? '2px solid #d4af37' : 'none', borderRadius: '4px', padding: '3px 6px', marginBottom: '2px', background: `${colorFor(a)}15`, cursor: 'pointer', textAlign: 'left', fontFamily: "'Lato', sans-serif" }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: colorFor(a) }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {a.clientName}
                      </span>
                    </button>
                  ))}
                  {getAppts(day).length > 3 && (
                    <div style={{ fontSize: '12px', color: '#069494', fontWeight: 700, padding: '1px 4px' }}>
                      +{getAppts(day).length - 3} más
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}