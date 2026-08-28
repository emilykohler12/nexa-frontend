import { useState, useEffect } from 'react';
import { api } from '@/shared/utils/api';
import { ProductsTab }   from './ProductsTab';
import { InventoryTab }  from './InventoryTab';
import type { StoreProduct } from '@/app/data/admin/store/types';

// ============================================================
// StorePage — módulo de tienda
// Tabs: Productos | Inventario | Pedidos
// ============================================================

type StoreTab = 'products' | 'inventory';

const TABS: { id: StoreTab; label: string }[] = [
  { id: 'products',  label: 'Productos'  },
  { id: 'inventory', label: 'Movimientos' },
];

export function StorePage() {
  const [activeTab, setActiveTab] = useState<StoreTab>('products');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ products: StoreProduct[] }>('/api/store/products')
      .then(res => setProducts(res.data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Lato', sans-serif" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#000', margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>
          Tienda
        </h1>
        <p style={{ fontSize: '16px', color: '#000', margin: 0 }}>
          Gestioná productos, inventario y pedidos
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '2px', background: '#f5f5f5',
        borderRadius: '10px', padding: '3px', width: 'fit-content',
      }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: '7px 20px', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              background: activeTab === id ? '#069494' : 'transparent',
              color:      activeTab === id ? '#fff'    : '#000',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{
        background: '#fff', border: '1px solid #e8e8e8',
        borderRadius: '16px', padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        {loading ? (
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#000', fontSize: '16px' }}>Cargando...</p>
        ) : (
          <>
            {activeTab === 'products'  && <ProductsTab products={products} onProductsChange={setProducts} />}
            {activeTab === 'inventory' && <InventoryTab products={products} />}
          </>
        )}
      </div>
    </div>
  );
}
