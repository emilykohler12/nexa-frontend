// src/pages/admin/services/SpecialServiceZonesModal.tsx
//
// Administra las zonas y paquetes de un servicio especial — esto es lo que
// arma el precio/duración real que el cliente termina eligiendo al reservar.
import { useState } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import type { AdminService, ServiceZone, ServicePackage } from './types'

interface Props {
  service: AdminService
  error?: string | null
  onSave: (zones: ServiceZone[], packages: ServicePackage[]) => void
  onClose: () => void
}

let tempId = 0
const newId = () => `tmp-${Date.now()}-${tempId++}`

export function SpecialServiceZonesModal({ service, error, onSave, onClose }: Props) {
  const [zones, setZones]       = useState<ServiceZone[]>(service.zones ?? [])
  const [packages, setPackages] = useState<ServicePackage[]>(service.packages ?? [])

  const activeZones = zones.filter(z => z.active)

  const addZone = () => {
    setZones(prev => [...prev, { id: newId(), name: '', duration: 30, price: 0, active: true }])
  }

  const updateZone = (id: string, field: keyof ServiceZone, value: string | number | boolean) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z))
  }

  const removeZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
    // Si esa zona formaba parte de algún paquete, la sacamos de ahí también.
    setPackages(prev => prev.map(p => ({ ...p, zoneIds: p.zoneIds.filter(zid => zid !== id) })))
  }

  const addPackage = () => {
    setPackages(prev => [...prev, { id: newId(), name: '', zoneIds: [], duration: 0, price: 0, active: true }])
  }

  const updatePackage = (id: string, field: keyof ServicePackage, value: string | number | boolean) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const togglePackageZone = (packageId: string, zoneId: string) => {
    setPackages(prev => prev.map(p => {
      if (p.id !== packageId) return p
      const has = p.zoneIds.includes(zoneId)
      const nextZoneIds = has ? p.zoneIds.filter(z => z !== zoneId) : [...p.zoneIds, zoneId]
      const sumZones = zones.filter(z => nextZoneIds.includes(z.id))
      return {
        ...p,
        zoneIds: nextZoneIds,
        duration: sumZones.reduce((s, z) => s + z.duration, 0),
        price: sumZones.reduce((s, z) => s + z.price, 0),
      }
    }))
  }

  const removePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id))
  }

  const canSave = zones.every(z => z.name.trim()) && packages.every(p => p.name.trim() && p.zoneIds.length > 0)

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div className="service-modal" onClick={e => e.stopPropagation()}>
        <div className="service-modal-header">
          <h2>Zonas y paquetes — {service.name}</h2>
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={addZone} className="admin-button-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Plus size={15} /> Añadir zona
            </button>
            <button type="button" onClick={addPackage} className="admin-button-secondary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Plus size={15} /> Añadir paquete
            </button>
          </div>

          {/* Zonas */}
          <div className="service-form-field">
            <span>Zonas ({zones.length})</span>
            {zones.length === 0 ? (
              <p className="service-form-hint" style={{ margin: '6px 0 0' }}>Todavía no agregaste ninguna zona.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {zones.map(zone => (
                  <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px 10px', opacity: zone.active ? 1 : 0.55 }}>
                    <input
                      value={zone.name}
                      onChange={e => updateZone(zone.id, 'name', e.target.value)}
                      placeholder="Nombre de la zona"
                      style={{ flex: 2, minWidth: 0, padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                    />
                    <input
                      type="number" min={0}
                      value={zone.duration === 0 ? '' : zone.duration}
                      onChange={e => updateZone(zone.id, 'duration', e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="Min"
                      style={{ width: '70px', padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                    />
                    <input
                      type="number" min={0}
                      value={zone.price === 0 ? '' : zone.price}
                      onChange={e => updateZone(zone.id, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                      placeholder="$"
                      style={{ width: '90px', padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <input type="checkbox" checked={zone.active} onChange={e => updateZone(zone.id, 'active', e.target.checked)} /> Activa
                    </label>
                    <button type="button" onClick={() => removeZone(zone.id)} className="admin-icon-button danger" title="Quitar zona">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paquetes */}
          <div className="service-form-field">
            <span>Paquetes ({packages.length})</span>
            {packages.length === 0 ? (
              <p className="service-form-hint" style={{ margin: '6px 0 0' }}>Todavía no agregaste ningún paquete.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {packages.map(pack => (
                  <div key={pack.id} style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px', opacity: pack.active ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input
                        value={pack.name}
                        onChange={e => updatePackage(pack.id, 'name', e.target.value)}
                        placeholder="Nombre del paquete"
                        style={{ flex: 1, minWidth: 0, padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        <input type="checkbox" checked={pack.active} onChange={e => updatePackage(pack.id, 'active', e.target.checked)} /> Activo
                      </label>
                      <button type="button" onClick={() => removePackage(pack.id)} className="admin-icon-button danger" title="Quitar paquete">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {activeZones.length === 0 ? (
                      <p className="service-form-hint" style={{ margin: '0 0 8px' }}>Agregá alguna zona activa primero.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {activeZones.map(zone => {
                          const selected = pack.zoneIds.includes(zone.id)
                          return (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => togglePackageZone(pack.id, zone.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '5px 10px', borderRadius: '20px', cursor: 'pointer',
                                border: `1px solid ${selected ? '#069494' : '#ddd'}`,
                                background: selected ? 'rgba(6,148,148,0.08)' : '#fff',
                                color: selected ? '#069494' : '#555',
                                fontSize: '13px', fontFamily: "'Lato', sans-serif", fontWeight: 600,
                              }}
                            >
                              {selected && <Check size={11} />} {zone.name || 'Sin nombre'}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Duración (min)
                        <input
                          type="number" min={0}
                          value={pack.duration === 0 ? '' : pack.duration}
                          onChange={e => updatePackage(pack.id, 'duration', e.target.value === '' ? 0 : Number(e.target.value))}
                          style={{ width: '90px', padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Precio ($)
                        <input
                          type="number" min={0}
                          value={pack.price === 0 ? '' : pack.price}
                          onChange={e => updatePackage(pack.id, 'price', e.target.value === '' ? 0 : Number(e.target.value))}
                          style={{ width: '110px', padding: '7px 9px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}
                        />
                      </label>
                    </div>
                    <p className="service-form-hint" style={{ margin: '6px 0 0' }}>
                      Se autocompleta sumando las zonas elegidas — podés borrarlo y poner el precio/duración que quieras.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="service-form-actions">
            <button type="button" className="admin-button-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="admin-button-primary" onClick={() => onSave(zones, packages)} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
