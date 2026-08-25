// src/features/professional/onboarding/steps/ScheduleStep.tsx
import { useTenant }   from '@/features/tenant/TenantContext'
import { WEEK_DAYS, WEEK_DAY_LABEL, generateSlots } from '../types'
import type { WeeklyAvailability, WeekDay, DayRange } from '../types'
import './ScheduleStep.css'

interface Props {
  availability: WeeklyAvailability
  onChange: (a: WeeklyAvailability) => void
}

export function ScheduleStep({ availability, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'
  const accent  = business?.accentColor  ?? '#d4af37'

  const toggle = (day: WeekDay) => {
    onChange({ ...availability, [day]: availability[day] ? null : { start: '09:00', end: '18:00' } })
  }

  const update = (day: WeekDay, field: keyof DayRange, value: string) => {
    const range = availability[day]
    if (!range) return
    onChange({ ...availability, [day]: { ...range, [field]: value } })
  }

  return (
    <div className="schedule-step">
      <p className="schedule-step-info" style={{ background: `${primary}12`, color: primary }}>
        Marcá los días que trabajás y definí tu rango de horario. El sistema genera los turnos cada 2 horas automáticamente.
      </p>

      {WEEK_DAYS.map(day => {
        const range  = availability[day]
        const active = range !== null
        const slots  = active ? generateSlots(range!) : []

        return (
          <div
            key={day}
            className={`schedule-day-card ${active ? 'active' : ''}`}
            style={{ borderColor: active ? primary : '#e0e0e0' }}
          >
            <div
              className="schedule-day-header"
              onClick={() => toggle(day)}
              style={{ background: active ? `${primary}08` : '#fff' }}
            >
              <div className="schedule-day-check-row">
                <div
                  className="schedule-day-checkbox"
                  style={{
                    borderColor: active ? primary : '#e0e0e0',
                    background:  active ? primary : 'transparent',
                  }}
                >
                  {active && <span className="schedule-day-checkmark">✓</span>}
                </div>
                <span
                  className="schedule-day-name"
                  style={{ color: active ? primary : '#999', fontWeight: active ? 700 : 400 }}
                >
                  {WEEK_DAY_LABEL[day]}
                </span>
              </div>
              {active && slots.length > 0 && (
                <span className="schedule-day-slots-count">
                  {slots.length} turno{slots.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {active && range && (
              <div className="schedule-day-body">
                <div className="schedule-time-row">
                  <label className="schedule-time-label">Desde</label>
                  <input
                    type="time"
                    value={range.start}
                    onChange={e => update(day, 'start', e.target.value)}
                    className="schedule-time-input"
                  />
                  <label className="schedule-time-label">Hasta</label>
                  <input
                    type="time"
                    value={range.end}
                    onChange={e => update(day, 'end', e.target.value)}
                    className="schedule-time-input"
                  />
                </div>

                {slots.length > 0 ? (
                  <div className="schedule-slots">
                    {slots.map(slot => (
                      <span
                        key={slot}
                        className="schedule-slot-chip"
                        style={{ background: accent }}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="schedule-slots-error">El rango es muy corto para generar turnos de 2 horas</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}