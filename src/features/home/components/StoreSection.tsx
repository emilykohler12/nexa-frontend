import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/features/tenant/TenantContext'
import { useAuth } from '@/features/auth/AuthContext'
import { api } from '@/shared/utils/api'
import { ROUTES } from '@/app/config/routes.config'
import { FavoriteStarButton } from '@/shared/ui/atoms/FavoriteStarButton'

interface Product {
  id:       string
  name:     string
  brand:    string
  category: string
  imageUrl: string | null
  price:    number
  stock:    number
  status:   'active' | 'inactive' | 'out_of_stock'
}

export function StoreSection() {
  const { business } = useTenant()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [boughtId, setBoughtId] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ products: Product[] }>('/api/store/products')
      .then(res => setProducts(
        (res.data.products ?? []).filter(p => p.status === 'active' && p.stock > 0)
      ))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!business) return null

  const { primaryColor, accentColor, tiendaTitle, tiendaSubtitle } = business

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products

  const handleBuy = async (product: Product) => {
    if (!isAuthenticated || user?.role !== 'client') {
      navigate(ROUTES.LOGIN)
      return
    }
    setBuyingId(product.id)
    setBuyError(null)
    try {
      await api.post('/api/client/orders', { productId: product.id, quantity: 1 })
      setProducts(prev => prev
        .map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p)
        .filter(p => p.stock > 0)
      )
      setBoughtId(product.id)
      setTimeout(() => setBoughtId(null), 2500)
    } catch (err: any) {
      setBuyError(err?.response?.data?.error ?? 'No se pudo completar la compra.')
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Título */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}
          >
            {tiendaTitle}
          </h2>
          <p
            className="text-gray-500 max-w-2xl mx-auto text-lg"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {tiendaSubtitle}
          </p>
        </div>

        {/* Filtro de categorías */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                fontFamily: 'var(--font-lato)',
                backgroundColor: activeCategory === null ? primaryColor : '#f3f3f3',
                color: activeCategory === null ? 'white' : '#333',
              }}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-lato)',
                  backgroundColor: activeCategory === cat ? primaryColor : '#f3f3f3',
                  color: activeCategory === cat ? 'white' : '#333',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {buyError && (
          <p className="text-center text-sm mb-6" style={{ color: '#e53935', fontFamily: 'var(--font-lato)' }}>
            {buyError}
          </p>
        )}

        {/* Grilla de productos */}
        {loading ? (
          <div className="text-center py-20 text-gray-400" style={{ fontFamily: 'var(--font-lato)' }}>
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="text-center py-20 text-gray-400"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            No hay productos cargados todavía
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => {
              return (
                <div
                  key={product.id}
                  className="relative flex flex-col border rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                  style={{ borderColor: '#e5e5e5' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
                >
                  {/* Favorito */}
                  <div className="absolute top-3 right-3 z-10">
                    <FavoriteStarButton
                      type="product"
                      id={product.id}
                      name={product.name}
                      detail={`$${product.price.toLocaleString('es-AR')}`}
                      color={accentColor}
                    />
                  </div>

                  {/* Imagen / placeholder */}
                  <div
                    className="w-full h-32 rounded-xl flex items-center justify-center mb-4 overflow-hidden"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-3xl"
                        style={{ color: `${primaryColor}50` }}
                      >
                        🛍️
                      </span>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3
                    className="text-lg mb-1"
                    style={{ fontFamily: 'var(--font-playfair)', color: primaryColor }}
                  >
                    {product.name}
                  </h3>

                  {/* Marca */}
                  {product.brand && (
                    <p
                      className="text-sm text-gray-500 mb-3"
                      style={{ fontFamily: 'var(--font-lato)' }}
                    >
                      {product.brand}
                    </p>
                  )}

                  {/* Precio + stock */}
                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <span
                      className="text-xl font-bold"
                      style={{ color: accentColor, fontFamily: 'var(--font-playfair)' }}
                    >
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: '#16a34a', fontFamily: 'var(--font-lato)' }}
                    >
                      En stock
                    </span>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => handleBuy(product)}
                    disabled={buyingId === product.id}
                    className="w-full py-2 rounded-lg text-white text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-60"
                    style={{
                      backgroundColor: boughtId === product.id ? '#16a34a' : primaryColor,
                      fontFamily: 'var(--font-lato)',
                    }}
                  >
                    {buyingId === product.id ? 'Comprando...' : boughtId === product.id ? '✓ Comprado' : 'Comprar'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
