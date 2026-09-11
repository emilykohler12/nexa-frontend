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
  error?: string | null
  onSave: (values: ServiceFormValues) => void
  onClose: () => void
}

export function ServiceFormModal({ service, categories, allServices, error, onSave, onClose }: Props) {
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

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setValue('image', reader.result as string, { shouldDirty: true })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="service-modal-overlay">
      <div className="service-modal">
        <div className="service-modal-header">
          <h2>{service ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="service-form">
          {error && (
            <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: '8px', color: '#e53935', fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif" }}>
              {error}
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
            <span>Descripción <span style={{ fontWeight: 400, color: '#888' }}>(opcional)</span></span>
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