import type { LucideIcon } from 'lucide-react'

interface Props {
  label:       string
  value:       string | number
  sub?:        string
  icon:        LucideIcon
  accentColor: string
  trend?:      number
}

export function StatCard({ label, value, sub, icon: Icon, accentColor, trend }: Props) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #eeeeee', borderRadius: '16px',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: "'Lato', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)`,
        borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: `${accentColor}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          <Icon size={17} />
        </div>
      </div>

      <div style={{ fontSize: '33px', fontWeight: 700, color: '#000', lineHeight: 1 }}>
        {value}
      </div>

      {(sub || trend !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {trend !== undefined && (
            <span style={{
              fontSize: '12px', fontWeight: 700,
              color: trend >= 0 ? '#069494' : '#e53935',
              background: trend >= 0 ? 'rgba(6,148,148,0.1)' : 'rgba(229,57,53,0.1)',
              padding: '2px 8px', borderRadius: '20px',
            }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {sub && <span style={{ fontSize: '13px', color: '#000' }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}