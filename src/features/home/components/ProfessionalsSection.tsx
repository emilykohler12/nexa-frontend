//src/features/home/components/ProfessionalsSection.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaInstagram, FaFacebookF, FaTiktok, FaTwitter } from 'react-icons/fa'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { FavoriteStarButton } from '@/shared/ui/atoms/FavoriteStarButton'
import { ProfessionalDetailModal } from './ProfessionalDetailModal'
import { setPendingBookingPreselect } from '@/shared/utils/pendingBookingPreselect'

interface Professional {
  id:         string
  name:       string
  photo:      string | null
  bio:        string | null
  specialty:  string | null
  instagram:  string | null
  facebook:   string | null
  tiktok:     string | null
  twitter:    string | null
  services?:  string[]
  status?:    string
  certifications?: string | null
}

const SOCIAL_ICONS = [
  { key: 'instagram' as const, Icon: FaInstagram },
  { key: 'facebook'  as const, Icon: FaFacebookF },
  { key: 'tiktok'    as const, Icon: FaTiktok    },
  { key: 'twitter'   as const, Icon: FaTwitter   },
]

export function ProfessionalsSection() {
  const { business } = useTenant()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading]             = useState(true)
  const [detailPro, setDetailPro]         = useState<Professional | null>(null)

  useEffect(() => {
    api.get<{ professionals: Professional[] }>('/api/professional/public')
      // Defensivo: si el backend todavía no filtra desactivados/vacaciones del
      // lado del servidor, al menos no se muestran en la página pública.
      .then(res => setProfessionals((res.data.professionals ?? []).filter(p => !p.status || p.status === 'active')))
      .catch(() => setProfessionals([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null

  const { professionalsTitle, professionalsSubtitle, primaryColor, accentColor } = business

  const handleReservar = (professionalId?: string) => {
    if (isAuthenticated && user?.role === 'client') {
      navigate(ROUTES.CLIENT_BOOK, { state: professionalId ? { professionalId } : undefined })
    } else {
      if (professionalId) setPendingBookingPreselect({ professionalId })
      navigate(ROUTES.LOGIN)
    }
  }

  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Título */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}
          >
            {professionalsTitle}
          </h2>
          <p
            className="text-gray-500 max-w-2xl mx-auto text-lg"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {professionalsSubtitle}
          </p>
        </div>

        {/* Lista */}
        {loading ? (
          <div
            className="text-center py-20 text-gray-400"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            Cargando profesionales...
          </div>
        ) : professionals.length === 0 ? (
          <div
            className="text-center py-20 text-gray-400"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            No hay profesionales cargados todavía
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {professionals.map(pro => {
              const socialLinks = SOCIAL_ICONS.filter(s => !!pro[s.key])
              return (
                <div
                  key={pro.id}
                  onClick={() => setDetailPro(pro)}
                  className="relative flex flex-col items-center text-center border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ borderColor: '#e5e5e5' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
                >
                  {/* Favorito */}
                  <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                    <FavoriteStarButton
                      type="professional"
                      id={pro.id}
                      name={pro.name}
                      detail={pro.specialty ?? 'Profesional'}
                      color={accentColor}
                    />
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-4 overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {pro.photo ? (
                      <img
                        src={pro.photo}
                        alt={pro.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-white text-4xl font-bold"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                      >
                        {pro.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3
                    className="text-xl mb-1"
                    style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}
                  >
                    {pro.name}
                  </h3>

                  {/* Especialidad */}
                  {pro.specialty && (
                    <span
                      className="text-xs px-3 py-1 rounded-full text-white mb-3"
                      style={{ backgroundColor: accentColor, fontFamily: 'var(--font-lato)' }}
                    >
                      {pro.specialty}
                    </span>
                  )}

                  {/* Biografía */}
                  {pro.bio && (
                    <p
                      className="text-sm text-gray-500 mb-4 line-clamp-3"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {pro.bio}
                    </p>
                  )}

                  {/* Redes sociales */}
                  {socialLinks.length > 0 && (
                    <div className="flex items-center justify-center gap-3 mb-4" onClick={e => e.stopPropagation()}>
                      {socialLinks.map(({ key, Icon }) => (
                        <a
                          key={key}
                          href={pro[key]!}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={key}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
                          style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                        >
                          <Icon size={14} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Botón */}
                  <button
                    onClick={e => { e.stopPropagation(); handleReservar(pro.id) }}
                    className="w-full py-2 rounded-lg text-white text-sm transition-all duration-300 hover:opacity-90 mt-auto"
                    style={{
                      backgroundColor: primaryColor,
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    Reservar turno
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {detailPro && (
        <ProfessionalDetailModal
          professional={detailPro}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onClose={() => setDetailPro(null)}
          onReserve={() => { const id = detailPro.id; setDetailPro(null); handleReservar(id) }}
        />
      )}
    </section>
  )
}
