import { useState, useEffect } from 'react'
import { useTenant } from '@/features/tenant/TenantContext'
import { api } from '@/shared/utils/api'
import { FavoriteStarButton } from '@/shared/ui/atoms/FavoriteStarButton'
import { ProductDetailModal } from './ProductDetailModal'
import { useCart } from '@/features/store/CartContext'

interface Product {
  id:          string
  name:        string
  brand:       string
  category:    string
  imageUrl:    string | null
  price:       number
  stock:       number
  status:      'active' | 'inactive' | 'out_of_stock'
  description?: string | null
}

export function StoreSection() {
  const { business } = useTenant()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

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

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.imageUrl }, quantity)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <section className="w-full bg-white py-16 px-6 relative">
      <div className="max-w-[1400px] mx-auto">

        {/* Título */}
        <div className="text-center mb-12 relative">
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
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => setDetailProduct(product)}
                className="relative flex flex-col border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ borderColor: '#e5e5e5' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e5e5')}
              >
                {/* Favorito */}
                <div className="absolute top-3 right-3 z-10" onClick={e => e.stopPropagation()}>
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

                {/* Precio */}
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span
                    className="text-xl font-bold"
                    style={{ color: accentColor, fontFamily: 'var(--font-playfair)' }}
                  >
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Botón */}
                <button
                  onClick={e => { e.stopPropagation(); handleAddToCart(product) }}
                  className="w-full py-2 rounded-lg text-white text-sm transition-all duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: addedId === product.id ? accentColor : primaryColor,
                    fontFamily: 'var(--font-lato)',
                  }}
                >
                  {addedId === product.id ? '✓ Agregado' : 'Agregar al carrito'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onClose={() => setDetailProduct(null)}
          onAddToCart={quantity => handleAddToCart(detailProduct, quantity)}
        />
      )}
    </section>
  )
}
