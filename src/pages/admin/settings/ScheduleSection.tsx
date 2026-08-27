import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/shared/utils/api';
import type { ScheduleDay, Holiday } from '@/app/data/admin/settings/types';
import { SectionCard, SaveBar } from './SettingsShared';
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const EMPTY_SCHEDULE: ScheduleDay[] = [
  { day: 'monday',    label: 'Lunes',     isOpen: false, open: '09:00', close: '18:00' },
  { day: 'tuesday',   label: 'Martes',    isOpen: false, open: '09:00', close: '18:00' },
  { day: 'wednesday', label: 'Miércoles', isOpen: false, open: '09:00', close: '18:00' },
  { day: 'thursday',  label: 'Jueves',    isOpen: false, open: '09:00', close: '18:00' },
  { day: 'friday',    label: 'Viernes',   isOpen: false, open: '09:00', close: '18:00' },
  { day: 'saturday',  label: 'Sábado',    isOpen: false, open: '09:00', close: '18:00' },
  { day: 'sunday',    label: 'Domingo',   isOpen: false, open: '09:00', close: '18:00' },
];

export function ScheduleSection() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>(EMPTY_SCHEDULE);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    setLoadError(null);
    api.get<{ schedule: ScheduleDay[]; holidays: Holiday[] }>('/api/settings/schedule')
      .then(res => {
        setSchedule(res.data.schedule ?? EMPTY_SCHEDULE);
        setHolidays(res.data.holidays ?? []);
      })
      .catch((err: any) => {
        setLoadError(safeErrorMessage(err, 'No se pudieron cargar los horarios'));
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day: string) =>
    setSchedule(prev => prev.map(d =>
      d.day === day ? { ...d, isOpen: !d.isOpen } : d
    ));

  const setHour = (day: string, field: 'open' | 'close', value: string) =>
    setSchedule(prev => prev.map(d =>
      d.day === day ? { ...d, [field]: value } : d
    ));

  const addHoliday = () => {
    if (!newHoliday.date) return;
    setHolidays(prev => [...prev, { id: `h${prev.length}-${newHoliday.date}`, ...newHoliday }]);
    setNewHoliday({ date: '', description: '' });
  };

  const removeHoliday = (id: string) =>
    setHolidays(prev => prev.filter(h => h.id !== id));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await api.patch<{ schedule: ScheduleDay[]; holidays: Holiday[] }>('/api/settings/schedule', { schedule, holidays });
      setSchedule(res.data.schedule ?? schedule);
      setHolidays(res.data.holidays ?? holidays);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveError(safeErrorMessage(err, 'Error al guardar los horarios'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#000', fontSize: '15px' }}>Cargando horarios...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {loadError && <div style={errorBox}>{loadError} — mostrando horarios vacíos para que puedas completarlos.</div>}

      <SectionCard title="Días y horarios de atención">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {schedule.map(day => (
            <div key={day.day} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', borderRadius: '10px',
              background: day.isOpen ? 'rgba(6,148,148,0.04)' : '#fafafa',
              border: `1px solid ${day.isOpen ? 'rgba(6,148,148,0.2)' : '#eeeeee'}`,
              flexWrap: 'wrap',
            }}>
              {/* Toggle */}
              <button
                onClick={() => toggleDay(day.day)}
                style={{
                  width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                  background: day.isOpen ? '#069494' : '#ddd',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
                aria-label={day.isOpen ? 'Cerrar día' : 'Abrir día'}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: day.isOpen ? '18px' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </button>

              <span style={{
                minWidth: '100px', fontSize: '15px', fontWeight: 600,
                color: day.isOpen ? '#000' : '#999',
              }}>
                {day.label}
              </span>

              {day.isOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="time" value={day.open}
                    onChange={e => setHour(day.day, 'open', e.target.value)}
                    style={timeInput}
                  />
                  <span style={{ color: '#000', fontSize: '14px' }}>–</span>
                  <input
                    type="time" value={day.close}
                    onChange={e => setHour(day.day, 'close', e.target.value)}
                    style={timeInput}
                  />
                </div>
              ) : (
                <span style={{ fontSize: '14px', color: '#999' }}>Cerrado</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Feriados">
        {/* Agregar feriado */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input
            type="date" value={newHoliday.date}
            onChange={e => setNewHoliday(h => ({ ...h, date: e.target.value }))}
            style={{ ...timeInput, flex: '0 0 auto' }}
          />
          <input
            value={newHoliday.description}
            onChange={e => setNewHoliday(h => ({ ...h, description: e.target.value }))}
            placeholder="Descripción"
            style={{ ...timeInput, flex: 1, minWidth: '160px' }}
          />
          <button onClick={addHoliday} style={primaryBtn}>
            <Plus size={14} /> Agregar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {holidays.map(h => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px',
              background: '#fafafa', border: '1px solid #f0f0f0',
            }}>
              <span style={{ fontSize: '14px', color: '#000', minWidth: '90px' }}>
                {new Date(h.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </span>
              <span style={{ flex: 1, fontSize: '15px', color: '#000' }}>{h.description}</span>
              <button
                onClick={() => removeHoliday(h.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '2px' }}
                aria-label="Eliminar feriado"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {holidays.length === 0 && (
            <p style={{ color: '#000', fontSize: '14px' }}>Sin feriados cargados</p>
          )}
        </div>
      </SectionCard>

      {saveError && <div style={errorBox}>{saveError}</div>}

      <SaveBar onSave={handleSave} saved={saved && !saving} />
    </div>
  );
}

const timeInput: React.CSSProperties = {
  padding: '8px 10px', border: '1px solid #e5e5e5', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none',
  fontFamily: "'Lato', sans-serif",
};
const primaryBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '8px 14px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 600,
  fontFamily: "'Lato', sans-serif",
};
const errorBox: React.CSSProperties = {
  background: '#fee', border: '1px solid #fcc', color: '#c33',
  padding: '12px 14px', borderRadius: '9px', fontSize: '15px', fontWeight: 600,
};
