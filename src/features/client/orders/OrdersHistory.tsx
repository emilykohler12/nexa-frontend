import { useState, useEffect } from 'react'
import { ShoppingBag, Store, Truck } from 'lucide-react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import type { ClientOrder, OrderStatus } from './types'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>
      <div>
        <h1 style={{ fontSize: '29px', fontWeight: 700, color: '#000', margin: '0 0 4px' }}>Productos</h1>
        <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>Historial de tus compras en la tienda</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '48px', color: '#000', fontSize: '16px' }}>Cargando...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#aaa' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>Todavía no compraste ningún producto</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => {
            const status = STATUS_LABEL[order.status]
            return (
              <div key={order.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                    {new Date(order.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: `${status.color}18`, color: status.color, whiteSpace: 'nowrap' }}>
                    {status.label}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: `${primaryColor}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={16} color={primaryColor} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>x{item.quantity} · ${item.price.toLocaleString('es-AR')} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                  {order.delivery.type === 'pickup' ? <Store size={14} /> : <Truck size={14} />}
                  {order.delivery.type === 'pickup' ? 'Retiro en el local' : (order.delivery.address ?? 'Envío a domicilio')}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f3f3f3' }}>
                  <span style={{ fontSize: '13px', color: '#999' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: accentColor }}>${order.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
