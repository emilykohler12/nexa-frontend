// src/pages/admin/promotions/SpecialEventsSection.tsx
//
// Eventos especiales destacados en el home (ej: jornada de Depilación
// definitiva con una profesional puntual, en una fecha fija). A diferencia
// de las campañas automáticas, esto SÍ se muestra en la página principal —
// el cliente que toca "Reservar" entra directo con servicio, profesional y
// fecha ya elegidos, solo falta el horario.
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Sparkles, Calendar } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import type { SpecialEvent, SpecialEventFormValues } from '@/app/data/admin/promotions/specialEventTypes'

interface ServiceOption { id: string; name: string; status: string }
interface ProfessionalOption { id: string; name: string }

function emptyForm(): SpecialEventFormValues {
  return { serviceId: '', professionalId: '', date: '', title: '', description: '', active: true }
}

function toFormValues(e: SpecialEvent): SpecialEventFormValues {
  return {
    serviceId:      e.service.id,
    professionalId: e.professional.id,
    date:           e.date,
    title:          e.title ?? '',
    description:    e.description ?? '',
    active:         e.active,
  }
}

export function SpecialEventsSection() {
  const [items, setItems]               = useState<SpecialEvent[]>([])
  const [services, setServices]         = useState<ServiceOption[]>([])
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([])
  const [loading, setLoading]           = useState(true)
  const [editing, setEditing]           = useState<{ id: string | null; values: SpecialEventFormValues } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SpecialEvent | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    api.get<{ specialEvents: SpecialEvent[] }>('/api/admin/special-events')
      .then(res => setItems(res.data.specialEvents ?? []))
      .catch(() => setError('No se pudieron cargar los eventos especiales'))
      .finally(() => setLoading(false))
    api.get<{ services: ServiceOption[] }>('/api/services')
      .then(res => setServices((res.data.services ?? []).filter(s => s.status === 'active')))
      .catch(() => setServices([]))
    api.get<{ professionals: ProfessionalOption[] }>('/api/professional/public')
      .then(res => setProfessionals(res.data.professionals ?? []))
      .catch(() => setProfessionals([]))
  }, [])

  const handleSave = async (id: string | null, values: SpecialEventFormValues) => {
    setError(null)
    try {
      if (id) {
        const res = await api.put<{ specialEvent: SpecialEvent }>(`/api/admin/special-events/${id}`, values)
        setItems(prev => prev.map(x => x.id === id ? res.data.specialEvent : x))
      } else {
        const res = await api.post<{ specialEvent: SpecialEvent }>('/api/admin/special-events', values)
        setItems(prev => [res.data.specialEvent, ...prev])
      }
      setEditing(null)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo guardar el evento especial'))
    }
  }

  const handleToggleActive = async (e: SpecialEvent) => {
    try {
      const res = await api.put<{ specialEvent: SpecialEvent }>(`/api/admin/special-events/${e.id}`, { active: !e.active })
      setItems(prev => prev.map(x => x.id === e.id ? res.data.specialEvent : x))
    } catch {
      setError('No se pudo cambiar el estado del evento')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setError(null)
    try {
      await api.delete(`/api/admin/special-events/${confirmDelete.id}`)
      setItems(prev => prev.filter(x => x.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch {
      setError('No se pudo eliminar el evento')
    } finally {
      setDeleting(false)
    }
  }

  const isPast = (date: string) => date < new Date().toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setEditing({ id: null, values: emptyForm() })} style={primaryBtnStyle}>
          <Plus size={16} /> Nuevo evento especial
        </button>
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

      {editing && (
        <SpecialEventForm
          id={editing.id}
          value={editing.values}
          services={services}
          professionals={professionals}
          onSave={values => handleSave(editing.id, values)}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p style={{ color: '#000' }}>Cargando...</p>
      ) : items.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>
          Todavía no armaste ningún evento especial.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {items.map(e => (
            <div key={e.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#d4af37" />
                  <p style={{ margin: 0, fontWeight: 700, color: '#000', fontSize: '16px' }}>{e.title || e.service.name}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(e)}
                  style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: e.active ? 'rgba(6,148,148,0.1)' : 'rgba(150,150,150,0.12)',
                    color: e.active ? '#069494' : '#777',
                  }}
                >
                  {e.active ? 'Activo' : 'Apagado'}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Servicio: {e.service.name}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Con: {e.professional.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: isPast(e.date) ? '#e53935' : '#555' }}>
                <Calendar size={13} /> {e.date}{isPast(e.date) ? ' — ya pasó, no se ve en el home' : ''}
              </div>

              {e.description && <p style={{ margin: 0, fontSize: '13px', color: '#888', fontStyle: 'italic' }}>"{e.description}"</p>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                <button onClick={() => setEditing({ id: e.id, values: toFormValues(e) })} style={iconBtnStyle}><Edit2 size={14} /> Editar</button>
                <button onClick={() => setConfirmDelete(e)} style={{ ...iconBtnStyle, color: '#e53935' }}><Trash2 size={14} /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div style={overlayStyle} onClick={() => setConfirmDelete(null)}>
          <div style={confirmModalStyle} onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '18px', color: '#000' }}>¿Eliminar este evento especial?</p>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#555' }}>"{confirmDelete.title || confirmDelete.service.name}" — esta acción no se puede deshacer.</p>
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

function SpecialEventForm({ id, value, services, professionals, onSave, onCancel }: {
  id: string | null
  value: SpecialEventFormValues
  services: ServiceOption[]
  professionals: ProfessionalOption[]
  onSave: (values: SpecialEventFormValues) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SpecialEventFormValues>(value)
  const set = (fields: Partial<SpecialEventFormValues>) => setForm(f => ({ ...f, ...fields }))

  const canSubmit = !!form.serviceId && !!form.professionalId && !!form.date

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '17px', color: '#000' }}>
        {id ? 'Editar evento especial' : 'Nuevo evento especial'}
      </p>

      <FormField label="Servicio (ej: Depilación definitiva)">
        <select value={form.serviceId} onChange={e => set({ serviceId: e.target.value })} style={inputStyle}>
          <option value="">Elegí un servicio</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </FormField>

      <FormField label="Profesional">
        <select value={form.professionalId} onChange={e => set({ professionalId: e.target.value })} style={inputStyle}>
          <option value="">Elegí una profesional</option>
          {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </FormField>

      <FormField label="Fecha del evento">
        <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => set({ date: e.target.value })} style={inputStyle} />
      </FormField>

      <FormField label="Título para el home (opcional — si lo dejás vacío usa el nombre del servicio)">
        <input value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ej: Jornada de Depilación Definitiva" style={inputStyle} />
      </FormField>

      <FormField label="Bajada / descripción para el home (opcional)">
        <textarea value={form.description} onChange={e => set({ description: e.target.value })} rows={2} placeholder="Un texto corto que invite a reservar..." style={{ ...inputStyle, resize: 'vertical' }} />
      </FormField>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#000', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.active} onChange={e => set({ active: e.target.checked })} />
        Evento activo (visible en el home)
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
