import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Upload, Check } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { safeErrorMessage } from '@/shared/utils/errorMessage'
import type { Promotion, PromotionType, PromotionStatus, PromotionKind, PromotionItem } from '@/app/data/admin/promotions/types'

const todayISO = () => new Date().toISOString().split('T')[0]

// Vigencia real de la promo según sus fechas de inicio/fin — independiente
// del estado "activa/inactiva" que pone el admin.
function vigencyLabel(promo: Promotion): { label: string; color: string } | null {
  const today = todayISO()
  if (promo.startDate && promo.startDate > today) return { label: `Empieza el ${promo.startDate}`, color: '#d4af37' }
  if (promo.endDate && promo.endDate < today) return { label: `Terminó el ${promo.endDate}`, color: '#999' }
  return null
}

function kindLabel(promo: Promotion): string {
  if (promo.kind === 'bundle') return `Combo (${promo.items.length} ítems)`
  if (promo.kind === 'buy_x_pay_y' && promo.buyQty && promo.payQty) return `Oferta ${promo.buyQty}x${promo.payQty}`
  return 'Descuento'
}

const TABS: { id: PromotionType; label: string }[] = [
  { id: 'service', label: 'Servicios' },
  { id: 'product',  label: 'Productos' },
]

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<PromotionType>('service')
  const [editing, setEditing]       = useState<Promotion | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    api.get<{ promotions: Promotion[] }>('/api/admin/promotions')
      .then(res => setPromotions(res.data.promotions ?? []))
      .catch(() => setError('No se pudieron cargar las promociones'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = promotions.filter(p => p.type === tab)

  const handleSave = async (promo: Promotion) => {
    setError(null)
    try {
      if (promo.id) {
        const res = await api.put<{ promotion: Promotion }>(`/api/admin/promotions/${promo.id}`, promo)
        setPromotions(prev => prev.map(p => p.id === promo.id ? res.data.promotion : p))
      } else {
        const res = await api.post<{ promotion: Promotion }>('/api/admin/promotions', promo)
        setPromotions(prev => [res.data.promotion, ...prev])
      }
      setShowForm(false)
      setEditing(null)
    } catch (err: any) {
      setError(safeErrorMessage(err, 'No se pudo guardar la promoción'))
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setError(null)
    try {
      await api.delete(`/api/admin/promotions/${confirmDelete.id}`)
      setPromotions(prev => prev.filter(p => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch {
      setError('No se pudo eliminar la promoción')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Promociones</h1>
          <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Ofertas de servicios y productos que aparecen en la página principal</p>
        </div>
        <button onClick={() => { setEditing(emptyPromotion(tab)); setShowForm(true) }} style={primaryBtnStyle}>
          <Plus size={16} /> Nueva promoción
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2px', background: '#f0f0f0', borderRadius: '10px', padding: '3px', width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              background: tab === t.id ? '#069494' : 'transparent',
              color: tab === t.id ? '#fff' : '#000',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#e53935', fontSize: '14px', fontWeight: 600, margin: 0 }}>{error}</p>}

      {showForm && editing && (
        <PromotionForm promotion={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}

      {loading ? (
        <p style={{ color: '#000' }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>
          Todavía no hay promociones de {tab === 'service' ? 'servicios' : 'productos'}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(promo => (
            <div key={promo.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '120px', background: 'rgba(6,148,148,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {promo.image ? <img src={promo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px' }}>🏷️</span>}
              </div>
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#000', fontSize: '16px' }}>{promo.title}</p>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', flexShrink: 0,
                    background: promo.status === 'active' ? 'rgba(6,148,148,0.1)' : 'rgba(150,150,150,0.1)',
                    color: promo.status === 'active' ? '#069494' : '#777',
                  }}>
                    {promo.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#d4af37' }}>{kindLabel(promo)}</p>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888' }}>
                  {promo.items.length > 0 ? promo.items.map(i => i.name).join(', ') : 'Sin vincular a ningún ítem real'}
                </p>
                {vigencyLabel(promo) && (
                  <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: vigencyLabel(promo)!.color }}>
                    {vigencyLabel(promo)!.label} — no se ve en el home
                  </p>
                )}
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {promo.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#069494', fontSize: '17px' }}>${promo.price.toLocaleString('es-AR')}</span>
                  {promo.originalPrice && (
                    <span style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through' }}>${promo.originalPrice.toLocaleString('es-AR')}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <IconBtn onClick={() => { setEditing(promo); setShowForm(true) }} aria-label="Editar"><Edit2 size={15} /></IconBtn>
                  <IconBtn onClick={() => setConfirmDelete(promo)} aria-label="Eliminar" danger><Trash2 size={15} /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div onClick={() => !deleting && setConfirmDelete(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#000' }}>¿Eliminar promoción?</p>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#000' }}>
              Se va a eliminar <strong>{confirmDelete.title}</strong> de la página principal.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} style={ghostBtnStyle}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...primaryBtnStyle, background: '#e53935' }}>
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const KIND_OPTIONS: { id: PromotionKind; label: string; hint: string }[] = [
  { id: 'discount',    label: 'Descuento',        hint: 'Un ítem a precio promocional (% o $ fijo)' },
  { id: 'bundle',      label: 'Combo',            hint: 'Dos o más ítems juntos a un precio combo' },
  { id: 'buy_x_pay_y', label: 'Oferta Nx M',      hint: 'Ej: 2x1, 3x2 — llevás N, pagás M' },
]

function PromotionForm({ promotion, onSave, onCancel }: { promotion: Promotion; onSave: (p: Promotion) => void; onCancel: () => void }) {
  const [form, setForm] = useState(promotion)
  const [options, setOptions] = useState<PromotionItem[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof Promotion, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const isProduct = form.type === 'product'
    const url = isProduct ? '/api/store/products' : '/api/services'
    const dataKey = isProduct ? 'products' : 'services'
    api.get<Record<string, any[]>>(url)
      .then(res => {
        const raw = res.data[dataKey] ?? []
        // Un producto inactivo o sin stock (o un servicio inactivo) no se
        // puede vender/reservar de verdad — no tiene sentido dejar armar una
        // promo con algo que después el checkout va a rechazar.
        const available = raw.filter((item: any) =>
          isProduct ? (item.status === 'active' && item.stock > 0) : item.status === 'active'
        )
        setOptions(available.map((item: any) => ({ id: item.id, name: item.name, price: Number(item.price) || 0 })))
      })
      .catch(() => setOptions([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type])

  const minItems = form.kind === 'bundle' ? 2 : 1
  const maxItems = form.type === 'service' ? 1 : (form.kind === 'bundle' ? Infinity : 1)

  const toggleItem = (opt: PromotionItem) => {
    const already = form.items.some(i => i.id === opt.id)
    let nextItems: PromotionItem[]
    if (already) {
      nextItems = form.items.filter(i => i.id !== opt.id)
    } else if (maxItems === 1) {
      nextItems = [opt]
    } else {
      nextItems = [...form.items, opt]
    }
    const updates: Partial<Promotion> = { items: nextItems }
    // En combo, sugerimos el precio original como la suma de precios reales;
    // en descuento/oferta Nx M, lo autocompletamos con el precio real del
    // ítem elegido — en los dos casos el admin igual puede pisarlo a mano.
    if (form.kind === 'bundle') {
      updates.originalPrice = nextItems.reduce((sum, i) => sum + i.price, 0)
    } else if (nextItems.length === 1) {
      updates.originalPrice = nextItems[0].price
    }
    setForm(f => ({ ...f, ...updates }))
  }

  const changeKind = (kind: PromotionKind) => {
    // Si venía de combo con varios ítems y pasa a algo de 1 solo, recortamos.
    const nextItems = (kind !== 'bundle' && form.items.length > 1) ? form.items.slice(0, 1) : form.items
    setForm(f => ({ ...f, kind, items: nextItems, buyQty: kind === 'buy_x_pay_y' ? (f.buyQty ?? 2) : null, payQty: kind === 'buy_x_pay_y' ? (f.payQty ?? 1) : null }))
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('image', reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const itemsValid = form.items.length >= minItems && form.items.length <= maxItems
  const canSave = form.title.trim().length > 0 && itemsValid && form.price > 0

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '14px', padding: '24px' }}>
      <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: '0 0 18px' }}>
        {form.id ? 'Editar promoción' : `Nueva promoción de ${form.type === 'service' ? 'servicio' : 'producto'}`}
      </p>

      {form.type === 'product' && (
        <div style={{ marginBottom: '16px' }}>
          <Field label="Tipo de promoción">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {KIND_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => changeKind(opt.id)}
                  title={opt.hint}
                  style={{
                    padding: '9px 16px', borderRadius: '9px', cursor: 'pointer',
                    border: `1.5px solid ${form.kind === opt.id ? '#069494' : '#ddd'}`,
                    background: form.kind === opt.id ? 'rgba(6,148,148,0.08)' : '#fff',
                    color: form.kind === opt.id ? '#069494' : '#444',
                    fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 700,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>
              {KIND_OPTIONS.find(k => k.id === form.kind)?.hint}
            </p>
          </Field>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <Field label={form.type === 'service' ? 'Servicio vinculado (obligatorio)' : `Producto${maxItems === 1 ? ' vinculado' : 's vinculados'} (obligatorio)`}>
          {options.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Cargando...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '8px', background: '#fff' }}>
              {options.map(opt => {
                const selected = form.items.some(i => i.id === opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleItem(opt)}
                    disabled={!selected && form.items.length >= maxItems}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      padding: '8px 10px', borderRadius: '7px', border: 'none', textAlign: 'left',
                      background: selected ? 'rgba(6,148,148,0.08)' : 'transparent',
                      cursor: 'pointer', fontFamily: "'Lato', sans-serif",
                      opacity: !selected && form.items.length >= maxItems ? 0.4 : 1,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#000' }}>
                      <span style={{
                        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                        border: `1.5px solid ${selected ? '#069494' : '#ccc'}`, background: selected ? '#069494' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {selected && <Check size={12} color="#fff" />}
                      </span>
                      {opt.name}
                    </span>
                    <span style={{ fontSize: '13px', color: '#888' }}>${opt.price.toLocaleString('es-AR')}</span>
                  </button>
                )
              })}
            </div>
          )}
          {!itemsValid && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#e53935', fontWeight: 600 }}>
              {form.kind === 'bundle' ? 'Elegí al menos 2 productos para armar el combo.' : `Elegí ${form.type === 'service' ? 'el servicio' : 'el producto'} al que aplica.`}
            </p>
          )}
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Field label="Título"><input value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} /></Field>

        {form.kind === 'buy_x_pay_y' ? (
          <>
            <Field label="Precio unitario ($)">
              <input type="number" min={0} value={form.price === 0 ? '' : form.price} onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Llevás (cantidad)">
              <input type="number" min={2} value={form.buyQty ?? ''} onChange={e => set('buyQty', e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
            </Field>
            <Field label="Pagás (cantidad)">
              <input type="number" min={1} value={form.payQty ?? ''} onChange={e => set('payQty', e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
            </Field>
          </>
        ) : (
          <>
            <Field label={form.kind === 'bundle' ? 'Precio del combo ($)' : 'Precio promocional ($)'}>
              <input type="number" min={0} value={form.price === 0 ? '' : form.price} onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label={form.kind === 'bundle' ? 'Precio real sumado ($)' : 'Precio original ($)'}>
              <input type="number" min={0} value={form.originalPrice ?? ''} onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : null)} style={inputStyle} readOnly={form.kind === 'bundle'} />
            </Field>
          </>
        )}

        <Field label="Estado">
          <select value={form.status} onChange={e => set('status', e.target.value as PromotionStatus)} style={inputStyle}>
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
          </select>
        </Field>
        <Field label="Fecha de inicio">
          <input type="date" value={form.startDate ?? ''} onChange={e => set('startDate', e.target.value || null)} style={inputStyle} />
        </Field>
        <Field label="Fecha de fin">
          <input type="date" value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value || null)} style={inputStyle} />
        </Field>
      </div>

      <div style={{ marginTop: '14px' }}>
        <Field label="Descripción">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>
      </div>

      <div style={{ marginTop: '14px' }}>
        <Field label="Imagen">
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: '72px', height: '72px', borderRadius: '10px', flexShrink: 0, border: '2px dashed #ccc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              {form.image ? <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={18} color="#999" />}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageFile} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} style={{ ...ghostBtnStyle, padding: '8px 16px', fontSize: '14px', alignSelf: 'flex-start' }}>
                {form.image ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
            </div>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
        <button onClick={onCancel} style={ghostBtnStyle}>Cancelar</button>
        <button onClick={() => onSave({ ...form, price: Number(form.price) || 0 })} disabled={!canSave} style={{ ...primaryBtnStyle, opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}>
          Guardar
        </button>
      </div>
    </div>
  )
}

const emptyPromotion = (type: PromotionType): Promotion => ({
  id: '', type, kind: 'discount', title: '', description: '', image: null, price: 0, originalPrice: null, status: 'active',
  items: [], buyQty: null, payQty: null, startDate: null, endDate: null,
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
        width: '32px', height: '32px', border: 'none', borderRadius: '7px',
        background: h ? (danger ? 'rgba(229,57,53,0.1)' : 'rgba(6,148,148,0.1)') : 'transparent',
        color: h ? (danger ? '#e53935' : '#069494') : '#999',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px',
  fontSize: '15px', color: '#000', outline: 'none', width: '100%',
  fontFamily: "'Lato', sans-serif", background: '#fff',
}
const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '10px 20px', border: 'none', borderRadius: '9px',
  background: '#069494', color: '#fff', cursor: 'pointer',
  fontSize: '15px', fontWeight: 700, fontFamily: "'Lato', sans-serif",
}
const ghostBtnStyle: React.CSSProperties = {
  padding: '9px 18px', border: '1px solid #e5e5e5', borderRadius: '8px',
  background: 'transparent', color: '#000', cursor: 'pointer',
  fontSize: '14px', fontFamily: "'Lato', sans-serif",
}
