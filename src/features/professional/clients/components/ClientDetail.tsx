import { ArrowLeft, Phone, Mail, AlertCircle } from 'lucide-react'
import type { ProfessionalClient } from '@/features/professional/types/client'

interface Props {
  client:  ProfessionalClient
  primary: string
  accent:  string
  onBack:  () => void
}

export function ClientDetail({ client, primary, accent, onBack }: Props) {
  const totalRevenue = client.visits.reduce((s, v) => s + v.price, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#000', fontSize: '15px', fontWeight: 600, padding: 0, fontFamily: "'Lato', sans-serif" }}>
        <ArrowLeft size={16} /> Volver a clientes
      </button>

      {/* Header cliente */}
      <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${primary}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: primary }}>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#000' }}>{client.name}</h2>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#000' }}><Phone size={14} />{client.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#000' }}><Mail size={14} />{client.email}</span>
            {client.allergies && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#e53935' }}><AlertCircle size={14} />{client.allergies}</span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { label: 'Visitas totales',    value: client.visits.length },
          { label: 'Facturación total',  value: `$${totalRevenue.toLocaleString('es-AR')}` },
          { label: 'Cancelaciones',      value: client.cancellations },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px', padding: '18px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#000', margin: 0 }}>{kpi.value}</p>
            <p style={{ fontSize: '13px', color: '#000', margin: '4px 0 0' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Preferencias */}
      {client.preferences && (
        <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Preferencias</p>
          <p style={{ fontSize: '15px', color: '#000', margin: 0 }}>{client.preferences}</p>
        </div>
      )}

      {/* Historial */}
      <div style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
          Historial de visitas ({client.visits.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {client.visits.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9f9f9', borderRadius: '10px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#000' }}>{v.serviceName}</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#000' }}>{new Date(v.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: accent }}>${v.price.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}