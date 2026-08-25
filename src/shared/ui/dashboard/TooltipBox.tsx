interface Props {
  children: React.ReactNode
}

export function TooltipBox({ children }: Props) {
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '10px',
      padding: '10px 14px',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      {children}
    </div>
  )
}

export function TooltipLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <>
      <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '18px', color, margin: 0, fontWeight: 700 }}>{value}</p>
    </>
  )
}