import { useState, useEffect } from 'react';
import { api } from '@/shared/utils/api';
import { mockPaymentSettings } from '@/app/data/admin/settings/settings.data';
import type { PaymentSettings } from '@/app/data/admin/settings/types';
import { SectionCard, Field, SaveBar } from './SettingsShared';
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export function PaymentsSection() {
  const [form, setForm]       = useState<PaymentSettings>(mockPaymentSettings);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    setLoadError(null);
    api.get<{ settings: PaymentSettings }>('/api/settings/payments')
      .then(res => setForm(res.data.settings))
      .catch((err: any) => {
        setLoadError(safeErrorMessage(err, 'No se pudo cargar la configuración de pagos'));
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof PaymentSettings, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await api.patch<{ settings: PaymentSettings }>('/api/settings/payments', form);
      setForm(res.data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveError(safeErrorMessage(err, 'Error al guardar los cambios'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#000', fontSize: '15px' }}>Cargando configuración de pagos...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {loadError && <div style={errorBox}>{loadError} — mostrando valores por defecto.</div>}

      <SectionCard title="Seña">
        <div style={grid}>
          <Field label="Monto de seña">
            <input
              type="number" min={0}
              value={form.depositAmount}
              onChange={e => set('depositAmount', Number(e.target.value))}
              style={inp}
            />
          </Field>
          <Field label="Tipo de seña">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '8px' }}>
              {([
                { value: false, label: 'Monto fijo ($)' },
                { value: true,  label: 'Porcentaje (%)' },
              ] as const).map(opt => (
                <label key={String(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '15px', color: '#000' }}>
                  <input
                    type="radio"
                    checked={form.depositPercent === opt.value}
                    onChange={() => set('depositPercent', opt.value)}
                    style={{ accentColor: '#069494' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Cancelaciones y reembolsos">
        <div style={grid}>
          <Field label="Anticipación mínima para cancelar (horas)">
            <input
              type="number" min={0}
              value={form.cancellationHours}
              onChange={e => set('cancellationHours', Number(e.target.value))}
              style={inp}
            />
          </Field>
          <Field label="Política de reembolso de seña">
            <select
              value={form.refundPolicy}
              onChange={e => set('refundPolicy', e.target.value as PaymentSettings['refundPolicy'])}
              style={inp}
            >
              <option value="full">Reembolso completo</option>
              <option value="partial">Reembolso parcial</option>
              <option value="none">Sin reembolso</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      {saveError && <div style={errorBox}>{saveError}</div>}

      <SaveBar onSave={handleSave} saved={saved && !saving} />
    </div>
  );
}

const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' };
const inp:  React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#000', outline: 'none', fontFamily: "'Lato', sans-serif" };
const errorBox: React.CSSProperties = {
  background: '#fee', border: '1px solid #fcc', color: '#c33',
  padding: '12px 14px', borderRadius: '9px', fontSize: '15px', fontWeight: 600,
};
