import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import {
  Phone,
  Mail,
  Clock,
  Shield,
  Heart,
  Award,
  Users,
  Share2,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaTiktok, FaXTwitter } from 'react-icons/fa6'

const valueIcons = { shield: Shield, heart: Heart, users: Users, award: Award }

interface ScheduleDay {
  day:    string
  label:  string
  isOpen: boolean
  open:   string
  close:  string
}

// Agrupa días consecutivos con el mismo horario: "Lunes a Viernes: 09:00 - 18:00"
function formatSchedule(days: ScheduleDay[]): string[] {
  const lines: string[] = []
  let i = 0
  while (i < days.length) {
    const d = days[i]
    let j = i
    while (j + 1 < days.length && days[j + 1].isOpen === d.isOpen && days[j + 1].open === d.open && days[j + 1].close === d.close) {
      j++
    }
    const label = i === j ? d.label : `${d.label} a ${days[j].label}`
    lines.push(d.isOpen ? `${label}: ${d.open} - ${d.close}` : `${label}: Cerrado`)
    i = j + 1
  }
  return lines
}

export function AboutSection() {
  const { business } = useTenant()
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([])

  useEffect(() => {
    api.get<{ schedule: ScheduleDay[] }>('/api/schedule/public')
      .then(res => setScheduleDays(res.data.schedule ?? []))
      .catch(() => setScheduleDays([]))
  }, [])

  if (!business) return null

  const {
    primaryColor,
    accentColor,
    nosotrosTitle,
    nosotrosSubtitle,
    aboutText,
    values,
    contactInfo,
    policies,
    instagram,
    facebook,
    twitter,
    tiktok,
  } = business

  const socialLinks = [
    { href: twitter,   label: 'Twitter',   Icon: FaXTwitter,  bg: '#000000' },
    { href: instagram, label: 'Instagram', Icon: FaInstagram, bg: accentColor },
    { href: tiktok,    label: 'TikTok',    Icon: FaTiktok,    bg: '#000000' },
    { href: facebook,  label: 'Facebook',  Icon: FaFacebook,  bg: primaryColor },
  ].filter(s => s.href)

  const mapsUrl = contactInfo.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`
    : null
  const mapsEmbedUrl = contactInfo.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(contactInfo.address)}&output=embed`
    : null

  return (
    <section className="w-full bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}
          >
            {nosotrosTitle}
          </h2>
          <p
            className="text-gray-500 max-w-2xl mx-auto text-lg"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {nosotrosSubtitle}
          </p>
        </div>

        {/* Historia + Valores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#e5e5e5' }}>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6" style={{ color: accentColor }} />
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                Nuestra Historia
              </h3>
            </div>
            <div className="space-y-4">
              {aboutText.map((paragraph, idx) => (
                <p key={idx} className="text-gray-500 leading-relaxed" style={{ fontFamily: 'var(--font-lato)' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#e5e5e5' }}>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6" style={{ color: accentColor }} />
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                Nuestros Valores
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, idx) => {
                const Icon = valueIcons[value.icon]
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}08` }}>
                    <Icon className="w-5 h-5 mt-0.5" style={{ color: primaryColor }} />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-lato)', color: '#222' }}>
                        {value.title}
                      </h4>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
                        {value.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { Icon: Share2, title: 'Redes sociales', social: true },
            { Icon: Phone, title: 'Teléfono', lines: [contactInfo.phone, 'WhatsApp disponible'] },
            { Icon: Mail, title: 'Correo', lines: [contactInfo.email] },
            {
              Icon: Clock,
              title: 'Horarios',
              lines: scheduleDays.length > 0 ? formatSchedule(scheduleDays) : contactInfo.schedule.split(' | '),
            },
          ].map(({ Icon, title, lines, social }, idx) => (
            <div
              key={idx}
              className="bg-white text-center p-6 rounded-2xl border hover:shadow-lg transition-all duration-300"
              style={{ borderColor: '#e5e5e5' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <Icon className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
                {title}
              </h3>
              {social ? (
                socialLinks.length > 0 ? (
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {socialLinks.map(({ href, label, Icon: SocialIcon, bg }) => (
                      <a
                        key={label}
                        href={href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: bg }}
                      >
                        <SocialIcon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
                    Próximamente
                  </p>
                )
              ) : (
                lines!.map((line, lineIdx) => (
                  <p key={lineIdx} className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
                    {line}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Políticas */}
        <div className="bg-white rounded-2xl p-6 border mb-8" style={{ borderColor: '#e5e5e5' }}>
          <h3 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}>
            Políticas
          </h3>
          <ul className="space-y-3">
            {policies.map((policy, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Shield className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lato)' }}>
                  {policy}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mapa */}
        {mapsEmbedUrl && (
          <div className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: '#e5e5e5' }}>
            <iframe
              title="Ubicación"
              src={mapsEmbedUrl}
              className="w-full h-64 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm" style={{ fontFamily: 'var(--font-lato)' }}>
                {contactInfo.address}
              </p>
              <a
                href={mapsUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline mt-1 inline-block"
                style={{ color: primaryColor, fontFamily: 'var(--font-lato)' }}
              >
                Ver en Google Maps →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}