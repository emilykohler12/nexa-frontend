import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, Upload } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { STORE_CATEGORIES } from '@/app/data/admin/store/store.data'
import type { StoreProduct, ProductStatus } from '@/app/data/admin/store/types'
import { safeErrorMessage } from '@/shared/utils/errorMessage'

const STATUS_LABEL: Record<ProductStatus, string> = {
  active:       'Activo',
  inactive:     'Inactivo',
  out_of_stock: 'Sin stock',
}
const STATUS_COLOR: Record<ProductStatus, { bg: string; color: string }> = {
  active:       { bg: 'rgba(6,148,148,0.1)',   color: '#069494' },
  inactive:     { bg: 'rgba(150,150,150,0.1)', color: '#000'    },
  out_of_stock: { bg: 'rgba(229,57,53,0.1)',   color: '#e53935' },
}

interface Props {
  products: StoreProduct[]
  onProductsChange: (products: StoreProduct[]) => void
}

export function ProductsTab({ products, onProductsChange }: Props) {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing]   = useState<StoreProduct | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [notice, setNotice]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<StoreProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = products.filter(p =>
    (!search   || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category)
  )

  const handleDelete = async () => {
    if (!confirmDelete) return
    const target = confirmDelete
    setDeleting(true)
    setError(null)
    setNotice(null)
    try {
      const res = await api.delete<{ success: boolean; deactivated?: boolean; message?: string }>(`/api/store/products/${target.id}`)
      if (res.data?.deactivated) {
        // Tenía compras asociadas — el backend lo desactivó en vez de borrarlo,
        // así que sigue existiendo (como inactivo), no se saca de la lista.
        onProductsChange(products.map(p => p.id === target.id ? { ...p, status: 'inactive' } : p))
        setNotice(res.data.message ?? `"${target.name}" tenía ventas registradas, así que se desactivó en vez de eliminarse.`)
      } else {
        onProductsChange(products.filter(p => p.id !== target.id))
      }
      setConfirmDelete(null)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo eliminar el producto'))
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (product: StoreProduct) => {
    setError(null)
    try {
      if (product.id) {
        const res = await api.put<{ product: StoreProduct }>(`/api/store/products/${product.id}`, product)
        onProductsChange(products.map(p => p.id === product.id ? res.data.product : p))
      } else {
        const res = await api.post<{ product: StoreProduct }>('/api/store/products', product)
        onProductsChange([res.data.product, ...products])
      }
      setEditing(null)
      setShowForm(false)
    } catch {
      setError('No se pudo guardar el producto')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
          <option value="">Todas las categorías</option>
          {STORE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => { setEditing(emptyProduct()); setShowForm(true) }} style={primaryBtnStyle}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}
      {notice && (
        <p style={{ color: '#8a6800', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          {notice}
        </p>
      )}

      {showForm && editing && (
        <ProductForm product={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', ''].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#000', fontSize: '16px' }}>Sin resultados</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: 'rgba(6,148,148,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', flexShrink: 0, overflow: 'hidden',
                    }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛍️'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#000', fontSize: '16px' }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#000' }}>{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{p.category}</td>
                <td style={{ ...tdStyle, fontWeight: 700, color: '#000' }}>${p.price.toLocaleString('es-AR')}</td>
                <td style={tdStyle}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.stock <= p.minStock && p.stock > 0 && <AlertTriangle size={14} color="#d4af37" />}
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? '#e53935' : '#000' }}>{p.stock}</span>
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: '13px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px',
                    background: STATUS_COLOR[p.status].bg, color: STATUS_COLOR[p.status].color,
                  }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <IconBtn onClick={() => { setEditing(p); setShowForm(true) }} aria-label="Editar"><Edit2 size={15} /></IconBtn>
                    <IconBtn onClick={() => setConfirmDelete(p)} aria-label="Eliminar" danger><Trash2 size={15} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div
          onClick={() => !deleting && setConfirmDelete(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#000' }}>¿Eliminar producto?</p>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#000' }}>
              Se va a eliminar <strong>{confirmDelete.name}</strong> de la tienda. Esta acción no se puede deshacer.
            </p>
            {error && <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#e53935', fontWeight: 600 }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} style={ghostBtnStyle}>Cancelar</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...primaryBtnStyle, background: '#e53935' }}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductForm({ product, onSave, onCancel }: { product: StoreProduct; onSave: (p: StoreProduct) => void; onCancel: () => void }) {
  const [form, setForm] = useState(product)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof StoreProduct, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('imageUrl', reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '14px', padding: '24px' }}>
      <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: '0 0 18px' }}>
        {form.id ? 'Editar producto' : 'Nuevo producto'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <Field label="Nombre"><input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} /></Field>
        <Field label="Marca"><input value={form.brand} onChange={e => set('brand', e.target.value)} style={inputStyle} /></Field>
        <Field label="Categoría">
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
            {STORE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Precio ($)"><input type="number" min={0} value={form.price === 0 ? '' : form.price} onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} /></Field>
        <Field label="Stock"><input type="number" min={0} value={form.stock} onChange={e => set('stock', Number(e.target.value))} style={inputStyle} /></Field>
        <Field label="Estado">
          <select value={form.status} onChange={e => set('status', e.target.value as ProductStatus)} style={inputStyle}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="out_of_stock">Sin stock</option>
          </select>
        </Field>
      </div>

      <div style={{ marginTop: '14px' }}>
        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            placeholder="Qué es, para qué sirve, cómo se usa..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </Field>
      </div>

      <div style={{ marginTop: '14px' }}>
        <Field label="Imagen">
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '72px', height: '72px', borderRadius: '10px', flexShrink: 0,
                border: '2px dashed #ccc', background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Upload size={18} color="#999" />
              )}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageFile} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} style={{ ...ghostBtnStyle, padding: '8px 16px', fontSize: '14px', alignSelf: 'flex-start' }}>
                {form.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <input
                value={form.imageUrl ?? ''}
                onChange={e => set('imageUrl', e.target.value || null)}
                placeholder="o pegá una URL de imagen (https://...)"
                style={inputStyle}
              />
            </div>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
        <button onClick={onCancel} style={ghostBtnStyle}>Cancelar</button>
        <button onClick={() => onSave({ ...form, price: Number(form.price) || 0 })} style={primaryBtnStyle}>Guardar</button>
      </div>
    </div>
  )
}

const emptyProduct = (): StoreProduct => ({
  id: '', name: '', brand: '', category: STORE_CATEGORIES[0], description: '',
  imageUrl: null, price: 0, stock: 0, minStock: 0, status: 'active',
})

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </label>
  )
}

function IconBtn({ children, onClick, 'aria-label': label, danger }: {
  children: React.ReactNode; onClick: () => void; 'aria-label': string; danger?: boolean
}) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} aria-label={label}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: '34px', height: '34px', border: 'none', borderRadius: '7px',
        background: h ? (danger ? 'rgba(229,57,53,0.1)' : 'rgba(6,148,148,0.1)') : 'transparent',
        color: h ? (danger ? '#e53935' : '#069494') : '#999',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none', width: '100%',
  fontFamily: "'Lato', sans-serif", background: '#fff',
}
const thStyle: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left', fontSize: '12px',
  fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em',
}
const tdStyle: React.CSSProperties = {
  padding: '16px', color: '#000', verticalAlign: 'middle',
  fontFamily: "'Lato', sans-serif", fontSize: '16px',
}
const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '10px 20px', border: 'none', borderRadius: '9px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
}
const ghostBtnStyle: React.CSSProperties = {
  padding: '10px 20px', border: '1px solid #e0e0e0', borderRadius: '9px',
  background: 'transparent', color: '#000', cursor: 'pointer',
  fontSize: '15px', fontFamily: "'Lato', sans-serif",
}