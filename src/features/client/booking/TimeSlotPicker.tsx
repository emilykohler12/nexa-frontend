// Grilla de horarios: los comunes y, aparte, los horarios reabiertos con la etiqueta
// «Horario de último momento».
import { useId } from 'react'
import { LAST_MINUTE_LABEL } from './availability'

interface Props {
  regular:      string[]
  reopened:     string[]
  selectedTime: string | null
  onSelect:     (time: string) => void
  primaryColor: string
}

function SlotGrid({ times, selectedTime, onSelect, primaryColor }: { times: string[]; selectedTime: string | null; onSelect: (t: string) => void; primaryColor: string }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {times.map(time => (
        <button
          key={time}
          type="button"
          onClick={() => onSelect(time)}
          aria-pressed={selectedTime === time}
          className="py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: selectedTime === time ? primaryColor : '#f3f4f6',
            color: selectedTime === time ? 'white' : '#555',
            fontFamily: 'var(--font-lato)',
          }}
        >
          {time}
        </button>
      ))}
    </div>
  )
}

export function TimeSlotPicker({ regular, reopened, selectedTime, onSelect, primaryColor }: Props) {
  const titleId = useId()
  return (
    <>
      {regular.length > 0 && (
        <SlotGrid times={regular} selectedTime={selectedTime} onSelect={onSelect} primaryColor={primaryColor} />
      )}
      {reopened.length > 0 && (
        <div role="group" aria-labelledby={titleId} className={regular.length > 0 ? 'mt-5' : ''}>
          <p id={titleId} className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-lato)', color: primaryColor }}>
            {LAST_MINUTE_LABEL}
          </p>
          <SlotGrid times={reopened} selectedTime={selectedTime} onSelect={onSelect} primaryColor={primaryColor} />
        </div>
      )}
    </>
  )
}
