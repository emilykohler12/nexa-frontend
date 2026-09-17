interface Props {
  label: string
  value: string
  icon: React.ReactNode
  accentColor?: string
  // Aclaración corta debajo del valor (ej: "Ventana de 30 días") — opcional.
  sublabel?: string
}

export function KpiCard({ label, value, icon, accentColor = '#069494', sublabel }: Props) {
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
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '35px', fontWeight: 700, color: '#000', lineHeight: 1 }}>
        {value}
      </div>

      {sublabel && (
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>
          {sublabel}
        </span>
      )}
    </div>
  )
}
