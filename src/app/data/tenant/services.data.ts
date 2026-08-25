import { ADMIN_SERVICES } from '@/app/data/admin/services/services.data'

export const SERVICE_CATEGORIES = [
  { id: 'rostro',  label: 'Rostro',  icon: '/icons/rostro.svg'  },
  { id: 'unas',    label: 'Uñas',    icon: '/icons/unas.svg'    },
  { id: 'cabello', label: 'Cabello', icon: '/icons/cabello.svg' },
  { id: 'cuerpo',  label: 'Cuerpo',  icon: '/icons/cuerpo.svg'  },
]

export const TENANT_SERVICES = {
  title:      'Nuestros Servicios',
  subtitle:   'Descubrí todos los tratamientos que tenemos para vos',
  categories: SERVICE_CATEGORIES,
  items: ADMIN_SERVICES
    .filter(s => s.status === 'active')
    .map(s => ({
      id:          s.id,
      categoryId:  s.categoryId,
      name:        s.name,
      description: s.description,
      duration:    s.duration,
      price:       s.price,
    })),
}