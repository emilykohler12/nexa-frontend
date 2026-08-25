import { Clock, User } from 'lucide-react'

interface Props {
  clientName: string | null
  time:       string | null
  service:    string
  primary:    string
  accent:     string
}

export function NextClientCard({ clientName, time, service, primary }: Props) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${primary}, #047a7a)`,
      borderRadius: '16px', padding: '20px 22px', color: '#fff',
      fontFamily: "'Lato', sans-serif",
      boxShadow: `0 8px 24px ${primary}40`,
    }}>
      <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.7, margin: '0 0 12px' }}>
        Próximo cliente
      </p>

      {clientName ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700,
            }}>
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{clientName}</p>
              <p style={{ margin: '2px 0 0', fontSize: '14px', opacity: 0.8 }}>{service}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
            <Clock size={14} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>{time}</span>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.7 }}>
          <User size={20} />
          <span style={{ fontSize: '15px' }}>Sin turnos hoy</span>
        </div>
      )}
    </div>
  )
}