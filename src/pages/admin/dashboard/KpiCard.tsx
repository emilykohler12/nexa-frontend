import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string
  prev: string
  changePercent: number
  icon: React.ReactNode
  accentColor?: string
}

export function KpiCard({ label, value, prev, changePercent, icon, accentColor = '#069494' }: Props) {
  const isUp      = changePercent > 0
  const isFlat    = changePercent === 0
  const trendColor = isFlat ? '#000' : isUp ? '#069494' : '#e53935'
  const TrendIcon  = isFlat ? Minus : isUp ? TrendingUp : TrendingDown
  const absChange  = Math.abs(changePercent).toFixed(1)

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '14px',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      fontFamily: "'Lato', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>
          {label}
        </span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '35px', fontWeight: 700, color: '#000', lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: isFlat ? '#f0f0f0' : isUp ? 'rgba(6,148,148,0.12)' : 'rgba(229,57,53,0.1)',
          color: trendColor,
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '16px',
          fontWeight: 700,
        }}>
          <TrendIcon size={15} />
          <span>{isFlat ? 'Sin cambio' : `${isUp ? '+' : '-'}${absChange}%`}</span>
        </div>
        <span style={{ fontSize: '15px', color: '#000', fontWeight: 600 }}>
          vs {prev} anterior
        </span>
      </div>
    </div>
  )
}