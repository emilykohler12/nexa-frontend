import { useState, useEffect } from 'react'
import { Store, Truck, Check } from 'lucide-react'
import { api } from '@/shared/utils/api'
import { useToast } from '@/shared/ui/molecules/ToastProvider'

interface OrderItem { productName: string; quantity: number; unitPrice: number }

type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled'
type PaymentStatus = 'pending' | 'paid' | 'rejected' | 'cancelled' | 'refunded'

interface AdminOrder {
  id: string
  clientName: string
  clientPhone: string
  items: OrderItem[]
  total: number
  delivery: { type: 'pickup' | 'delivery'; address: string | null }
  phone: string | null
  notes: string | null
  paymentMethod: string | null
  paymentStatus: PaymentStatus
  status: OrderStatus
  createdAt: string
}

const PAYMENT_LABEL: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  whatsapp:    'Coordinado por WhatsApp',
}

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending',   label: 'Sin pagar' },
  { value: 'paid',      label: 'Pago' },
  { value: 'rejected',  label: 'Rechazado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'refunded',  label: 'Reembolsado' },
]

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  pending: '#b8960c', paid: '#069494', rejected: '#e53935', cancelled: '#999', refunded: '#999',
}

export function OrdersTab() {
  const [orders, setOrders]     = useState<AdminOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    api.get<{ orders: AdminOrder[] }>('/api/admin/orders')
      .then(res => setOrders(res.data.orders ?? []))
      .catch(() => showToast('No se pudieron cargar los pedidos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const updateOrder = async (id: string, data: { status?: OrderStatus; paymentStatus?: PaymentStatus }) => {
    setSavingId(id)
    try {
      const res = await api.patch<{ status: OrderStatus; paymentStatus: PaymentStatus }>(`/api/admin/orders/${id}`, data)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...res.data } : o))
    } catch {
      showToast('No se pudo actualizar el pedido', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              {['Fecha', 'Cliente', 'Productos', 'Entrega', 'Pago', 'Total'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#000', fontSize: '15px' }}>Cargando...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#000', fontSize: '15px' }}>Todavía no hay pedidos</td></tr>
            ) : orders.map(o => {
              const fulfillmentLabel = o.delivery.type === 'pickup' ? 'Retirado' : 'Entregado'
              const isFulfilled = o.status === 'delivered'
              const isCancelled = o.status === 'cancelled'
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString('es-AR')}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{o.clientName}</div>
                    {(o.phone || o.clientPhone) && <div style={{ fontSize: '13px', color: '#777' }}>{o.phone || o.clientPhone}</div>}
                  </td>
                  <td style={tdStyle}>
                    {o.items.map((it, i) => (
                      <div key={i} style={{ fontSize: '14px' }}>{it.quantity}x {it.productName}</div>
                    ))}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {o.delivery.type === 'pickup' ? <Store size={13} /> : <Truck size={13} />}
                      {o.delivery.type === 'pickup' ? 'Retiro' : 'Envío'}
                    </span>
                    {o.delivery.address && <div style={{ fontSize: '13px', color: '#777', marginBottom: '4px' }}>{o.delivery.address}</div>}
                    {isFulfilled ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#069494' }}>
                        <Check size={12} /> {fulfillmentLabel}
                      </span>
                    ) : !isCancelled ? (
                      <button
                        onClick={() => updateOrder(o.id, { status: 'delivered' })}
                        disabled={savingId === o.id}
                        style={{
                          padding: '5px 10px', border: '1px solid #e5e5e5', borderRadius: '7px',
                          background: '#f8f8f8', color: '#000', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 600, fontFamily: "'Lato', sans-serif",
                          opacity: savingId === o.id ? 0.6 : 1,
                        }}
                      >
                        Marcar {fulfillmentLabel.toLowerCase()}
                      </button>
                    ) : null}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>{o.paymentMethod ? PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod : '—'}</div>
                    <select
                      value={o.paymentStatus}
                      disabled={savingId === o.id}
                      onChange={e => updateOrder(o.id, { paymentStatus: e.target.value as PaymentStatus })}
                      style={{
                        fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '8px',
                        background: `${PAYMENT_STATUS_COLOR[o.paymentStatus]}15`, color: PAYMENT_STATUS_COLOR[o.paymentStatus],
                        border: `1px solid ${PAYMENT_STATUS_COLOR[o.paymentStatus]}33`, cursor: 'pointer',
                        fontFamily: "'Lato', sans-serif",
                      }}
                    >
                      {PAYMENT_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>${o.total.toLocaleString('es-AR')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: '12px',
  fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em',
}
const tdStyle: React.CSSProperties = {
  padding: '14px', color: '#000', verticalAlign: 'middle',
  fontFamily: "'Lato', sans-serif", fontSize: '15px',
}
