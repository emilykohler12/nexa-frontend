// ============================================================
// DateTimeStep — selección de fecha y horario
// Horarios reales según la disponibilidad registrada por el profesional
// ============================================================

import { useState, useEffect } from 'react';
import { useTenant } from '@/features/tenant/TenantContext';
import { api } from '@/shared/utils/api';
import { generateSlots } from '@/features/professional/onboarding/types';

interface Props {
  professionalId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

interface AvailabilityRow {
  dayOfWeek: number;
  startTime: string;
  endTime:   string;
}

// El backend usa 0=lunes...6=domingo; Date#getDay() usa 0=domingo...6=sábado
const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5];

export function DateTimeStep({ professionalId, selectedDate, selectedTime, onSelectDate, onSelectTime }: Props) {
  const { business } = useTenant();
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) { setAvailability([]); setLoading(false); return; }
    setLoading(true);
    api.get<{ availability: AvailabilityRow[] }>(`/api/professional/${professionalId}/availability`)
      .then(res => setAvailability(res.data.availability))
      .catch(() => setAvailability([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (!business) return null;
  const { primaryColor } = business;

  const dayRow = selectedDate
    ? availability.find(a => JS_DAY_TO_BACKEND_DAY[new Date(`${selectedDate}T00:00:00`).getDay()] === a.dayOfWeek)
    : null;

  const now = new Date();
  const isToday = selectedDate === now.toISOString().split('T')[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const availableTimes = dayRow
    ? generateSlots({ start: dayRow.startTime, end: dayRow.endTime }).filter(time => {
        if (!isToday) return true;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m > nowMinutes;
      })
    : [];

  return (
    <div>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        ¿Cuándo querés venir?
      </h2>

      <input
        type="date"
        value={selectedDate ?? ''}
        min={new Date().toISOString().split('T')[0]}
        onChange={e => onSelectDate(e.target.value)}
        className="w-full border rounded-xl p-3 mb-6 outline-none"
        style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)', color: primaryColor }}
      />

      {selectedDate && loading && (
        <p className="text-gray-400 text-center py-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Cargando horarios...
        </p>
      )}

      {selectedDate && !loading && (
        <>
          <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'var(--font-lato)' }}>
            Horarios disponibles
          </p>
          {availableTimes.length === 0 ? (
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
              {dayRow && isToday
                ? 'No quedan horarios disponibles por hoy. Probá con otra fecha.'
                : 'El profesional no tiene horarios disponibles este día.'}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableTimes.map(time => (
                <button
                  key={time}
                  onClick={() => onSelectTime(time)}
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
          )}
        </>
      )}
    </div>
  );
}
