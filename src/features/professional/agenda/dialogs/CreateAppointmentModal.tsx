import { useState, useEffect, useRef } from 'react';
import { useClientAccountSearch } from '@/shared/hooks/useClientAccountSearch';
import { ClientAccountMatches, type ClientMatch } from '@/shared/ui/molecules/ClientAccountMatches';
import { X } from 'lucide-react';
import { api } from '@/shared/utils/api';
import { minutesSinceStart } from '@/shared/utils/argentinaTime';
import { useAuth } from '@/features/auth/AuthContext';
import { generateSlots } from '@/features/professional/onboarding/types';
import type { Appointment } from '@/features/professional/types/appointment';
import { safeErrorMessage } from '@/shared/utils/errorMessage';

const JS_DAY_TO_BACKEND_DAY = [6, 0, 1, 2, 3, 4, 5];

interface ServiceOption { id: string; name: string; duration: number; price: number }
interface AvailabilityRow { dayOfWeek: number; startTime: string; endTime: string }

interface Props {
  primary: string;
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
}

export function CreateAppointmentModal({ primary, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [clientName, setClientName]   = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId]     = useState('');
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

  const handleDateChange = async (d: string) => {
    setDate(d);
    setTime('');
    if (!user?.id || !d) { setAvailableTimes([]); return; }
    setLoadingTimes(true);
    try {
      const res = await api.get<{ availability: AvailabilityRow[] }>(`/api/professional/${user.id}/availability`, { params: { date: d } });
      const backendDay = JS_DAY_TO_BACKEND_DAY[new Date(`${d}T00:00:00`).getDay()];
      const dayRows = res.data.availability.filter(a => a.dayOfWeek === backendDay);
      setAvailableTimes(dayRows.flatMap(row => generateSlots({ start: row.startTime, end: row.endTime })));
    } catch {
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  // La profesional busca entre SUS clientas (las que ya tuvieron turno con ella): no ve las cuentas de las demás. Se
  // carga la lista una sola vez y se filtra acá.
  const myClients = useRef<ClientMatch[] | null>(null);
  const account = useClientAccountSearch(async q => {
    if (myClients.current === null) {
      const res = await api.get<{ clients: ClientMatch[] }>('/api/professional/clients');
      myClients.current = (res.data.clients ?? []).map(c => ({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? '' }));
    }
    const needle = q.toLowerCase();
    return myClients.current.filter(c => c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle)).slice(0, 8);
  });
  const handleNameChange = (value: string) => {
    setClientName(value);
    if (account.selected && value !== account.selected.name) clearAccount();
    account.lookup(value);
  };
  const pickAccount = (m: ClientMatch) => {
    account.select(m);
    setClientName(m.name);
    setClientPhone(m.phone);
    setClientEmail(m.email);
  };
  const clearAccount = () => {
    account.clear();
    setClientEmail('');
  };

  const selectedService = services.find(s => s.id === serviceId);
  const canSave = Boolean(clientName.trim() && serviceId && date && time);

  const handleSave = async () => {
    if (!canSave || !selectedService) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.post<{ appointment: Appointment }>('/api/professional/appointments', {
        clientName:  clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        serviceId,
        date,
        time,
      });
      onCreated(res.data.appointment);
    } catch (err: unknown) {
      setError(safeErrorMessage(err, 'No se pudo crear el turno.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Lato', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000', margin: 0 }}>Crear turno manual</h2>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Nombre del cliente">
            <input value={clientName} onChange={e => handleNameChange(e.target.value)} style={inputStyle} placeholder="Nombre y apellido" autoComplete="off" />
          </Field>
          <ClientAccountMatches matches={account.matches} searched={account.searched} selected={account.selected} onSelect={pickAccount} onClear={clearAccount} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field label="Teléfono"><input value={clientPhone} onChange={e => setClientPhone(e.target.value)} style={inputStyle} /></Field>
            <Field label="Email"><input value={clientEmail} onChange={e => setClientEmail(e.target.value)} readOnly={Boolean(account.selected)} style={inputStyle} /></Field>
          </div>

          <Field label="Servicio">
            <select value={serviceId} onChange={e => setServiceId(e.target.value)} style={inputStyle}>
              <option value="">Elegí un servicio</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.duration} min — ${s.price.toLocaleString('es-AR')}</option>)}
            </select>
          </Field>

          <Field label="Fecha">
            <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} style={inputStyle} />
          </Field>

          {/* El turno manual no está atado a tu franja (a propósito): la hora se escribe a mano y los horarios de tu
              franja quedan como atajo. Si el día y la hora ya pasaron, el turno se carga como finalizado. */}
          {date && (
            <Field label="Hora">
              <input type="time" step={300} value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
            </Field>
          )}
          {date && time && minutesSinceStart(date, time) >= 0 && (
            <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>
              El día y la hora ya pasaron: el turno se va a cargar como finalizado.
            </p>
          )}

          {date && (
            loadingTimes ? (
              <p style={{ fontSize: '14px', color: '#000' }}>Cargando horarios...</p>
            ) : availableTimes.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>No tenés horarios cargados ese día: escribí la hora a mano.</p>
            ) : (
              <div>
                <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horarios de tu franja</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {availableTimes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      style={{
                        padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
                        background: time === t ? primary : '#f3f4f6',
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
          <button onClick={handleSave} disabled={!canSave || saving} style={{ ...primaryBtnStyle, background: primary, opacity: !canSave || saving ? 0.6 : 1 }}>
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
  color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
};
const ghostBtnStyle: React.CSSProperties = {
  padding: '9px 18px', border: '1px solid #e5e5e5', borderRadius: '8px',
  background: 'transparent', color: '#000', cursor: 'pointer',
  fontSize: '14px', fontFamily: "'Lato', sans-serif",
};
