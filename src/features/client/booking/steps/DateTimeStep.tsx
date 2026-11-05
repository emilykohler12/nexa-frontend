// ============================================================
// DateTimeStep — selección de fecha y horario
// Horarios reales según la disponibilidad registrada por el profesional, menos los que ya están
// ocupados (bookedTimes). Qué horarios se ofrecen hoy lo decide el SERVIDOR (earliestStart y
// reopenedStarts): el navegador no filtra con su reloj. Los horarios reabiertos se muestran aparte,
// con la etiqueta «Horario de último momento».
// ============================================================

import { useState, useEffect } from 'react';
import { useTenant } from '@/features/tenant/TenantContext';
import { api } from '@/shared/utils/api';
import { ANY_PROFESSIONAL_ID } from './ProviderStep';
import {
  type AvailabilityResponse, type DaySlots,
  EMPTY_DAY, hasWorkingHoursOn, localTodayISO, slotsFromAvailability, unionSlots,
} from '../availability';
import { TimeSlotPicker } from '../TimeSlotPicker';

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

export function DateTimeStep({ professionalId, serviceId, selectedDate, selectedTime, onSelectDate, onSelectTime, refreshSignal, dateLocked }: Props) {
  const { business } = useTenant();
  const isAny = professionalId === ANY_PROFESSIONAL_ID;

  // Resultado de la última consulta de disponibilidad. Los horarios y el "cargando" se derivan de
  // si ese resultado corresponde a lo que está elegido ahora (key): así no hace falta reiniciar
  // estado dentro del efecto al cambiar de fecha o de profesional.
  const [loaded, setLoaded] = useState<{ key: string; slots: DaySlots; hasWorkingHours: boolean } | null>(null);
  const canFetch = !!selectedDate && (isAny || !!professionalId);
  const key = `${isAny ? `any:${serviceId ?? ''}` : professionalId}|${selectedDate}|${refreshSignal}`;
  const current = canFetch && loaded?.key === key ? loaded : null;
  const loading = canFetch && !current;
  const slots = current?.slots ?? EMPTY_DAY;
  const hasWorkingHours = current?.hasWorkingHours ?? false;

  useEffect(() => {
    if (!canFetch || !selectedDate) return;
    let cancelled = false;
    const done = (slots: DaySlots, hasWorkingHours: boolean) => {
      if (!cancelled) setLoaded({ key, slots, hasWorkingHours });
    };
    // serviceId: el servidor calcula los horarios reabiertos según lo que dura el servicio.
    const params = { date: selectedDate, ...(serviceId ? { serviceId } : {}) };

    if (!isAny) {
      api.get<AvailabilityResponse>(`/api/professional/${professionalId}/availability`, { params })
        .then(res => done(slotsFromAvailability(res.data, selectedDate), hasWorkingHoursOn(res.data)))
        .catch(() => done(EMPTY_DAY, false));
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
              api.get<AvailabilityResponse>(`/api/professional/${id}/availability`, { params })
                .then(r => slotsFromAvailability(r.data, selectedDate))
                .catch(() => EMPTY_DAY)
            )
          );
          done(unionSlots(results), false);
        })
        .catch(() => done(EMPTY_DAY, false));
    }
    return () => { cancelled = true; };
  }, [key, canFetch, isAny, professionalId, serviceId, selectedDate]);

  if (!business) return null;
  const { primaryColor } = business;

  const noTimes = slots.regular.length === 0 && slots.reopened.length === 0;

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
          min={localTodayISO()}
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
          {noTimes ? (
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
              {slots.dayKind === 'past'
                ? 'Esa fecha ya pasó. Elegí otra fecha.'
                : (isAny || hasWorkingHours) && slots.dayKind === 'today'
                ? 'No quedan horarios disponibles por hoy. Probá con otra fecha.'
                : isAny
                ? 'Ningún profesional tiene horarios disponibles este día.'
                : 'El profesional no tiene horarios disponibles este día.'}
            </p>
          ) : (
            <TimeSlotPicker
              regular={slots.regular}
              reopened={slots.reopened}
              selectedTime={selectedTime}
              onSelect={onSelectTime}
              primaryColor={primaryColor}
            />
          )}
        </>
      )}
    </div>
  );
}
