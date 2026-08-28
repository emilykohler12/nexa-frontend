import { useState, useEffect } from 'react'
import { ShoppingBag, Store, Truck } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ClientOrder, OrderStatus } from './types'
import '@/pages/client/AppointmentsPage.css'

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: '#d4af37' },
  confirmed: { label: 'Confirmado', color: '#069494' },
  ready:     { label: 'Listo',      color: '#4caf50' },
  delivered: { label: 'Entregado',  color: '#4caf50' },
  cancelled: { label: 'Cancelado',  color: '#e53935' },
}

// Historial de compras del cliente — solo lectura, no se puede editar ni
// cancelar un pedido ya hecho desde acá.
export function OrdersHistory() {
  const { business } = useTenant()
  const [orders, setOrders] = useState<ClientOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ orders: ClientOrder[] }>('/api/client/orders')
      .then(res => setOrders(res.data.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null
  const { primaryColor, accentColor } = business

  return (
    <div className="appointments-page">
      <div className="appointments-welcome">
        <h1 style={{ color: primaryColor }}>Productos</h1>
        <p>Historial de tus compras en la tienda</p>
      </div>

      {loading ? (
        <div className="appointments-empty">
          <p>Cargando...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="appointments-empty">
          <ShoppingBag size={48} className="appointments-empty-icon" />
          <p>Todavía no compraste ningún producto</p>
        </div>
      ) : (
        <div className="appointments-list">
          {orders.map(order => {
            const status = STATUS_LABEL[order.status]
            return (
              <div key={order.id} className="appointment-card">
                <div className="appointment-card-top">
                  <div>
                    <h3 style={{ color: primaryColor }}>
                      {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                    </h3>
                    <div className="appointment-professional">
                      {order.delivery.type === 'pickup' ? <Store size={14} /> : <Truck size={14} />}
                      <span>{order.delivery.type === 'pickup' ? 'Retiro en el local' : (order.delivery.address ?? 'Envío a domicilio')}</span>
                    </div>
                  </div>
                  <span className="appointment-status" style={{ backgroundColor: `${status.color}1a`, color: status.color }}>
                    {status.label}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: `${primaryColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={15} color={primaryColor} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif" }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999', fontFamily: "'Lato', sans-serif" }}>x{item.quantity} · ${item.price.toLocaleString('es-AR')} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="appointment-footer">
                  <span className="appointment-price" style={{ color: accentColor }}>
                    ${order.total.toLocaleString('es-AR')}
                  </span>
                  <span style={{ fontSize: '13px', color: '#aaa', fontFamily: "'Lato', sans-serif" }}>
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
