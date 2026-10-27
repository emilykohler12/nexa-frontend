// ============================================================
// DateTimeStep — selección de fecha y horario
// Horarios reales según la disponibilidad registrada por el profesional,
// menos los horarios que ya están ocupados por otro turno (bookedTimes).
// ============================================================

import { useState, useEffect } from 'react';
import { useTenant } from '@/features/tenant/TenantContext';
import { api } from '@/shared/utils/api';
import { generateSlots } from '@/features/professional/onboarding/types';
import { ANY_PROFESSIONAL_ID } from './ProviderStep';

interface Props {
  professionalId: string | null;
  serviceId?: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  // Se incrementa para forzar un refetch (ej: después de un 409 porque el
  // horario elegido se ocupó justo antes de confirmar).
  refreshSignal?: number;
  // Viene de un evento especial (ver SpecialEventSection en el home): el día
  // ya está fijo, no se muestra el selector de fecha, solo el de horario.
  dateLocked?: boolean;
}

interface AvailabilityRow {
  dayOfWeek: number;
  startTime: string;
  endTime:   string;
}

interface AvailabilityResponse {
  availability: AvailabilityRow[];
  bookedTimes?: string[];
}

// El backend usa 0=lunes...6=domingo; Date#getDay() usa 0=domingo...6=sábado
const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5];

function freeSlotsFor(res: AvailabilityResponse, date: string): string[] {
  const backendDay = JS_DAY_TO_BACKEND_DAY[new Date(`${date}T00:00:00`).getDay()];
  // Un mismo día puede tener varias filas (varios rangos con un hueco entre
  // medio, ej: 08–12 y 14–20) — hay que juntar los turnos de todas, no solo la primera.
  const dayRows = res.availability.filter(a => a.dayOfWeek === backendDay);
  if (dayRows.length === 0) return [];
  const booked = new Set(res.bookedTimes ?? []);
  return dayRows.flatMap(row => generateSlots({ start: row.startTime, end: row.endTime })).filter(t => !booked.has(t));
}

export function DateTimeStep({ professionalId, serviceId, selectedDate, selectedTime, onSelectDate, onSelectTime, refreshSignal, dateLocked }: Props) {
  const { business } = useTenant();
  const isAny = professionalId === ANY_PROFESSIONAL_ID;

  // Resultado de la última consulta de disponibilidad. Los horarios y el "cargando" se derivan de
  // si ese resultado corresponde a lo que está elegido ahora (key): así no hace falta reiniciar
  // estado dentro del efecto al cambiar de fecha o de profesional.
  const [loaded, setLoaded] = useState<{ key: string; slots: string[]; hasWorkingHours: boolean } | null>(null);
  const canFetch = !!selectedDate && (isAny || !!professionalId);
  const key = `${isAny ? `any:${serviceId ?? ''}` : professionalId}|${selectedDate}|${refreshSignal}`;
  const current = canFetch && loaded?.key === key ? loaded : null;
  const loading = canFetch && !current;
  const freeSlots = current?.slots ?? [];
  const hasWorkingHours = current?.hasWorkingHours ?? false;

  useEffect(() => {
    if (!canFetch || !selectedDate) return;
    let cancelled = false;
    const done = (slots: string[], hasWorkingHours: boolean) => {
      if (!cancelled) setLoaded({ key, slots, hasWorkingHours });
    };

    if (!isAny) {
      api.get<AvailabilityResponse>(`/api/professional/${professionalId}/availability`, { params: { date: selectedDate } })
        .then(res => done(
          freeSlotsFor(res.data, selectedDate),
          freeSlotsFor({ availability: res.data.availability }, selectedDate).length > 0 || res.data.availability.length > 0,
        ))
        .catch(() => done([], false));
    } else {
      // Modo "cualquiera": unimos los horarios libres de todos los profesionales
      // que hacen el servicio — alcanza con que UNO esté libre en ese horario.
      // El descuento de horarios ocupados se hace por profesional ANTES de unir,
      // así un horario sigue apareciendo si otro profesional lo tiene libre.
      const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
      api.get<{ professionals: { id: string }[] }>(`/api/professional/public${query}`)
        .then(async res => {
          const ids = res.data.professionals.map(p => p.id);
          const results = await Promise.all(
            ids.map(id =>
              api.get<AvailabilityResponse>(`/api/professional/${id}/availability`, { params: { date: selectedDate } })
                .then(r => freeSlotsFor(r.data, selectedDate))
                .catch(() => [] as string[])
            )
          );
          done(Array.from(new Set(results.flat())).sort(), false);
        })
        .catch(() => done([], false));
    }
    return () => { cancelled = true; };
  }, [key, canFetch, isAny, professionalId, serviceId, selectedDate]);

  if (!business) return null;
  const { primaryColor } = business;

  const now = new Date();
  const isToday = selectedDate === now.toISOString().split('T')[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const availableTimes = freeSlots.filter(time => {
    if (!isToday) return true;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m > nowMinutes;
  });

  return (
    <div>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        {dateLocked ? 'Elegí el horario' : '¿Cuándo querés venir?'}
      </h2>

      {dateLocked && selectedDate ? (
        <div
          className="w-full rounded-xl p-3 mb-6"
          style={{ background: '#f7f7f7', border: '1px solid #e5e5e5', fontFamily: 'var(--font-lato)', color: primaryColor, fontWeight: 600 }}
        >
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      ) : (
        <input
          type="date"
          value={selectedDate ?? ''}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => onSelectDate(e.target.value)}
          className="w-full border rounded-xl p-3 mb-6 outline-none"
          style={{ borderColor: '#e5e5e5', fontFamily: 'var(--font-lato)', color: primaryColor }}
        />
      )}

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
              {(isAny || hasWorkingHours) && isToday
                ? 'No quedan horarios disponibles por hoy. Probá con otra fecha.'
                : isAny
                ? 'Ningún profesional tiene horarios disponibles este día.'
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
