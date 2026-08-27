// src/pages/admin/services/ServiceFormModal.tsx
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload } from 'lucide-react'
import { serviceFormSchema } from './schemas'
import type { ServiceFormSchema } from './schemas'
import type { AdminService, ServiceFormValues } from './types'
import './services.css'

interface CategoryOption { id: string; label: string }

interface Props {
  service: AdminService | null
  categories: CategoryOption[]
  allServices: AdminService[]
  onSave: (values: ServiceFormValues) => void
  onClose: () => void
}

export function ServiceFormModal({ service, categories, allServices, onSave, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
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
    },
  })

  const onSubmit = (values: ServiceFormSchema) => {
    onSave({ ...values, image: values.image || null })
  }

  const imageValue = watch('image')
  const isCombo = watch('isCombo')
  const comboServiceIds = watch('comboServiceIds') ?? []
  const componentOptions = allServices.filter(s => s.id !== service?.id && !s.isCombo)

  const toggleComboService = (id: string) => {
    const next = comboServiceIds.includes(id)
      ? comboServiceIds.filter(x => x !== id)
      : [...comboServiceIds, id]
    setValue('comboServiceIds', next, { shouldDirty: true })
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setValue('image', reader.result as string, { shouldDirty: true })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal" onClick={(e) => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2>{service ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="service-form">
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
            <p className="service-form-hint">Se recorta automáticamente para verse pareja con el resto de los servicios — no importa el tamaño que subas.</p>
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
              <input type="checkbox" {...register('isCombo')} />
              <span>Es un combo</span>
            </label>
          </div>

          {isCombo && (
            <div className="service-form-field" style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '14px' }}>
              <span>Servicios que incluye el combo</span>
              {componentOptions.length === 0 ? (
                <p className="service-form-hint" style={{ margin: '6px 0 0' }}>
                  No hay otros servicios cargados todavía para armar el combo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {componentOptions.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 400, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={comboServiceIds.includes(s.id)}
                        onChange={() => toggleComboService(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              )}

              <label className="service-form-checkbox-field" style={{ marginTop: '12px' }}>
                <input type="checkbox" {...register('simultaneous')} disabled={comboServiceIds.length < 2} />
                <span>Se pueden hacer en simultáneo (con profesionales distintos)</span>
              </label>
              <p className="service-form-hint">
                Si lo marcás, el cliente va a poder elegir hacer todos los servicios del combo al mismo tiempo, cada uno con un profesional distinto (ej: cejas y pestañas + uñas de manos + uñas de pies a la vez).
                {comboServiceIds.length < 2 && ' Elegí al menos 2 servicios para poder activarlo.'}
              </p>
            </div>
          )}

          <div className="service-form-actions">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-button-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}