import { useState, useEffect } from 'react'
import { X, ChevronLeft, Award } from 'lucide-react'
import { FaInstagram, FaFacebookF, FaTiktok, FaXTwitter } from 'react-icons/fa6'
import { api } from '@/shared/utils/api'

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
  certifications?: string | null
}

interface ServiceOption { id: string; name: string }

const SOCIAL_ICONS = [
  { key: 'instagram' as const, Icon: FaInstagram },
  { key: 'facebook'  as const, Icon: FaFacebookF },
  { key: 'tiktok'    as const, Icon: FaTiktok    },
  { key: 'twitter'   as const, Icon: FaXTwitter  },
]

interface Props {
  professional: Professional
  primaryColor: string
  accentColor:  string
  onClose:      () => void
  onReserve:    () => void
}

export function ProfessionalDetailModal({ professional, primaryColor, accentColor, onClose, onReserve }: Props) {
  const [serviceNames, setServiceNames] = useState<string[]>([])

  useEffect(() => {
    if (!professional.services?.length) return
    api.get<{ services: ServiceOption[] }>('/api/services')
      .then(res => {
        const byId = new Map(res.data.services.map(s => [s.id, s.name]))
        setServiceNames((professional.services ?? []).map(id => byId.get(id)).filter(Boolean) as string[])
      })
      .catch(() => setServiceNames([]))
  }, [professional.id])

  const socialLinks = SOCIAL_ICONS.filter(s => !!professional[s.key])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.08)', color: '#555' }}
        >
          <X size={18} />
        </button>
        <button
          onClick={onClose}
          aria-label="Volver"
          className="absolute top-3 left-3 z-10 sm:hidden w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.08)', color: '#555' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="p-6 pt-10 flex flex-col items-center text-center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mb-4 overflow-hidden flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {professional.photo ? (
              <img src={professional.photo} alt={professional.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                {professional.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            {professional.name}
          </h2>

          {professional.specialty && (
            <span
              className="text-xs px-3 py-1 rounded-full text-white mb-4"
              style={{ backgroundColor: accentColor, fontFamily: 'var(--font-lato)' }}
            >
              {professional.specialty}
            </span>
          )}

          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-3 mb-5">
              {socialLinks.map(({ key, Icon }) => (
                <a
                  key={key}
                  href={professional[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}

          {professional.bio && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-5 text-left w-full" style={{ fontFamily: 'var(--font-lato)' }}>
              {professional.bio}
            </p>
          )}

          {professional.certifications && (
            <div className="w-full text-left mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                <Award size={13} /> Certificaciones y cursos
              </p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line" style={{ fontFamily: 'var(--font-lato)' }}>
                {professional.certifications}
              </p>
            </div>
          )}

          {serviceNames.length > 0 && (
            <div className="w-full text-left mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-lato)', color: '#888', letterSpacing: '0.06em' }}>
                Servicios que realiza
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceNames.map(name => (
                  <span
                    key={name}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: `${primaryColor}10`, color: primaryColor, fontFamily: 'var(--font-lato)' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onReserve}
            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, fontFamily: 'var(--font-lato)' }}
          >
            Reservar turno
          </button>
        </div>
      </div>
    </div>
  )
}
