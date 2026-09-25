import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { ROUTES } from '@/app/config/routes.config';
import { api } from '@/shared/utils/api';
import { uploadImage } from '@/shared/utils/uploadImage';
import { validateAllSocials } from '@/shared/utils/social';
import { SERVICE_CATEGORIES } from '@/app/data/shared';
import type { AdminProfessional } from '../types';
import '../professionals.css';
import '@/shared/ui/admin/admin-controls.css';
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};
const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
type DayKey = typeof DAY_KEYS[number];

interface CatalogService { id: string; name: string; status: string; categoryId: string }

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
  const photoFileRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const url = await uploadImage(file, 'profiles');
      set('photo', url);
    } catch {
      setSaveError('No se pudo subir la foto. Intentá de nuevo.');
    }
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
      setSaveError(safeErrorMessage(err, 'No se pudo guardar el perfil. Intentá de nuevo.'));
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
            <span>Nombre</span>
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
          <label className="prof-field" style={{ gridColumn: '1 / -1' }}>
            <span>Foto de perfil</span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                onClick={() => photoFileRef.current?.click()}
                style={{
                  width: '64px', height: '64px', borderRadius: '10px', flexShrink: 0,
                  border: '2px dashed #ccc', background: '#fafafa', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}
              >
                {form.photo ? (
                  <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={16} color="#999" />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                <input ref={photoFileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoFile} style={{ display: 'none' }} />
                <button type="button" onClick={() => photoFileRef.current?.click()} className="admin-button-secondary" style={{ alignSelf: 'flex-start' }}>
                  {form.photo ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <input value={form.photo ?? ''} onChange={(e) => set('photo', e.target.value || null)} placeholder="o pegá una URL de imagen (https://...)" />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="prof-section">
        <p className="prof-section-title">Redes sociales</p>
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
        {activeServices.length === 0 ? (
          <p style={{ color: '#000', fontSize: '15px' }}>No hay servicios activos cargados todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {SERVICE_CATEGORIES.map((cat) => {
              const inCat = activeServices.filter(s => s.categoryId === cat.id)
              if (inCat.length === 0) return null
              return (
                <div key={cat.id}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    {cat.label}
                  </p>
                  <div className="service-chips">
                    {inCat.map((service) => (
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
                </div>
              )
            })}
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