// src/pages/admin/promotions/AutoPromotionsSection.tsx
//
// Campañas automáticas (cumpleaños, turno N, etc.) — separado de las promos
// normales: esto nunca aparece en el home, son reglas internas que un job
// diario evalúa por cliente y manda el descuento por mail si corresponde.
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Cake, Gift, Users, Tag as TagIcon } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import { SERVICE_CATEGORIES } from '@/app/data/shared'
import type { AutoPromotion, AutoPromotionFormValues, AutoPromotionTrigger, AutoPromotionAudience } from '@/app/data/admin/promotions/autoPromotionTypes'

interface AdminClientOption { id: string; name: string; email: string }

const TRIGGER_LABELS: Record<AutoPromotionTrigger, string> = {
  birthday:              'Cumpleaños del cliente',
  appointment_milestone: 'Turno número X del cliente',
}

function triggerSummary(p: AutoPromotion): string {
  if (p.trigger === 'birthday') {
    const days = p.triggerConfig.daysBefore ?? 0
    return days === 0 ? 'El día del cumpleaños' : `${days} día${days !== 1 ? 's' : ''} antes del cumpleaños`
  }
  return `Al llegar al turno #${p.triggerConfig.count ?? '?'}`
}

function audienceSummary(p: AutoPromotion, clients: AdminClientOption[]): string {
  if (p.audienceType === 'all') return 'Todos los clientes'
  if (p.audienceType === 'manual') {
    const names = p.audienceClientIds.map(id => clients.find(c => c.id === id)?.name ?? '?')
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} y ${names.length - 2} más` : names.join(', ') || 'Sin clientes elegidos'
  }
  const cat = SERVICE_CATEGORIES.find(c => c.id === p.audienceCategoryId)
  return `Clientes de "${cat?.label ?? p.audienceCategoryId}"`
}

function discountSummary(p: AutoPromotion): string {
  return p.discountType === 'percent' ? `${p.discountValue}% off` : `$${p.discountValue.toLocaleString('es-AR')} off`
}

function emptyForm(): AutoPromotionFormValues {
  return {
    name: '', trigger: 'birthday', triggerConfig: { daysBefore: 0 },
    discountType: 'percent', discountValue: 10, message: '',
    audienceType: 'all', audienceClientIds: [], audienceCategoryId: null,
    active: true,
  }
}

export function AutoPromotionsSection() {
  const [items, setItems]     = useState<AutoPromotion[]>([])
  const [clients, setClients] = useState<AdminClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AutoPromotion | AutoPromotionFormValues | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AutoPromotion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get<{ autoPromotions: AutoPromotion[] }>('/api/admin/auto-promotions')
      .then(res => setItems(res.data.autoPromotions ?? []))
      .catch(() => setError('No se pudieron cargar las campañas'))
      .finally(() => setLoading(false))
    api.get<{ clients: AdminClientOption[] }>('/api/admin/clients')
      .then(res => setClients(res.data.clients ?? []))
      .catch(() => setClients([]))
  }, [])

  const handleSave = async (values: AutoPromotionFormValues, id?: string) => {
    setError(null)
    try {
      if (id) {
        const res = await api.put<{ autoPromotion: AutoPromotion }>(`/api/admin/auto-promotions/${id}`, values)
        setItems(prev => prev.map(p => p.id === id ? res.data.autoPromotion : p))
      } else {
        const res = await api.post<{ autoPromotion: AutoPromotion }>('/api/admin/auto-promotions', values)
        setItems(prev => [res.data.autoPromotion, ...prev])
      }
      setEditing(null)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo guardar la campaña'))
    }
  }

  const handleToggleActive = async (p: AutoPromotion) => {
    try {
      const res = await api.put<{ autoPromotion: AutoPromotion }>(`/api/admin/auto-promotions/${p.id}`, { active: !p.active })
      setItems(prev => prev.map(x => x.id === p.id ? res.data.autoPromotion : x))
    } catch {
      setError('No se pudo cambiar el estado de la campaña')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setError(null)
    try {
      await api.delete(`/api/admin/auto-promotions/${confirmDelete.id}`)
      setItems(prev => prev.filter(p => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch {
      setError('No se pudo eliminar la campaña')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: '#555', fontSize: '14px', maxWidth: '520px' }}>
          Reglas internas — nunca se muestran en la página principal. Cuando se cumplen, se le manda un mail con el descuento al cliente que corresponde.
        </p>
        <button onClick={() => setEditing(emptyForm())} style={primaryBtnStyle}>
          <Plus size={16} /> Nueva campaña
        </button>
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

      {editing && (
        <AutoPromotionForm
          value={editing}
          clients={clients}
          onSave={values => handleSave(values, 'id' in editing ? editing.id : undefined)}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p style={{ color: '#000' }}>Cargando...</p>
      ) : items.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>
          Todavía no armaste ninguna campaña automática.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {items.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.trigger === 'birthday' ? <Cake size={18} color="#069494" /> : <Gift size={18} color="#069494" />}
                  <p style={{ margin: 0, fontWeight: 700, color: '#000', fontSize: '16px' }}>{p.name}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(p)}
                  style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: p.active ? 'rgba(6,148,148,0.1)' : 'rgba(150,150,150,0.12)',
                    color: p.active ? '#069494' : '#777',
                  }}
                >
                  {p.active ? 'Activa' : 'Apagada'}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{TRIGGER_LABELS[p.trigger]} · {triggerSummary(p)}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555' }}>
                <Users size={13} /> {audienceSummary(p, clients)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700, color: '#069494' }}>
                <TagIcon size={13} /> {discountSummary(p)}
              </div>

              {p.message && <p style={{ margin: 0, fontSize: '13px', color: '#888', fontStyle: 'italic' }}>"{p.message}"</p>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                <button onClick={() => setEditing(p)} style={iconBtnStyle}><Edit2 size={14} /> Editar</button>
                <button onClick={() => setConfirmDelete(p)} style={{ ...iconBtnStyle, color: '#e53935' }}><Trash2 size={14} /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div style={overlayStyle} onClick={() => setConfirmDelete(null)}>
          <div style={confirmModalStyle} onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '18px', color: '#000' }}>¿Eliminar esta campaña?</p>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#555' }}>"{confirmDelete.name}" — esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} style={secondaryBtnStyle}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...primaryBtnStyle, background: '#e53935' }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Formulario ──────────────────────────────────────────────────────────

function AutoPromotionForm({ value, clients, onSave, onCancel }: {
  value: AutoPromotion | AutoPromotionFormValues
  clients: AdminClientOption[]
  onSave: (values: AutoPromotionFormValues) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<AutoPromotionFormValues>(value)
  const set = (fields: Partial<AutoPromotionFormValues>) => setForm(f => ({ ...f, ...fields }))

  const canSubmit = form.name.trim().length >= 2
    && (form.trigger !== 'birthday' || (form.triggerConfig.daysBefore ?? -1) >= 0)
    && (form.trigger !== 'appointment_milestone' || (form.triggerConfig.count ?? 0) >= 1)
    && (form.audienceType !== 'manual' || form.audienceClientIds.length > 0)
    && (form.audienceType !== 'category' || !!form.audienceCategoryId)

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '17px', color: '#000' }}>
        {'id' in value ? 'Editar campaña' : 'Nueva campaña automática'}
      </p>

      <FormField label="Nombre interno">
        <input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Ej: Descuento de cumpleaños" style={inputStyle} />
      </FormField>

      <FormField label="¿Cuándo se dispara?">
        <select
          value={form.trigger}
          onChange={e => {
            const trigger = e.target.value as AutoPromotionTrigger
            set({ trigger, triggerConfig: trigger === 'birthday' ? { daysBefore: 0 } : { count: 10 } })
          }}
          style={inputStyle}
        >
          <option value="birthday">Cumpleaños del cliente</option>
          <option value="appointment_milestone">Turno número X del cliente</option>
        </select>
      </FormField>

      {form.trigger === 'birthday' ? (
        <FormField label="Días de anticipación (0 = el mismo día)">
          <input
            type="number" min={0} max={60}
            value={form.triggerConfig.daysBefore ?? 0}
            onChange={e => set({ triggerConfig: { daysBefore: Number(e.target.value) } })}
            style={inputStyle}
          />
        </FormField>
      ) : (
        <FormField label="Número de turno (del cliente) que dispara el descuento">
          <input
            type="number" min={1}
            value={form.triggerConfig.count ?? ''}
            onChange={e => set({ triggerConfig: { count: Number(e.target.value) } })}
            placeholder="Ej: 10, 50, 100..."
            style={inputStyle}
          />
        </FormField>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <FormField label="Tipo de descuento">
          <select value={form.discountType} onChange={e => set({ discountType: e.target.value as 'percent' | 'fixed' })} style={inputStyle}>
            <option value="percent">Porcentaje (%)</option>
            <option value="fixed">Monto fijo ($)</option>
          </select>
        </FormField>
        <FormField label={form.discountType === 'percent' ? 'Porcentaje' : 'Monto ($)'}>
          <input type="number" min={0} value={form.discountValue} onChange={e => set({ discountValue: Number(e.target.value) })} style={inputStyle} />
        </FormField>
      </div>

      <FormField label="Mensaje extra para el mail (opcional)">
        <textarea value={form.message} onChange={e => set({ message: e.target.value })} rows={2} placeholder="Un texto corto que se suma al mail..." style={{ ...inputStyle, resize: 'vertical' }} />
      </FormField>

      <FormField label="¿A quién le aplica?">
        <select value={form.audienceType} onChange={e => set({ audienceType: e.target.value as AutoPromotionAudience })} style={inputStyle}>
          <option value="all">Todos los clientes</option>
          <option value="category">Clientes que reservaron en una categoría</option>
          <option value="manual">Clientes específicos</option>
        </select>
      </FormField>

      {form.audienceType === 'category' && (
        <FormField label="Categoría">
          <select value={form.audienceCategoryId ?? ''} onChange={e => set({ audienceCategoryId: e.target.value || null })} style={inputStyle}>
            <option value="">Elegí una categoría</option>
            {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </FormField>
      )}

      {form.audienceType === 'manual' && (
        <FormField label={`Clientes elegidos (${form.audienceClientIds.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '220px', overflowY: 'auto', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '6px' }}>
            {clients.length === 0 ? (
              <p style={{ margin: '6px', fontSize: '13px', color: '#999' }}>No hay clientes cargados.</p>
            ) : clients.map(c => {
              const checked = form.audienceClientIds.includes(c.id)
              return (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => set({
                      audienceClientIds: checked ? form.audienceClientIds.filter(id => id !== c.id) : [...form.audienceClientIds, c.id],
                    })}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>{c.name} <span style={{ color: '#999' }}>· {c.email}</span></span>
                </label>
              )
            })}
          </div>
        </FormField>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#000', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.active} onChange={e => set({ active: e.target.checked })} />
        Campaña activa
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
        <button onClick={onCancel} style={secondaryBtnStyle}>Cancelar</button>
        <button onClick={() => canSubmit && onSave(form)} disabled={!canSubmit} style={{ ...primaryBtnStyle, opacity: canSubmit ? 1 : 0.5 }}>
          Guardar
        </button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', fontWeight: 700, color: '#333' }}>
      {label}
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #ccc', borderRadius: '8px',
  fontSize: '14px', color: '#000', fontFamily: "'Lato', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box',
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '10px 18px', border: 'none', borderRadius: '9px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 18px', border: '1px solid #ccc', borderRadius: '9px',
  background: '#fff', color: '#333', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '5px',
  border: 'none', background: 'none', cursor: 'pointer',
  fontSize: '13px', fontWeight: 700, color: '#069494', fontFamily: "'Lato', sans-serif", padding: '4px 6px',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
}

const confirmModalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px',
}
