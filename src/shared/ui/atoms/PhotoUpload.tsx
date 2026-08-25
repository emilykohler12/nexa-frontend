import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

interface Props {
  value:    string | null
  onChange: (url: string | null) => void
  primary:  string
  size?:    number
}

export function PhotoUpload({ value, onChange, primary, size = 80 }: Props) {
  const [preview, setPreview] = useState<string | null>(value)
  const ref = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const initial = preview
    ? null
    : value?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: preview ? 'transparent' : `${primary}20`,
          border: `2px dashed ${primary}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', overflow: 'hidden', position: 'relative',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {preview ? (
          <>
            <img src={preview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              <Camera size={22} color="#fff" />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Camera size={20} color={primary} />
            <span style={{ fontSize: '11px', color: primary, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {initial ? initial : 'Subir foto'}
            </span>
          </div>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => ref.current?.click()}
          style={{
            fontSize: '13px', fontWeight: 600, color: primary,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          {preview ? 'Cambiar foto' : 'Subir foto de perfil'}
        </button>
        <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          PNG, JPG o WEBP · máx 5MB
        </p>
      </div>
    </div>
  )
}