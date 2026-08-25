import { useState } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { STORE_CATEGORIES } from '@/app/data/admin/store/store.data'
import type { StoreProduct, ProductStatus } from '@/app/data/admin/store/types'

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

  const filtered = products.filter(p =>
    (!search   || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category)
  )

  const handleDelete = async (id: string) => {
    const prev = products
    onProductsChange(products.filter(p => p.id !== id))
    try {
      await api.delete(`/api/store/products/${id}`)
    } catch {
      onProductsChange(prev)
      setError('No se pudo eliminar el producto')
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
                      fontSize: '22px', flexShrink: 0,
                    }}>🛍️</div>
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
                    <IconBtn onClick={() => handleDelete(p.id)} aria-label="Eliminar" danger><Trash2 size={15} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductForm({ product, onSave, onCancel }: { product: StoreProduct; onSave: (p: StoreProduct) => void; onCancel: () => void }) {
  const [form, setForm] = useState(product)
  const set = (k: keyof StoreProduct, v: unknown) => setForm(f => ({ ...f, [k]: v }))

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
        <Field label="Precio ($)"><input type="number" min={0} value={form.price} onChange={e => set('price', Number(e.target.value))} style={inputStyle} /></Field>
        <Field label="Stock"><input type="number" min={0} value={form.stock} onChange={e => set('stock', Number(e.target.value))} style={inputStyle} /></Field>
        <Field label="Estado">
          <select value={form.status} onChange={e => set('status', e.target.value as ProductStatus)} style={inputStyle}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="out_of_stock">Sin stock</option>
          </select>
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
        <button onClick={onCancel} style={ghostBtnStyle}>Cancelar</button>
        <button onClick={() => onSave(form)} style={primaryBtnStyle}>Guardar</button>
      </div>
    </div>
  )
}

const emptyProduct = (): StoreProduct => ({
  id: '', name: '', brand: '', category: STORE_CATEGORIES[0],
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