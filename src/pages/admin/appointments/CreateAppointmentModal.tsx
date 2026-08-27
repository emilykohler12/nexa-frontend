import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/shared/utils/api';
import { generateSlots } from '@/features/professional/onboarding/types';
import type { Appointment, Professional } from './types';
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5];

interface ServiceOption { id: string; name: string; duration: number; price: number }
interface AvailabilityRow { dayOfWeek: number; startTime: string; endTime: string }

interface Props {
  professionals: Professional[];
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
}

export function CreateAppointmentModal({ professionals, onClose, onCreated }: Props) {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [clientName, setClientName]   = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId]     = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    api.get<{ services: ServiceOption[] }>('/api/services')
      .then(res => setServices(res.data.services ?? []))
      .catch(() => setServices([]));
  }, []);

  const loadTimes = async (proId: string, d: string) => {
    if (!proId || !d) { setAvailableTimes([]); return; }
    setLoadingTimes(true);
    setTime('');
    try {
      const res = await api.get<{ availability: AvailabilityRow[] }>(`/api/professional/${proId}/availability`);
      const backendDay = JS_DAY_TO_BACKEND_DAY[new Date(`${d}T00:00:00`).getDay()];
      const dayRows = res.data.availability.filter(a => a.dayOfWeek === backendDay);
      setAvailableTimes(dayRows.flatMap(row => generateSlots({ start: row.startTime, end: row.endTime })));
    } catch {
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleProfessionalChange = (id: string) => {
    setProfessionalId(id);
    if (date) loadTimes(id, date);
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    if (professionalId) loadTimes(professionalId, d);
  };

  const selectedService = services.find(s => s.id === serviceId);
  const canSave = Boolean(clientName.trim() && serviceId && professionalId && date && time);

  const handleSave = async () => {
    if (!canSave || !selectedService) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.post<{ appointment: Appointment }>('/api/admin/appointments', {
        clientName:  clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        serviceId,
        professionalId,
        date,
        time,
      });
      onCreated(res.data.appointment);
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo crear el turno.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Lato', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', margin: 0 }}>Crear turno manual</h2>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Nombre del cliente">
            <input value={clientName} onChange={e => setClientName(e.target.value)} style={inputStyle} placeholder="Nombre y apellido" />
          </Field>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Teléfono"><input value={clientPhone} onChange={e => setClientPhone(e.target.value)} style={inputStyle} /></Field>
            <Field label="Email"><input value={clientEmail} onChange={e => setClientEmail(e.target.value)} style={inputStyle} /></Field>
          </div>

          <Field label="Servicio">
            <select value={serviceId} onChange={e => setServiceId(e.target.value)} style={inputStyle}>
              <option value="">Elegí un servicio</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.duration} min — ${s.price.toLocaleString('es-AR')}</option>)}
            </select>
          </Field>

          <Field label="Profesional">
            <select value={professionalId} onChange={e => handleProfessionalChange(e.target.value)} style={inputStyle}>
              <option value="">Elegí un profesional</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          <Field label="Fecha">
            <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} style={inputStyle} />
          </Field>

          {date && professionalId && (
            loadingTimes ? (
              <p style={{ fontSize: '14px', color: '#000' }}>Cargando horarios...</p>
            ) : availableTimes.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#000' }}>Sin horarios disponibles este día para este profesional.</p>
            ) : (
              <div>
                <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {availableTimes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      style={{
                        padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
                        background: time === t ? '#069494' : '#f3f4f6',
                        color: time === t ? '#fff' : '#555',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {error && (
            <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={ghostBtnStyle}>Cancelar</button>
          <button onClick={handleSave} disabled={!canSave || saving} style={{ ...primaryBtnStyle, opacity: !canSave || saving ? 0.6 : 1 }}>
            {saving ? 'Creando...' : 'Crear turno'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
      <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: '8px',
  padding: '9px 12px', fontSize: '14px', color: '#000',
  fontFamily: "'Lato', sans-serif", outline: 'none', width: '100%',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '9px 18px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
};
const ghostBtnStyle: React.CSSProperties = {
  padding: '9px 18px', border: '1px solid #e5e5e5', borderRadius: '8px',
  background: 'transparent', color: '#000', cursor: 'pointer',
  fontSize: '14px', fontFamily: "'Lato', sans-serif",
};
