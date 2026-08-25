import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api }        from '@/shared/utils/api'

interface Professional {
  id:        string
  name:      string
  photo:     string | null
  specialty: string | null
  services?: string[]
}

interface Props {
  serviceId: string | null
  selectedProfessionalId: string | null
  onSelect: (professionalId: string) => void
}

export function ProviderStep({ serviceId, selectedProfessionalId, onSelect }: Props) {
  const { business } = useTenant()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : ''
    api.get<{ professionals: Professional[] }>(`/api/professional/public${query}`)
      .then(res => setProfessionals(res.data.professionals))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false))
  }, [serviceId])

  if (!business) return null
  const { primaryColor } = business

  // Filtro defensivo por si el backend todavía no filtra server-side por serviceId
  // pero sí devuelve la lista de servicios de cada profesional.
  const filteredProfessionals = serviceId
    ? professionals.filter(p => !p.services || p.services.includes(serviceId))
    : professionals

  if (loading) {
    return (
      <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
        Cargando profesionales...
      </p>
    )
  }

  if (filteredProfessionals.length === 0) {
    return (
      <p className="text-gray-400 text-center py-10" style={{ fontFamily: 'var(--font-lato)' }}>
        No hay profesionales disponibles para este servicio todavía
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
        ¿Con quién querés atenderte?
      </h2>
      <div className="flex flex-col gap-3">
        {filteredProfessionals.map(pro => (
          <button
            key={pro.id}
            onClick={() => onSelect(pro.id)}
            className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
            style={{
              borderColor: selectedProfessionalId === pro.id ? primaryColor : '#e5e5e5',
              backgroundColor: selectedProfessionalId === pro.id ? `${primaryColor}10` : 'white',
            }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden" style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-playfair)' }}>
              {pro.photo ? <img src={pro.photo} alt={pro.name} className="w-full h-full object-cover" /> : pro.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                {pro.name}
              </p>
              <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
                {pro.specialty}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}