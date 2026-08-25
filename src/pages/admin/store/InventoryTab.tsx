import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { api } from '@/shared/utils/api'
import type { StoreProduct, InventoryMovement, MovementType } from '@/app/data/admin/store/types'

const TYPE_LABEL: Record<MovementType, string> = {
  entry: 'Entrada',
  exit:  'Salida',
}

const TYPE_COLOR: Record<MovementType, string> = {
  entry: '#069494',
  exit:  '#e53935',
}

const MOVEMENT_TYPES: MovementType[] = ['entry', 'exit']

interface Props {
  products: StoreProduct[]
}

export function InventoryTab({ products }: Props) {
  const emptyForm = (): Omit<InventoryMovement, 'id'> => ({
    productId:   products[0]?.id ?? '',
    productName: products[0]?.name ?? '',
    type:        'entry',
    quantity:    1,
    note:        '',
    date:        new Date().toISOString().split('T')[0],
  })

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<InventoryMovement | null>(null)
  const [form, setForm]         = useState<Omit<InventoryMovement, 'id'>>(emptyForm())
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    api.get<{ movements: InventoryMovement[] }>('/api/store/movements')
      .then(res => setMovements(res.data.movements ?? []))
      .catch(() => setMovements([]))
      .finally(() => setLoading(false))
  }, [])

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleProductChange = (id: string) => {
    const product = products.find(p => p.id === id)
    set('productId', id)
    set('productName', product?.name ?? '')
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  const openEdit = (m: InventoryMovement) => {
    setEditing(m)
    setForm({ productId: m.productId, productName: m.productName, type: m.type, quantity: m.quantity, note: m.note, date: m.date })
    setShowForm(true)
  }

  const handleSave = async () => {
    setError(null)
    try {
      if (editing) {
        const res = await api.put<{ movement: InventoryMovement }>(`/api/store/movements/${editing.id}`, form)
        setMovements(prev => prev.map(m => m.id === editing.id ? res.data.movement : m))
      } else {
        const res = await api.post<{ movement: InventoryMovement }>('/api/store/movements', form)
        setMovements(prev => [res.data.movement, ...prev])
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      setError('No se pudo guardar el movimiento')
    }
  }

  const handleDelete = async (id: string) => {
    const prev = movements
    setMovements(prev.filter(m => m.id !== id))
    try {
      await api.delete(`/api/store/movements/${id}`)
    } catch {
      setMovements(prev)
      setError('No se pudo eliminar el movimiento')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Lato', sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={openNew} style={primaryBtnStyle}>
          <Plus size={15} /> Registrar movimiento
        </button>
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

      {showForm && (
        <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#000', margin: '0 0 16px' }}>
            {editing ? 'Editar movimiento' : 'Nuevo movimiento'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            <Field label="Producto">
              <select value={form.productId} onChange={e => handleProductChange(e.target.value)} style={inputStyle}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Tipo">
              <select value={form.type} onChange={e => set('type', e.target.value as MovementType)} style={inputStyle}>
                {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </Field>
            <Field label="Cantidad">
              <input type="number" min={1} value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Fecha">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Nota">
              <input value={form.note} onChange={e => set('note', e.target.value)} style={inputStyle} placeholder="Motivo..." />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={() => { setShowForm(false); setEditing(null) }} style={ghostBtnStyle}>Cancelar</button>
            <button onClick={handleSave} style={primaryBtnStyle}>Guardar</button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Nota', ''].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#000', fontSize: '15px' }}>Cargando...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#000', fontSize: '15px' }}>Sin movimientos registrados</td></tr>
            ) : movements.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={tdStyle}>{new Date(m.date).toLocaleDateString('es-AR')}</td>
                <td style={tdStyle}>{m.productName}</td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: '13px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                    background: `${TYPE_COLOR[m.type]}15`, color: TYPE_COLOR[m.type],
                  }}>
                    {TYPE_LABEL[m.type]}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700, color: TYPE_COLOR[m.type] }}>
                  {m.type === 'exit' ? '-' : '+'}{Math.abs(m.quantity)}
                </td>
                <td style={{ ...tdStyle, color: '#000' }}>{m.note || '—'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <IconBtn onClick={() => openEdit(m)} aria-label="Editar"><Edit2 size={14} /></IconBtn>
                    <IconBtn onClick={() => handleDelete(m.id)} aria-label="Eliminar" danger><Trash2 size={14} /></IconBtn>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
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
        width: '30px', height: '30px', border: 'none', borderRadius: '6px',
        background: h ? (danger ? 'rgba(229,57,53,0.1)' : 'rgba(6,148,148,0.1)') : 'transparent',
        color: h ? (danger ? '#e53935' : '#069494') : '#aaa',
        cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none', width: '100%',
  fontFamily: "'Lato', sans-serif", background: '#fff',
}
const thStyle: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: '12px',
  fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em',
}
const tdStyle: React.CSSProperties = {
  padding: '14px', color: '#000', verticalAlign: 'middle',
  fontFamily: "'Lato', sans-serif", fontSize: '15px',
}
const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '9px 18px', border: 'none', borderRadius: '8px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '14px', fontWeight: 600, fontFamily: "'Lato', sans-serif",
}
const ghostBtnStyle: React.CSSProperties = {
  padding: '9px 18px', border: '1px solid #e5e5e5', borderRadius: '8px',
  background: 'transparent', color: '#000', cursor: 'pointer',
  fontSize: '14px', fontFamily: "'Lato', sans-serif",
}