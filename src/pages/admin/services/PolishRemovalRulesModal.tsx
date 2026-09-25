// src/pages/admin/services/PolishRemovalRulesModal.tsx
//
// Precios de referencia para "retiro de esmalte de otro salón", por tipo de
// servicio (ej. Capping $3000, Softgel $5000). Se usan después para elegir un
// valor ya cargado al registrar el retiro en un turno puntual — nunca se
// suman a ningún total solos.
import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

export interface PolishRemovalRule { id: string; label: string; price: number }

interface Props {
  onClose: () => void
}

export function PolishRemovalRulesModal({ onClose }: Props) {
  const [rules, setRules]     = useState<PolishRemovalRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get<{ rules: PolishRemovalRule[] }>('/api/settings/polish-removal-rules')
      .then(res => setRules(res.data.rules ?? []))
      .catch(() => setError('No se pudieron cargar las reglas.'))
      .finally(() => setLoading(false))
  }, [])

  const addRule = () => setRules(prev => [...prev, { id: crypto.randomUUID(), label: '', price: 0 }])
  const updateRule = (id: string, field: 'label' | 'price', value: string) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'price' ? Number(value) || 0 : value } : r))
  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id))

  const handleSave = async () => {
    setError(null)
    const cleaned = rules.filter(r => r.label.trim())
    if (cleaned.some(r => r.price <= 0)) {
      setError('Cada regla necesita un precio mayor a cero.')
      return
    }
    setSaving(true)
    try {
      await api.patch('/api/settings/polish-removal-rules', { rules: cleaned })
      onClose()
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudieron guardar las reglas.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="service-modal-overlay">
      <div className="service-modal" onClick={e => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2>Reglas de retiro de esmalte</h2>
          <button className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="service-form">
          <p style={{ margin: 0, fontSize: '13px', color: '#777', fontFamily: "'Lato', sans-serif", lineHeight: 1.5 }}>
            Un precio de referencia por tipo de servicio (ej. Capping, Softgel) para cuando una clienta trae esmaltado
            de otro salón. Es solo informativo para vos — nunca se suma al precio del servicio ni a ningún total.
          </p>

          {error && (
            <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>
              {error}
            </p>
          )}

          {loading ? (
            <p style={{ color: '#999', fontFamily: "'Lato', sans-serif" }}>Cargando...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rules.map(rule => (
                <div key={rule.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={rule.label}
                    onChange={e => updateRule(rule.id, 'label', e.target.value)}
                    placeholder="Ej: Capping"
                    style={{ flex: '2 1 auto', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                  />
                  <input
                    type="number"
                    min={0}
                    value={rule.price || ''}
                    onChange={e => updateRule(rule.id, 'price', e.target.value)}
                    placeholder="Precio"
                    style={{ flex: '1 1 100px', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                  />
                  <button
                    onClick={() => removeRule(rule.id)}
                    aria-label="Eliminar regla"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', display: 'flex', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addRule}
                className="admin-button-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', alignSelf: 'flex-start', marginTop: '4px' }}
              >
                <Plus size={15} /> Agregar regla
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={onClose} className="admin-button-secondary" disabled={saving}>Cancelar</button>
            <button onClick={handleSave} className="admin-button-primary" disabled={saving || loading}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
