import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/shared/utils/api';
import { SectionCard, Field } from './SettingsShared';

export function SecuritySection() {
  const [passwords, setPasswords] = useState({ newPass: '', confirm: '' });
  const [show, setShow]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savedPw, setSavedPw]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const setP = (k: keyof typeof passwords, v: string) =>
    setPasswords(p => ({ ...p, [k]: v }));

  const handleChangePw = async () => {
    setError(null);
    if (!passwords.newPass) return;
    if (passwords.newPass.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/auth/change-password', { password: passwords.newPass });
      setSavedPw(true);
      setPasswords({ newPass: '', confirm: '' });
      setTimeout(() => setSavedPw(false), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Cambio de contraseña */}
      <SectionCard title="Cambiar contraseña">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
          {(['newPass', 'confirm'] as const).map(k => (
            <Field key={k} label={k === 'newPass' ? 'Nueva contraseña' : 'Confirmar nueva contraseña'}>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={passwords[k]}
                  onChange={e => setP(k, e.target.value)}
                  style={{ ...inp, paddingRight: '36px' }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          ))}

          {error && <p style={{ color: '#c33', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

          <button onClick={handleChangePw} disabled={saving} style={primaryBtn}>
            {saving ? 'Guardando...' : savedPw ? '✓ Guardado' : 'Cambiar contraseña'}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#000', outline: 'none', fontFamily: "'Lato', sans-serif" };
const primaryBtn: React.CSSProperties = { padding: '9px 18px', border: 'none', borderRadius: '8px', background: '#069494', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" };
