//src/features/professional/onboarding/steps/ServicesStep.tsx

import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { SelectedService } from '../types'

interface CatalogService {
  id:       string
  name:     string
  duration: number
  price:    number
  status:   string
  isCombo?: boolean
  isSpecial?: boolean
}

interface Props {
  selected: SelectedService[]
  onChange: (services: SelectedService[]) => void
}

export function ServicesStep({ selected, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'
  const [services, setServices] = useState<CatalogService[]>([])

  useEffect(() => {
    api.get<{ services: CatalogService[] }>('/api/services')
      // Los servicios simultáneos (combos) y los especiales (duración 0, con horarios fijos por evento) los asigna el
      // administrador: no se ofrecen acá. Con un especial el envío fallaba (ownDuration tiene que ser de al menos 1 min).
      .then(res => setServices((res.data.services ?? []).filter(s => s.status === 'active' && !s.isCombo && !s.isSpecial)))
      .catch(() => setServices([]))
  }, [])

  const isSelected = (id: string) => selected.some(s => s.serviceId === id)

  const toggle = (service: typeof services[0]) => {
    if (isSelected(service.id)) {
      onChange(selected.filter(s => s.serviceId !== service.id))
    } else {
      onChange([...selected, { serviceId: service.id, name: service.name }])
    }
  }

  if (services.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        El negocio todavía no cargó servicios. Pedile al administrador que los agregue.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '17px', fontWeight: 600, color: '#000', margin: '0 0 6px', fontFamily: "'Lato', sans-serif" }}>
        Seleccioná los servicios que realizás. El precio lo define el administrador.
      </p>

      {services.map(service => {
        const active = selected.some(s => s.serviceId === service.id)

        return (
          <div
            key={service.id}
            style={{
              border: `1px solid ${active ? primary : '#e0e0e0'}`,
              borderRadius: '12px', padding: '14px 16px',
              background: active ? `${primary}06` : '#fff',
              transition: 'all 0.15s',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox" checked={active} onChange={() => toggle(service)}
                style={{ width: '20px', height: '20px', accentColor: primary, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '19px', color: '#000', fontFamily: "'Lato', sans-serif" }}>
                  {service.name}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '16px', color: '#000', fontFamily: "'Lato', sans-serif" }}>
                  Precio ${Number(service.price).toLocaleString('es-AR')}
                </p>
              </div>
            </label>

          </div>
        )
      })}
    </div>
  )
}