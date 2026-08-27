import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import { api } from '@/shared/utils/api';
import type { BusinessSettings } from '@/app/data/admin/settings/types';
import { SectionCard, Field, SaveBar } from './SettingsShared';
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const EMPTY_SETTINGS: BusinessSettings = {
  name: '',
  logo: null,
  description: '',
  address: '',
  phone: '',
  email: '',
  socials: { whatsapp: null, instagram: null, facebook: null, tiktok: null, twitter: null },
  policies: [],
};

export function GeneralSection() {
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [form, setForm]         = useState<BusinessSettings>(EMPTY_SETTINGS);
  const [policiesText, setPoliciesText] = useState('');
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    setLoadError(null);
    api.get<{ settings: BusinessSettings }>('/api/settings/business')
      .then(res => {
        setForm(res.data.settings);
        setPoliciesText((res.data.settings.policies ?? []).join('\n'));
      })
      .catch((err: any) => {
        setLoadError(safeErrorMessage(err, 'No se pudo cargar la información del negocio'));
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof BusinessSettings, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const setSocial = (k: keyof BusinessSettings['socials'], v: string) =>
    setForm(f => ({ ...f, socials: { ...f.socials, [k]: v || null } }));

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('logo', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const payload: BusinessSettings = {
      ...form,
      phone: form.socials.whatsapp ?? '',
      policies: policiesText.split('\n').map(p => p.trim()).filter(Boolean),
    };
    try {
      const res = await api.patch<{ settings: BusinessSettings }>('/api/settings/business', payload);
      setForm(res.data.settings);
      setPoliciesText((res.data.settings.policies ?? []).join('\n'));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveError(safeErrorMessage(err, 'Error al guardar los cambios'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#000', fontSize: '15px' }}>Cargando información del negocio...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {loadError && (
        <div style={errorBox}>
          {loadError} — mostrando el formulario vacío para que puedas completarlo.
        </div>
      )}

      <SectionCard title="Información del negocio">
        <div style={grid}>
          <Field label="Nombre del negocio">
            <input value={form.name} onChange={e => set('name', e.target.value)} style={input} />
          </Field>
          <Field label="Correo electrónico">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={input} />
          </Field>
          <Field label="WhatsApp (número)">
            <input
              value={form.socials.whatsapp ?? ''}
              onChange={e => setSocial('whatsapp', e.target.value)}
              placeholder="5493765018665"
              style={input}
            />
            <span style={hint}>Número con código de país, sin espacios ni símbolos.</span>
          </Field>
          <Field label="Dirección" fullWidth>
            <input value={form.address} onChange={e => set('address', e.target.value)} style={input} />
          </Field>
          <Field label="Descripción" fullWidth>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              style={{ ...input, resize: 'vertical' }}
            />
          </Field>
          <Field label="Logo del negocio" fullWidth>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div
                onClick={() => logoFileRef.current?.click()}
                style={{
                  width: '96px', height: '96px', borderRadius: '14px',
                  border: '2px dashed #ccc', background: '#fafafa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                }}
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Upload size={22} color="#999" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input ref={logoFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoFile} style={{ display: 'none' }} />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  style={{
                    alignSelf: 'flex-start', padding: '8px 16px', border: 'none', borderRadius: '8px',
                    background: '#069494', color: '#fff', fontWeight: 700, fontSize: '14px',
                    fontFamily: "'Lato', sans-serif", cursor: 'pointer',
                  }}
                >
                  {form.logo ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <span style={hint}>
                  Para que se vea bien: imagen cuadrada (por ejemplo 500×500px), fondo transparente en PNG si es posible, menos de 2MB. Formatos aceptados: PNG, JPG, WEBP o SVG.
                </span>
                <input
                  value={form.logo ?? ''}
                  onChange={e => set('logo', e.target.value || null)}
                  placeholder="o pegá una URL de imagen (https://...)"
                  style={input}
                />
              </div>
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Redes sociales">
        <div style={grid}>
          {([
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
            { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/...'  },
            { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@...'   },
            { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://x.com/tuusuario' },
          ] as const).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input
                value={form.socials[key] ?? ''}
                onChange={e => setSocial(key, e.target.value)}
                placeholder={placeholder}
                style={input}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Políticas">
        <Field label="Una política por línea" fullWidth>
          <textarea
            value={policiesText}
            onChange={e => setPoliciesText(e.target.value)}
            rows={4}
            placeholder={'Ej: Los turnos deben cancelarse con 24hs de anticipación'}
            style={{ ...input, resize: 'vertical' }}
          />
          <span style={hint}>Cada línea aparece como un punto en la sección "Nosotros" de la página principal</span>
        </Field>
      </SectionCard>

      {saveError && <div style={errorBox}>{saveError}</div>}

      <SaveBar onSave={handleSave} saved={saved && !saving} />
    </div>
  );
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
};
const input: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #e5e5e5', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none',
  fontFamily: "'Lato', sans-serif",
};
const hint: React.CSSProperties = {
  fontSize: '12px', color: '#000', marginTop: '3px', display: 'block',
};
const errorBox: React.CSSProperties = {
  background: '#fee', border: '1px solid #fcc', color: '#c33',
  padding: '12px 14px', borderRadius: '9px', fontSize: '15px', fontWeight: 600,
};
