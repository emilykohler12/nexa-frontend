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
}

interface Props {
  selected: SelectedService[]
  onChange: (services: SelectedService[]) => void
}

export function ServicesStep({ selected, onChange }: Props) {
  const { business } = useTenant()
  const primary = business?.primaryColor ?? '#069494'
  const accent  = business?.accentColor  ?? '#d4af37'
  const [services, setServices] = useState<CatalogService[]>([])

  useEffect(() => {
    api.get<{ services: CatalogService[] }>('/api/services')
      .then(res => setServices((res.data.services ?? []).filter(s => s.status === 'active')))
      .catch(() => setServices([]))
  }, [])

  const isSelected = (id: string) => selected.some(s => s.serviceId === id)

  const toggle = (service: typeof services[0]) => {
    if (isSelected(service.id)) {
      onChange(selected.filter(s => s.serviceId !== service.id))
    } else {
      onChange([...selected, { serviceId: service.id, ownPrice: service.price, ownDuration: service.duration }])
    }
  }

  const updatePrice = (serviceId: string, price: number) => {
    onChange(selected.map(s => s.serviceId === serviceId ? { ...s, ownPrice: price } : s))
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
      <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>
        Seleccioná los servicios que realizás. Podés ajustar tu precio.
      </p>

      {services.map(service => {
        const sel    = selected.find(s => s.serviceId === service.id)
        const active = !!sel

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
                style={{ width: '16px', height: '16px', accentColor: primary, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#1a1a1a', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {service.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#888', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {service.duration} min · precio sugerido ${service.price.toLocaleString('es-AR')}
                </p>
              </div>
            </label>

            {active && sel && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Tu precio:</span>
                <button
                  type="button"
                  onClick={() => updatePrice(service.id, Math.max(0, sel.ownPrice - 500))}
                  style={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}
                >−</button>
                <input
                  type="number" min={0} value={sel.ownPrice}
                  onChange={e => updatePrice(service.id, Number(e.target.value))}
                  style={{ width: '100px', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '6px 10px', fontSize: '15px', outline: 'none', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                />
                <button
                  type="button"
                  onClick={() => updatePrice(service.id, sel.ownPrice + 500)}
                  style={{ width: '30px', height: '30px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '16px' }}
                >+</button>
                <span style={{ fontSize: '18px', fontWeight: 700, color: accent, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  ${sel.ownPrice.toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}