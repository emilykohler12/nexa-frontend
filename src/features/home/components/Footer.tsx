// src/features/home/components/Footer.tsx
import { useTenant } from '@/features/tenant/TenantContext'
import './Footer.css'

type SectionId = 'servicios' | 'profesionales' | 'tienda' | 'nosotros'

interface FooterProps {
  onNavigate: (section: SectionId | null) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const { business } = useTenant()
  if (!business) return null

  const mapsUrl = business.contactInfo.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.contactInfo.address)}`
    : null

  return (
    <footer className="footer" style={{ backgroundColor: business.primaryColor }}>
      <div className="footer-grid">

        {/* Logo + slogan — corrido hacia la derecha */}
        <div className="footer-brand">
          <img
            src={business.logo}
            alt={business.name}
            className="footer-logo"
            onClick={() => onNavigate(null)}
          />
          <p className="footer-slogan">{business.footer.slogan}</p>
        </div>

        {/* Links rápidos */}
        <div className="footer-col">
          <h4 className="footer-col-title">Links rápidos</h4>
          <ul className="footer-list">
            <li onClick={() => onNavigate(null)}>Inicio</li>
            {business.nav.map(item => (
              <li key={item.id} onClick={() => onNavigate(item.id as SectionId)}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contacto</h4>
          <ul className="footer-list">
            {business.whatsapp && (
              <li>
                <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {mapsUrl && (
              <li>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Ubicación
                </a>
              </li>
            )}
            <li onClick={() => onNavigate('nosotros')} style={{ cursor: 'pointer' }}>
              Horarios
            </li>
          </ul>
        </div>

        {/* Redes */}
        <div className="footer-col">
          <h4 className="footer-col-title">Redes</h4>
          <ul className="footer-list">
            {business.instagram && (
              <li>
                <a href={business.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
            {business.facebook && (
              <li>
                <a href={business.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul className="footer-list footer-list--muted">
            <li>Términos y condiciones</li>
            <li>Política de privacidad</li>
          </ul>
        </div>
      </div>

      <div className="footer-copyright">
        {business.footer.copyright}
      </div>
    </footer>
  )
}