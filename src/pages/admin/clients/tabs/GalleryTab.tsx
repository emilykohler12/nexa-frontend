import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Home, X } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { AdminClient } from '../types'

type GalleryCategory = 'before' | 'after'

interface ClientGalleryPhoto {
  id:         string
  url:        string
  category:   GalleryCategory
  showOnHome: boolean
  createdAt:  string
}

const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  before: 'Antes',
  after:  'Después',
}

export function GalleryTab({ client }: { client: AdminClient }) {
  const [photos,  setPhotos]  = useState<ClientGalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [pending, setPending] = useState<{ file: string; category: GalleryCategory; showOnHome: boolean } | null>(null)
  const [saving,  setSaving]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<{ photos: ClientGalleryPhoto[] }>(`/api/admin/clients/${client.id}/gallery`)
      .then(res => setPhotos(res.data.photos ?? []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [client.id])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPending({ file: reader.result as string, category: 'before', showOnHome: false })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const confirmUpload = async () => {
    if (!pending) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.post<{ photo: ClientGalleryPhoto }>(`/api/admin/clients/${client.id}/gallery`, {
        url:        pending.file,
        category:   pending.category,
        showOnHome: pending.showOnHome,
      })
      setPhotos(prev => [res.data.photo, ...prev])
      setPending(null)
    } catch {
      setError('No se pudo subir la foto')
    } finally {
      setSaving(false)
    }
  }

  const toggleShowOnHome = async (photo: ClientGalleryPhoto) => {
    const next = !photo.showOnHome
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, showOnHome: next } : p))
    try {
      await api.patch(`/api/admin/clients/${client.id}/gallery/${photo.id}`, { showOnHome: next })
    } catch {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, showOnHome: !next } : p))
      setError('No se pudo actualizar la foto')
    }
  }

  const handleDelete = async (id: string) => {
    const prev = photos
    setPhotos(prev.filter(p => p.id !== id))
    try {
      await api.delete(`/api/admin/clients/${client.id}/gallery/${id}`)
    } catch {
      setPhotos(prev)
      setError('No se pudo eliminar la foto')
    }
  }

  const before = photos.filter(p => p.category === 'before')
  const after  = photos.filter(p => p.category === 'after')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#000' }}>
          Fotografías de antes y después de tratamientos
        </p>
        <button onClick={() => fileRef.current?.click()} style={addBtnStyle}>
          <Plus size={14} /> Agregar foto
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>Cargando...</p>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', border: '2px dashed #e0e0e0', borderRadius: '14px' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#000' }}>Sin fotos todavía</p>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#777' }}>
            Subí la primera foto de este cliente
          </p>
        </div>
      ) : (
        <>
          <GalleryGroup title={`Antes (${before.length})`} photos={before} onToggleHome={toggleShowOnHome} onDelete={handleDelete} />
          <GalleryGroup title={`Después (${after.length})`} photos={after} onToggleHome={toggleShowOnHome} onDelete={handleDelete} />
        </>
      )}

      {pending && (
        <div style={overlayStyle} onClick={() => !saving && setPending(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#000' }}>Nueva foto</p>
              <button onClick={() => !saving && setPending(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={18} />
              </button>
            </div>

            <img src={pending.file} alt="preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />

            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ¿Es una foto de antes o después?
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {(['before', 'after'] as GalleryCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setPending(p => p && { ...p, category: cat })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: pending.category === cat ? '2px solid #069494' : '1px solid #ddd',
                    background: pending.category === cat ? 'rgba(6,148,148,0.06)' : '#fff',
                    color: '#000', fontWeight: 700, fontSize: '14px', fontFamily: "'Lato', sans-serif",
                  }}
                >
                  {CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#f8f8f8', borderRadius: '10px', cursor: 'pointer', marginBottom: '18px' }}>
              <input
                type="checkbox"
                checked={pending.showOnHome}
                onChange={e => setPending(p => p && { ...p, showOnHome: e.target.checked })}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#069494', flexShrink: 0 }}
              />
              <span style={{ fontSize: '14px', color: '#000' }}>
                <strong>¿Mostrar esta foto en la página principal?</strong>
                <br />
                <span style={{ color: '#666', fontSize: '13px' }}>
                  Aparece solo la imagen (sin el nombre del cliente) en la sección "Galería de trabajos" de la home.
                </span>
              </span>
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPending(null)} disabled={saving} style={ghostBtnStyle}>Cancelar</button>
              <button onClick={confirmUpload} disabled={saving} style={addBtnStyle}>
                {saving ? 'Guardando...' : 'Guardar foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GalleryGroup({
  title, photos, onToggleHome, onDelete,
}: {
  title: string
  photos: ClientGalleryPhoto[]
  onToggleHome: (p: ClientGalleryPhoto) => void
  onDelete: (id: string) => void
}) {
  if (photos.length === 0) return null
  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5', background: '#fff' }}>
            <img src={photo.url} alt={CATEGORY_LABEL[photo.category]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <button
                onClick={() => onToggleHome(photo)}
                title={photo.showOnHome ? 'Se muestra en la home — clic para ocultar' : 'No se muestra en la home — clic para mostrar'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '12px', fontWeight: 700,
                  color: photo.showOnHome ? '#069494' : '#999',
                }}
              >
                <Home size={13} />
                {photo.showOnHome ? 'En la home' : 'Oculta'}
              </button>
              <button
                onClick={() => onDelete(photo.id)}
                aria-label="Eliminar foto"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 0 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const addBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700,
  fontFamily: "'Lato', sans-serif",
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px',
  background: '#fff', color: '#000', cursor: 'pointer',
  fontSize: '14px', fontWeight: 700,
  fontFamily: "'Lato', sans-serif",
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 300, padding: 20,
}

const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', padding: '22px',
  width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto',
  fontFamily: "'Lato', sans-serif",
}
