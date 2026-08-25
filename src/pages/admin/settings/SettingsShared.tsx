import type { ReactNode } from 'react'

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: '14px',
      padding: '24px 26px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: "'Lato', sans-serif",
    }}>
      <p style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#000',
        margin: '0 0 20px',
        letterSpacing: '0.01em',
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export function Field({ label, children, fullWidth }: {
  label: string; children: ReactNode; fullWidth?: boolean
}) {
  return (
    <label style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: 700,
        color: '#000',
        letterSpacing: '0.02em',
      }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        onClick={onSave}
        style={{
          padding: '10px 28px',
          border: 'none',
          borderRadius: '10px',
          background: saved ? '#4db6ac' : '#069494',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: "'Lato', sans-serif",
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// Input reutilizable con estilo consistente
export function SettingsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        color: '#000',
        fontFamily: "'Lato', sans-serif",
        outline: 'none',
        width: '100%',
        background: props.disabled ? '#f8f8f8' : '#fff',
        ...props.style,
      }}
    />
  )
}

export function SettingsSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        color: '#000',
        fontFamily: "'Lato', sans-serif",
        outline: 'none',
        background: '#fff',
        ...props.style,
      }}
    />
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#000' }}>
      {children}
    </p>
  )
}
