import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../app/useCatalog'
import { useCart } from '../app/useCart'
import { formatMXN } from '../app/money'
import { CartDrawer } from '../components/CartDrawer'
import { Navbar } from '../components/Navbar'
import { CategoryMenu } from '../components/CategoryMenu'
import { SearchModal } from '../components/SearchModal'
import { GradientVisual } from '../components/GradientVisual'
import { LocalImage } from '../components/LocalImage'
import { useSeo } from '../hooks/useSeo'
import { FREE_SHIPPING_SUBTOTAL } from '../app/site'

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const cart = useCart()
  const { products, categories } = useCatalog()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const product = products.find(p => p.id === productId)
  
  const [selectedVariantChoice, setSelectedVariantChoice] = useState(product?.variants[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useSeo({
    title: product ? `${product.name} | MUNEK SUPLEMENTOS` : 'Producto | MUNEK SUPLEMENTOS',
    description: product
      ? `${product.name} de ${product.brand}. Compra suplementos deportivos premium con envio a todo Mexico.`
      : 'Detalle de producto en MUNEK SUPLEMENTOS.',
    path: `/producto/${productId ?? ''}`,
  })

  if (!product) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Navbar
          cartCount={cart.totalItems}
          onOpenCart={() => cart.setCartOpen(true)}
          onOpenMenu={() => {}}
          onOpenSearch={() => {}}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
            <Link to="/" className="text-accent hover:underline">
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activeVariantId = product.variants.some((variant) => variant.id === selectedVariantChoice)
    ? selectedVariantChoice
    : (product.variants[0]?.id ?? '')
  const selectedVariant = product.variants.find((variant) => variant.id === activeVariantId) ?? product.variants[0] ?? null

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.inStock) {
      cart.add(selectedVariant.id, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const handleBuyNow = () => {
    if (selectedVariant && selectedVariant.inStock) {
      cart.add(selectedVariant.id, quantity)
      navigate('/checkout')
    }
  }

  // Get related products (same category)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-dvh bg-bg text-white">
      <Navbar
        cartCount={cart.totalItems}
        onOpenCart={() => cart.setCartOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-8">
        <nav className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
          <span className="mx-3 text-white/10">|</span>
          <Link to={`/?category=${product.category}`} className="hover:text-accent transition-colors">{product.category}</Link>
          <span className="mx-3 text-white/10">|</span>
          <span className="text-white/60">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square rounded-premium overflow-hidden glass flex items-center justify-center relative shadow-premium group">
            {product.image.kind === 'url' && (
              <img src={product.image.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
            )}
            {product.image.kind === 'local' && (
              <LocalImage id={product.image.id} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
            )}
            {product.image.kind === 'gradient' && (
              <>
                <GradientVisual a={product.image.a} b={product.image.b} className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-50" />
                <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                  <span className="text-6xl md:text-8xl font-black text-white/10 italic select-none">MUÑEK</span>
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-sm text-muted tracking-widest mb-2">{product.brand}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            
            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <span className="text-sm text-muted">(24 reseñas)</span>
            </div>

            {/* Price */}
            <div className="mb-10 flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">
                {selectedVariant ? formatMXN(selectedVariant.price) : formatMXN(product.variants[0].price)}
              </span>
              {selectedVariant && !selectedVariant.inStock && (
                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">Agotado</span>
              )}
            </div>

            {/* Variants */}
            <div className="mb-8">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Presentación / Sabor</label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantChoice(variant.id)}
                    className={`px-6 py-3 rounded-xl border font-bold text-sm transition-all duration-300 ${
                      activeVariantId === variant.id
                        ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20'
                        : 'border-white/10 glass hover:border-white/30 text-white/60'
                    } ${!variant.inStock ? 'opacity-30 line-through' : ''}`}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">Cantidad</label>
              <div className="flex items-center border border-hairline rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted hover:text-fg text-xl"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted hover:text-fg text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant?.inStock}
                className={`flex-1 py-5 px-8 rounded-xl font-black uppercase italic tracking-widest transition-all duration-300 shadow-premium ${
                  selectedVariant?.inStock
                    ? 'bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                }`}
              >
                {addedToCart ? '✓ EN EL CARRITO' : 'Añadir a la Élite'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedVariant?.inStock}
                className={`flex-1 py-5 px-8 rounded-xl font-black uppercase italic tracking-widest transition-all duration-300 shadow-premium ${
                  selectedVariant?.inStock
                    ? 'bg-accent text-white hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] shadow-accent/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                }`}
              >
                Checkout Rápido
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-hairline pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Envío gratis en pedidos desde {formatMXN(FREE_SHIPPING_SUBTOTAL)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Producto 100% original</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Entrega en 24-72 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <section className="mt-16 border-t border-hairline pt-12">
          <h2 className="text-2xl font-bold mb-6">Descripción del producto</h2>
          <div className="prose max-w-none text-muted whitespace-pre-wrap">
            {product.description ? (
              product.description
            ) : (
              <>
                <p>
                  {product.name} de {product.brand} es uno de los suplementos más populares en su categoría. 
                  Formulado con ingredientes de alta calidad para ayudarte a alcanzar tus objetivos fitness.
                </p>
                <p className="mt-4">
                  Ideal para {product.category === 'Proteína' ? 'la recuperación muscular y el crecimiento' :
                    product.category === 'Creatina' ? 'aumentar la fuerza y potencia muscular' :
                    product.category === 'Pre-entreno' ? 'maximizar tu rendimiento en el gimnasio' :
                    product.category === 'Aminoácidos' ? 'la recuperación y síntesis proteica' :
                    'aumentar tu masa muscular de forma efectiva'}.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-hairline pt-12">
            <h2 className="text-2xl font-bold mb-8">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/producto/${p.id}`}
                  className="group"
                >
                  <div 
                    className="aspect-square rounded-xl mb-3 transition-transform group-hover:scale-105 bg-linear-to-br from-gray-200 to-gray-50"
                  />
                  <div className="text-xs text-muted">{p.brand}</div>
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-accent font-semibold">{formatMXN(p.variants[0].price)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer mini */}
      <footer className="bg-fg text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-white/60 text-sm">
          © {new Date().getFullYear()} MUÑEK SUPLEMENTOS. Todos los derechos reservados.
        </div>
      </footer>

      <CategoryMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        active={null}
        onSelect={(cat) => {
          navigate(`/?category=${cat || ''}`)
          setMenuOpen(false)
        }}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(productId) => {
          navigate(`/producto/${productId}`)
        }}
      />

      <CartDrawer
        open={cart.cartOpen}
        onClose={() => cart.setCartOpen(false)}
      />
    </div>
  )
}
