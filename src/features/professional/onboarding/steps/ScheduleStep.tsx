// src/features/professional/onboarding/steps/ScheduleStep.tsx
import { Plus, X } from 'lucide-react'
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
    onChange({ ...availability, [day]: availability[day].length > 0 ? [] : [{ start: '09:00', end: '18:00' }] })
  }

  const updateRange = (day: WeekDay, idx: number, field: keyof DayRange, value: string) => {
    onChange({
      ...availability,
      [day]: availability[day].map((r, i) => i === idx ? { ...r, [field]: value } : r),
    })
  }

  const addRange = (day: WeekDay) => {
    const ranges = availability[day]
    const last = ranges[ranges.length - 1]
    // Sugerimos un bloque después del último — así armar "8 a 12 y 14 a 20" es un toque.
    const suggestedStart = last ? last.end : '09:00'
    onChange({ ...availability, [day]: [...ranges, { start: suggestedStart, end: '18:00' }] })
  }

  const removeRange = (day: WeekDay, idx: number) => {
    const next = availability[day].filter((_, i) => i !== idx)
    onChange({ ...availability, [day]: next })
  }

  return (
    <div className="schedule-step">
      <p className="schedule-step-info" style={{ background: `${primary}12`, color: primary }}>
        Marcá los días que trabajás y definí tus rangos de horario. Podés agregar más de un rango por día si tenés un bloque sin turnos (ej: un corte al mediodía). El sistema genera los turnos cada 2 horas automáticamente.
      </p>

      {WEEK_DAYS.map(day => {
        const ranges = availability[day]
        const active = ranges.length > 0
        const allSlots = ranges.flatMap(r => generateSlots(r))

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
              {active && allSlots.length > 0 && (
                <span className="schedule-day-slots-count">
                  {allSlots.length} turno{allSlots.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {active && (
              <div className="schedule-day-body">
                {ranges.map((range, idx) => {
                  const slots = generateSlots(range)
                  return (
                    <div key={idx} style={{ marginBottom: idx < ranges.length - 1 ? '12px' : 0, paddingBottom: idx < ranges.length - 1 ? '12px' : 0, borderBottom: idx < ranges.length - 1 ? '1px dashed #e5e5e5' : 'none' }}>
                      <div className="schedule-time-row">
                        <label className="schedule-time-label">Desde</label>
                        <input
                          type="time"
                          value={range.start}
                          onChange={e => updateRange(day, idx, 'start', e.target.value)}
                          className="schedule-time-input"
                        />
                        <label className="schedule-time-label">Hasta</label>
                        <input
                          type="time"
                          value={range.end}
                          onChange={e => updateRange(day, idx, 'end', e.target.value)}
                          className="schedule-time-input"
                        />
                        {ranges.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRange(day, idx)}
                            aria-label="Quitar este rango"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', display: 'flex', alignItems: 'center', padding: '4px' }}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {slots.length > 0 ? (
                        <div className="schedule-slots">
                          {slots.map(slot => (
                            <span key={slot} className="schedule-slot-chip" style={{ background: accent }}>
                              {slot}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="schedule-slots-error">El rango es muy corto para generar turnos de 2 horas</p>
                      )}
                    </div>
                  )
                })}

                <button
                  type="button"
                  onClick={() => addRange(day)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
                    background: 'none', border: `1px dashed ${primary}`, borderRadius: '8px',
                    padding: '7px 12px', color: primary, fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Lato', sans-serif",
                  }}
                >
                  <Plus size={13} /> Agregar otro rango (ej: para un corte al mediodía)
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
