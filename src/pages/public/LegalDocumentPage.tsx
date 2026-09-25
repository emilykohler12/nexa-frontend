import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { ROUTES } from '@/app/config/routes.config'

interface LegalDocumentPageProps {
  title: string
  children: React.ReactNode
}

export function LegalDocumentPage({ title, children }: LegalDocumentPageProps) {
  const { business } = useTenant()
  const navigate = useNavigate()
  if (!business) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: business.primaryColor,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px',
            padding: '0',
            fontFamily: "'Lato', sans-serif"
          }}
        >
          <ArrowLeft size={18} />
          Volver
        </button>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 30px', color: business.primaryColor, fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#333', fontFamily: "'Lato', sans-serif" }}>
            {children}
          </div>
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#999' }}>
            <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
