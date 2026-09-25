// src/pages/admin/services/ServiceFormModal.tsx
import { useRef, useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { uploadImage } from '@/shared/utils/uploadImage'
import { serviceFormSchema } from './schemas'
import type { ServiceFormSchema } from './schemas'
import type { AdminService, ServiceFormValues } from './types'
import './services.css'

interface ProfessionalOption { id: string; name: string }

interface CategoryOption { id: string; label: string }

interface Props {
  service: AdminService | null
  categories: CategoryOption[]
  allServices: AdminService[]
  error?: string | null
  onSave: (values: ServiceFormValues) => void
  onClose: () => void
}

const DEFAULT_MODAL_SIZE = { width: 560, height: 640 }
const MIN_MODAL_SIZE     = { width: 360, height: 320 }

export function ServiceFormModal({ service, categories, allServices, error, onSave, onClose }: Props) {
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Resize a mano desde la esquina inferior derecha — el "resize: both" nativo
  // del CSS tiene un tirador nativo muy chico y difícil de agarrar, así que
  // este es propio y bien visible.
  const [modalSize, setModalSize] = useState(DEFAULT_MODAL_SIZE)
  const resizingRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    resizingRef.current = { startX: e.clientX, startY: e.clientY, startW: modalSize.width, startH: modalSize.height }
    const onMove = (ev: PointerEvent) => {
      const r = resizingRef.current
      if (!r) return
      const maxW = window.innerWidth * 0.94
      const maxH = window.innerHeight * 0.94
      setModalSize({
        width:  Math.min(maxW, Math.max(MIN_MODAL_SIZE.width,  r.startW + (ev.clientX - r.startX))),
        height: Math.min(maxH, Math.max(MIN_MODAL_SIZE.height, r.startH + (ev.clientY - r.startY))),
      })
    }
    const onUp = () => {
      resizingRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [modalSize])
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ServiceFormSchema>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormSchema>,
    defaultValues: service ?? {
      name: '',
      categoryId: categories[0]?.id ?? '',
      description: '',
      duration: 30,
      price: 0,
      image: '',
      status: 'active',
      isCombo: false,
      comboServiceIds: [],
      simultaneous: false,
      comboProfessionals: {},
    },
  })

  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([])
  useEffect(() => {
    api.get<{ professionals: ProfessionalOption[] }>('/api/professional/public')
      .then(res => setProfessionals(res.data.professionals ?? []))
      .catch(() => setProfessionals([]))
  }, [])

  const onSubmit = (values: ServiceFormSchema) => {
    onSave({ ...values, image: values.image || null })
  }

  const imageValue = watch('image')
  const isCombo = watch('isCombo')
  const comboServiceIds = watch('comboServiceIds') ?? []
  const comboProfessionals = watch('comboProfessionals') ?? {}
  // No tiene sentido armar un combo con un servicio inactivo — el cliente
  // no podría reservarlo igual.
  const componentOptions = allServices.filter(s => s.id !== service?.id && !s.isCombo && s.status === 'active')

  const toggleComboService = (id: string) => {
    const next = comboServiceIds.includes(id)
      ? comboServiceIds.filter(x => x !== id)
      : [...comboServiceIds, id]
    setValue('comboServiceIds', next, { shouldDirty: true })
    // Autocompleta el precio del combo con la suma de los servicios elegidos.
    // El admin puede cambiarlo después (más barato o más caro).
    const sum = next.reduce((acc, sid) => {
      const s = allServices.find(x => x.id === sid)
      return acc + Number(s?.price ?? 0)
    }, 0)
    setValue('price', sum, { shouldDirty: true })
  }

  const toggleComboProfessional = (serviceId: string, professionalId: string) => {
    const current = comboProfessionals[serviceId] ?? []
    const next = current.includes(professionalId)
      ? current.filter(x => x !== professionalId)
      : [...current, professionalId]
    setValue('comboProfessionals', { ...comboProfessionals, [serviceId]: next }, { shouldDirty: true })
  }

  // "Servicios simultáneos" reemplaza al viejo "Es un combo": un combo ahora
  // SIEMPRE es en simultáneo. Al activarlo se fuerza la categoría "Combo" y el
  // flag simultaneous; al desactivarlo se limpia todo lo del combo.
  const handleSimultaneousToggle = (checked: boolean) => {
    setValue('isCombo', checked, { shouldDirty: true })
    setValue('simultaneous', checked, { shouldDirty: true })
    if (checked) {
      setValue('categoryId', 'combo', { shouldDirty: true })
    } else {
      setValue('comboServiceIds', [], { shouldDirty: true })
    }
  }

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const url = await uploadImage(file, 'services')
      setValue('image', url, { shouldDirty: true })
    } catch {
      setImageError('No se pudo subir la imagen. Intentá de nuevo.')
    }
  }

  return (
    <div className="service-modal-overlay">
      <div
        className="service-modal"
        style={{ width: modalSize.width, height: modalSize.height, maxWidth: '94vw', maxHeight: '94vh' }}
      >
        <div className="service-modal-header">
          <h2>{service ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="service-form">
          {(error || imageError) && (
            <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>
              {error || imageError}
            </p>
          )}

          <label className="service-form-field">
            <span>Nombre</span>
            <input {...register('name')} placeholder="Ej: Corte y peinado" />
            {errors.name && <p className="service-form-error">{errors.name.message}</p>}
          </label>

          <label className="service-form-field">
            <span>Categoría</span>
            <select {...register('categoryId')}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            {errors.categoryId && <p className="service-form-error">{errors.categoryId.message}</p>}
          </label>

          <label className="service-form-field">
            <span>Descripción</span>
            <textarea {...register('description')} rows={3} placeholder="Qué incluye, para quién es, etc." />
            {errors.description && <p className="service-form-error">{errors.description.message}</p>}
          </label>

          <div className="service-form-row">
            <label className="service-form-field">
              <span>Duración (minutos)</span>
              <input type="number" {...register('duration')} />
              {errors.duration && <p className="service-form-error">{errors.duration.message}</p>}
            </label>

            <label className="service-form-field">
              <span>Precio</span>
              <input type="number" {...register('price')} />
              {errors.price && <p className="service-form-error">{errors.price.message}</p>}
            </label>
          </div>

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
                {imageValue ? (
                  <img src={imageValue} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={18} color="#999" />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageFile} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileRef.current?.click()} className="admin-button-secondary" style={{ alignSelf: 'flex-start' }}>
                  {imageValue ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <input {...register('image')} placeholder="o pegá una URL de imagen (https://...)" />
              </div>
            </div>
          </label>

          <div className="service-form-row">
            <label className="service-form-field">
              <span>Estado</span>
              <select {...register('status')}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>

            <label className="service-form-checkbox-field">
              <input
                type="checkbox"
                checked={isCombo}
                onChange={(e) => handleSimultaneousToggle(e.target.checked)}
              />
              <span>Servicios simultáneos</span>
            </label>
          </div>

          {isCombo && (
            <div className="service-form-field" style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
              <span>Servicios que se hacen en simultáneo</span>
              <p className="service-form-hint" style={{ margin: '4px 0 0' }}>
                El cliente reserva todos estos servicios juntos, en un mismo día y hora, cada uno con una profesional distinta. Elegí al menos 2.
              </p>
              {componentOptions.length === 0 ? (
                <p className="service-form-hint" style={{ margin: '8px 0 0' }}>
                  No hay otros servicios cargados todavía para armarlo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {componentOptions.map(s => (
                    <label
                      key={s.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        width: '100%', boxSizing: 'border-box',
                        padding: '7px 6px', borderRadius: '6px',
                        fontSize: '15px', fontWeight: 400, lineHeight: 1.35,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={comboServiceIds.includes(s.id)}
                        onChange={() => toggleComboService(s.id)}
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {isCombo && comboServiceIds.length > 0 && (
            <div className="service-form-field" style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
              <span>Quién puede hacer cada servicio</span>
              <p className="service-form-hint" style={{ margin: '4px 0 0' }}>
                Elegí qué profesionales puede elegir el cliente para cada servicio de este simultáneo. Si no marcás ninguna, puede elegir cualquiera que haga ese servicio.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {comboServiceIds.map(sid => {
                  const s = allServices.find(x => x.id === sid)
                  const selected = comboProfessionals[sid] ?? []
                  return (
                    <div key={sid}>
                      <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#111' }}>{s?.name ?? 'Servicio'}</p>
                      {professionals.length === 0 ? (
                        <p className="service-form-hint" style={{ margin: 0 }}>Cargando profesionales...</p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {professionals.map(p => {
                            const checked = selected.includes(p.id)
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleComboProfessional(sid, p.id)}
                                style={{
                                  padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                  border: `1.5px solid ${checked ? '#069494' : '#ddd'}`,
                                  background: checked ? 'rgba(6,148,148,0.08)' : '#fff',
                                  color: checked ? '#069494' : '#444',
                                  fontFamily: "'Lato', sans-serif", fontSize: '13px', fontWeight: 700,
                                }}
                              >
                                {p.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="service-form-actions">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-button-primary">Guardar</button>
          </div>
        </form>

        {/* Tirador para agrandar/achicar el modal — el "resize" nativo del CSS
            es un triangulito casi invisible; este es grande y fácil de agarrar. */}
        <div
          onPointerDown={handleResizeStart}
          title="Arrastrá para agrandar o achicar"
          style={{
            position: 'absolute', right: 0, bottom: 0, width: '22px', height: '22px',
            cursor: 'nwse-resize', touchAction: 'none',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '4px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.5 }}>
            <path d="M11 1 L1 11 M11 5.5 L5.5 11 M11 10 L10 11" stroke="#666" strokeWidth="1.3" />
          </svg>
        </div>
      </div>
    </div>
  )
}