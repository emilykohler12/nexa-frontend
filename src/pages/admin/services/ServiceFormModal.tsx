// src/pages/admin/services/ServiceFormModal.tsx
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { serviceFormSchema } from './schemas'
import type { ServiceFormSchema } from './schemas'
import type { AdminService, ServiceFormValues } from './types'
import './services.css'

interface CategoryOption { id: string; label: string }

interface Props {
  service: AdminService | null
  categories: CategoryOption[]
  onSave: (values: ServiceFormValues) => void
  onClose: () => void
}

export function ServiceFormModal({ service, categories, onSave, onClose }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormSchema>({
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
    },
  })

  const onSubmit = (values: ServiceFormSchema) => {
    onSave({ ...values, image: values.image || null })
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
            <span>Imagen (URL)</span>
            <input {...register('image')} placeholder="https://..." />
            <p className="service-form-hint">Por ahora solo acepta un link. La subida de archivos llega con el backend.</p>
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

          <div className="service-form-actions">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-button-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}