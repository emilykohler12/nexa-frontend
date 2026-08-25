// src/app/data/shared/categories.data.ts
export interface CategoryOption {
  id:    string
  label: string
  icon:  string
}

// Estas categorías se configuran una sola vez por negocio.
// Cuando el admin pueda gestionarlas desde el panel,
// reemplazá esto por un fetch a GET /api/categories.
export const SERVICE_CATEGORIES: CategoryOption[] = [
  { id: 'rostro',  label: 'Rostro',  icon: '/icons/rostro.svg'  },
  { id: 'unas',    label: 'Uñas',    icon: '/icons/unas.svg'    },
  { id: 'cabello', label: 'Cabello', icon: '/icons/cabello.svg' },
  { id: 'cuerpo',  label: 'Cuerpo',  icon: '/icons/cuerpo.svg'  },
]