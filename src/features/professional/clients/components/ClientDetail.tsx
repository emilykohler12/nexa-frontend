import { useState } from 'react'
import { ArrowLeft, Phone, Mail, AlertCircle, ChevronDown, FileText } from 'lucide-react'
import type { ProfessionalClient } from '@/features/professional/types/client'

interface Props {
  client:  ProfessionalClient
  primary: string
  accent:  string
  onBack:  () => void
}

// Si la fecha viene como "2026-08-26" (sin hora), `new Date(...)` la lee
// como UTC y en Argentina (UTC-3) se muestra un día antes. Forzamos hora
// local para que la fecha del turno finalizado sea siempre la correcta.
function formatVisitDate(date: string): string {
  const withTime = date.includes('T') ? date : `${date}T00:00:00`
  return new Date(withTime).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ClientDetail({ client, primary, accent, onBack }: Props) {
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null)

  // Solo cuenta como "visita" un turno ya finalizado — uno próximo/confirmado
  // todavía no pasó, no debería sumar a las visitas ni a la facturación.
  const visits = client.visits.filter(v => !v.status || v.status === 'finished')
  const totalRevenue = visits.reduce((s, v) => s + v.price, 0)

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
          { label: 'Visitas totales',    value: visits.length },
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
          Historial de visitas ({visits.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visits.map(v => {
            const isExpanded = expandedVisit === v.id
            return (
              <div key={v.id} style={{ background: '#f9f9f9', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedVisit(isExpanded ? null : v.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', cursor: v.internalNotes ? 'pointer' : 'default' }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#000' }}>{v.serviceName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#000' }}>{formatVisitDate(v.date)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: accent }}>${v.price.toLocaleString('es-AR')}</span>
                    {v.internalNotes && (
                      <ChevronDown size={16} color="#999" style={{ transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                    )}
                  </div>
                </div>
                {isExpanded && v.internalNotes && (
                  <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FileText size={14} color={primary} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.5 }}>{v.internalNotes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}