import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/config/routes.config';
import { api } from '@/shared/utils/api';
import { validateAllSocials } from '@/shared/utils/social';
import type { AdminProfessional, CommissionType } from '../types';
import '../professionals.css';
import '@/shared/ui/admin/admin-controls.css';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};
const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
type DayKey = typeof DAY_KEYS[number];

interface CatalogService { id: string; name: string; status: string }

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Activo'     },
  { value: 'inactive', label: 'Inactivo'   },
  { value: 'vacation', label: 'Vacaciones' },
] as const;

interface Props {
  professional: AdminProfessional;
  onSave: (updated: AdminProfessional) => void;
  onBack?: () => void;
}

export function ProfileTab({ professional, onSave, onBack }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState(professional);
  const [socialErrors, setSocialErrors] = useState<Record<string, string>>({});
  const [activeServices, setActiveServices] = useState<CatalogService[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ services: CatalogService[] }>('/api/services')
      .then(res => setActiveServices((res.data.services ?? []).filter(s => s.status === 'active')))
      .catch(() => setActiveServices([]));
  }, []);

  const set = (field: keyof AdminProfessional, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setSocial = (network: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      socials: { ...prev.socials, [network]: value || null },
    }));

  const toggleService = (id: string) => {
    const next = form.services.includes(id)
      ? form.services.filter((s) => s !== id)
      : [...form.services, id];
    set('services', next);
  };

  const toggleDay = (day: DayKey) => {
    const schedule = { ...form.schedule };
    schedule[day] = schedule[day] ? null : { start: '09:00', end: '18:00' };
    set('schedule', schedule);
  };

  const setHour = (day: DayKey, field: 'start' | 'end', value: string) => {
    const schedule = { ...form.schedule };
    if (schedule[day]) schedule[day] = { ...schedule[day]!, [field]: value };
    set('schedule', schedule);
  };

  const handleSave = async () => {
    const errors = validateAllSocials(form.socials as Record<string, string | null>);
    if (Object.keys(errors).length > 0) {
      setSocialErrors(errors);
      return;
    }
    setSocialErrors({});
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await api.patch<{ professional: AdminProfessional }>(`/api/professionals/${form.id}`, {
        name:           form.name,
        phone:          form.phone,
        email:          form.email,
        specialty:      form.specialty,
        photo:          form.photo,
        status:         form.status,
        socials:        form.socials,
        services:       form.services,
        schedule:       form.schedule,
        commissionType: form.commissionType,
        commissionPct:  form.commissionPct,
        vacationFrom:   form.vacationFrom,
        vacationTo:     form.vacationTo,
      });
      onSave(res.data.professional);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err?.response?.data?.error ?? 'No se pudo guardar el perfil. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Datos personales */}
      <div className="prof-section">
        <p className="prof-section-title">Datos personales</p>
        <div className="prof-field-grid">
          <label className="prof-field">
            <span>Nombre completo</span>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="prof-field">
            <span>Especialidad</span>
            <input value={form.specialty} onChange={(e) => set('specialty', e.target.value)} />
          </label>
          <label className="prof-field">
            <span>Teléfono</span>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </label>
          <label className="prof-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label className="prof-field">
            <span>Estado</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="prof-field">
            <span>URL de foto de perfil</span>
            <input value={form.photo ?? ''} onChange={(e) => set('photo', e.target.value || null)} placeholder="https://..." />
          </label>
        </div>
      </div>

      {/* Comisión */}
      <div className="prof-section">
        <p className="prof-section-title">Modelo de comisión</p>
        <div className="commission-type-row" style={{ marginBottom: '14px' }}>
          {(['earned', 'to_owner'] as CommissionType[]).map((type) => (
            <div
              key={type}
              className={`commission-type-opt ${form.commissionType === type ? 'selected' : ''}`}
              onClick={() => set('commissionType', type)}
            >
              <input type="radio" readOnly checked={form.commissionType === type} style={{ accentColor: '#069494' }} />
              <div>
                <span>{type === 'earned' ? 'El profesional se queda X%' : 'El profesional le da X% al negocio'}</span>
                <p style={{ fontSize: '13px', color: '#000', margin: '2px 0 0', fontWeight: 400 }}>
                  {type === 'earned' ? 'Comisión tradicional' : 'Porcentaje a pagar'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <label className="prof-field" style={{ maxWidth: '200px' }}>
          <span>Porcentaje (%)</span>
          <input
            type="number" min={0} max={100}
            value={form.commissionPct}
            onChange={(e) => set('commissionPct', Number(e.target.value))}
          />
        </label>
      </div>

      {/* Redes sociales */}
      <div className="prof-section">
        <p className="prof-section-title">Redes sociales</p>
        <p style={{ fontSize: '14px', color: '#000', marginBottom: '14px' }}>
          Solo se muestran en la página principal si están cargadas
        </p>
        <div className="prof-field-grid">
          {[
            { key: 'instagram', placeholder: 'https://instagram.com/usuario' },
            { key: 'facebook',  placeholder: 'https://facebook.com/usuario' },
            { key: 'tiktok',    placeholder: 'https://tiktok.com/@usuario' },
            { key: 'twitter',   placeholder: 'https://x.com/usuario' },
          ].map(({ key, placeholder }) => (
            <label key={key} className="prof-field">
              <span style={{ textTransform: 'capitalize' }}>{key === 'twitter' ? 'Twitter / X' : key}</span>
              <input
                value={(form.socials as any)[key] ?? ''}
                onChange={(e) => setSocial(key, e.target.value)}
                placeholder={placeholder}
                className={socialErrors[key] ? 'error' : ''}
              />
              {socialErrors[key] && <p className="prof-field-error">{socialErrors[key]}</p>}
            </label>
          ))}
        </div>
      </div>

      {/* Servicios activos */}
      <div className="prof-section">
        <p className="prof-section-title">Servicios que realiza</p>
        <p style={{ fontSize: '14px', color: '#000', marginBottom: '10px' }}>
          Solo aparecen los servicios activos. Activá un servicio desde el panel de Servicios para que aparezca acá.
        </p>
        {activeServices.length === 0 ? (
          <p style={{ color: '#000', fontSize: '15px' }}>No hay servicios activos cargados todavía.</p>
        ) : (
          <div className="service-chips">
            {activeServices.map((service) => (
              <button
                key={service.id}
                type="button"
                className={`service-chip ${form.services.includes(service.id) ? 'selected' : ''}`}
                onClick={() => toggleService(service.id)}
              >
                {service.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horarios */}
      <div className="prof-section">
        <p className="prof-section-title">Horarios laborales</p>
        <div className="schedule-grid">
          {DAY_KEYS.map((day) => (
            <div key={day} className="schedule-row">
              <span className="schedule-day">{DAY_LABELS[day]}</span>
              {form.schedule[day] ? (
                <div className="schedule-times">
                  <input type="time" value={form.schedule[day]!.start}
                    onChange={(e) => setHour(day, 'start', e.target.value)} />
                  <span className="schedule-separator">–</span>
                  <input type="time" value={form.schedule[day]!.end}
                    onChange={(e) => setHour(day, 'end', e.target.value)} />
                  <button type="button" className="schedule-off-toggle" onClick={() => toggleDay(day)}>
                    Libre
                  </button>
                </div>
              ) : (
                <button type="button" className="schedule-off-toggle" onClick={() => toggleDay(day)}>
                  + Agregar horario
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vacaciones */}
      <div className="prof-section">
        <p className="prof-section-title">Vacaciones</p>
        <div className="prof-field-grid">
          <label className="prof-field">
            <span>Desde</span>
            <input type="date" value={form.vacationFrom ?? ''}
              onChange={(e) => set('vacationFrom', e.target.value || null)} />
          </label>
          <label className="prof-field">
            <span>Hasta</span>
            <input type="date" value={form.vacationTo ?? ''}
              onChange={(e) => set('vacationTo', e.target.value || null)} />
          </label>
        </div>
      </div>

      {saveError && <p className="prof-field-error" style={{ marginBottom: '10px' }}>{saveError}</p>}

      <div className="prof-save-bar">
        <button type="button" className="admin-button-secondary" onClick={onBack ?? (() => navigate(ROUTES.ADMIN_PROFESSIONALS))}>
          Cancelar
        </button>
        <button type="button" className="admin-button-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : saved ? '✓ Guardados' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}