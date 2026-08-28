// src/pages/admin/services/SpecialServiceFormModal.tsx
//
// Formulario para un "servicio especial": un servicio de un solo día fijo,
// con horarios puntuales, cada uno atendido por un profesional concreto.
// El precio/duración de este tipo de servicio no se cargan acá — salen de
// las zonas/paquetes que se configuran después, desde el modal de zonas.
import { useState, useEffect, useRef } from 'react'
import { X, Upload, Plus, Trash2 } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { AdminService, ServiceFormValues, ServiceStatus, SpecialSlot } from './types'

interface CategoryOption { id: string; label: string }
interface ProfessionalOption { id: string; name: string }

interface Props {
  service: AdminService | null
  categories: CategoryOption[]
  error?: string | null
  onSave: (values: ServiceFormValues) => void
  onClose: () => void
}

export function SpecialServiceFormModal({ service, categories, error, onSave, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([])
  const [name, setName]               = useState(service?.name ?? '')
  const [categoryId, setCategoryId]   = useState(service?.categoryId ?? categories[0]?.id ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [image, setImage]             = useState<string | null>(service?.image ?? null)
  const [status, setStatus]           = useState<ServiceStatus>(service?.status ?? 'active')
  const [date, setDate]               = useState(service?.specialDate ?? '')
  const [slots, setSlots]             = useState<SpecialSlot[]>(service?.specialSlots ?? [])

  useEffect(() => {
    api.get<{ professionals: ProfessionalOption[] }>('/api/professional/public')
      .then(res => setProfessionals(res.data.professionals ?? []))
      .catch(() => setProfessionals([]))
  }, [])

  const addSlot = () => {
    setSlots(prev => [...prev, { time: '', professionalId: '', active: true }])
  }

  const updateSlot = (idx: number, field: 'time' | 'professionalId', value: string) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const toggleSlotActive = (idx: number) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s))
  }

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx))
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const validSlots = slots.filter(s => s.time && s.professionalId)
  const canSave = name.trim().length > 0 && Boolean(date) && validSlots.length > 0

  const handleSave = () => {
    if (!canSave) return
    const withNames = validSlots.map(s => ({
      ...s,
      professionalName: professionals.find(p => p.id === s.professionalId)?.name,
    }))
    onSave({
      name: name.trim(),
      categoryId,
      description: description.trim(),
      duration: 0,
      price: 0,
      image,
      status,
      isCombo: false,
      isSpecial: true,
      specialDate: date,
      specialSlots: withNames,
      zones: service?.zones ?? [],
      packages: service?.packages ?? [],
    })
  }

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal" onClick={e => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2>{service ? 'Editar servicio especial' : 'Nuevo servicio especial'}</h2>
          <button className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="service-form">
          {error && (
            <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>
              {error}
            </p>
          )}

          <label className="service-form-field">
            <span>Nombre</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del servicio" />
          </label>

          <label className="service-form-field">
            <span>Categoría</span>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </label>

          <label className="service-form-field">
            <span>Descripción</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Qué incluye, para quién es, etc." />
          </label>

          <label className="service-form-field">
            <span>Imagen</span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '72px', height: '72px', borderRadius: '10px', flexShrink: 0,
                  border: '2px dashed #ccc', background: '#fafafa', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}
              >
                {image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={18} color="#999" />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageFile} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileRef.current?.click()} className="admin-button-secondary" style={{ alignSelf: 'flex-start' }}>
                  {image ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
              </div>
            </div>
          </label>

          <div className="service-form-row">
            <label className="service-form-field">
              <span>Estado</span>
              <select value={status} onChange={e => setStatus(e.target.value as ServiceStatus)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>

            <label className="service-form-field">
              <span>Fecha</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </label>
          </div>

          <div className="service-form-field" style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
            <span>Horarios y profesional a cargo</span>

            {slots.length === 0 ? (
              <p className="service-form-hint" style={{ margin: '6px 0 0' }}>Todavía no agregaste ningún horario.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {slots.map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: slot.active ? 1 : 0.5 }}>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={e => updateSlot(idx, 'time', e.target.value)}
                      style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '7px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                    />
                    <select
                      value={slot.professionalId}
                      onChange={e => updateSlot(idx, 'professionalId', e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '7px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                    >
                      <option value="">Elegí un profesional</option>
                      {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {slot.clientName && (
                      <span style={{ fontSize: '12px', color: '#069494', fontWeight: 700, whiteSpace: 'nowrap' }}>{slot.clientName}</span>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <input type="checkbox" checked={slot.active} onChange={() => toggleSlotActive(idx)} /> Activo
                    </label>
                    <button type="button" onClick={() => removeSlot(idx)} className="admin-icon-button danger" title="Quitar horario">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={addSlot} className="admin-button-secondary" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Agregar horario
            </button>
          </div>

          <div className="service-form-actions">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="admin-button-primary" onClick={handleSave} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
