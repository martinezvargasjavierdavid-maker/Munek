import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../app/useCatalog'
import { useCart } from '../app/useCart'
import { formatMXN } from '../app/money'
import { Navbar } from '../components/Navbar'
import { CartDrawer } from '../components/CartDrawer'
import { CategoryMenu } from '../components/CategoryMenu'
import { SearchModal } from '../components/SearchModal'
import type { Product, Variant } from '../app/catalog'
import { useSeo } from '../hooks/useSeo'
import {
  FREE_SHIPPING_SUBTOTAL,
  MERCADO_PAGO_LINK,
  SHIPPING_COST,
  STRIPE_LINK,
  WHATSAPP_NUMBER,
} from '../app/site'

export function CheckoutPage() {
  const cart = useCart()
  const { lookup, categories } = useCatalog()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'mercadopago' | 'stripe'>('whatsapp')

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')

  const lines = useMemo(() => {
    return cart.lines
      .map((l) => {
        const hit = lookup.byVariantId[l.variantId]
        if (!hit) return null
        return { ...l, product: hit.product, variant: hit.variant }
      })
      .filter(Boolean)
  }, [cart.lines, lookup.byVariantId]) as Array<{
    variantId: string
    qty: number
    product: Product
    variant: Variant
  }>

  const shipping = cart.subtotal >= FREE_SHIPPING_SUBTOTAL ? 0 : SHIPPING_COST
  const total = cart.subtotal + shipping

  useSeo({
    title: 'Checkout | MUNEK SUPLEMENTOS',
    description: 'Finaliza tu pedido de suplementos deportivos en MUNEK SUPLEMENTOS.',
    path: '/checkout',
    robots: 'noindex, nofollow',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === 'whatsapp') {
      // Build WhatsApp message using only standard characters to avoid encoding issues
      const divider = '-----------------------------------';

      let message = `*NUEVO PEDIDO - MUNEK SUPLEMENTOS*\n`
      message += `${divider}\n\n`
      
      message += `*DATOS DEL CLIENTE*\n`
      message += `* Nombre: ${name}\n`
      message += `* Telefono: ${phone}\n`
      message += `* Email: ${email}\n`
      message += `* Direccion: ${address}, ${city}\n`
      if (notes) message += `* Notas: ${notes}\n`
      
      message += `\n${divider}\n`
      message += `*DETALLE DEL PEDIDO*\n`
      message += `${divider}\n`

      lines.forEach((l) => {
        message += `* ${l.product.name}\n`
        message += `  (${l.variant.label})\n`
        message += `  Cantidad: ${l.qty}\n`
        message += `  Precio: ${formatMXN(l.variant.price * l.qty)}\n\n`
      })

      message += `${divider}\n`
      message += `*RESUMEN DE COMPRA*\n`
      message += `${divider}\n`
      message += `* Subtotal: ${formatMXN(cart.subtotal)}\n`
      message += `* Envio: ${shipping === 0 ? 'GRATIS' : formatMXN(shipping)}\n`
      message += `* TOTAL A PAGAR: ${formatMXN(total)}\n\n`
      
      message += `${divider}\n`
      message += `*¡Sigue rompiendo tus limites!*`

      const encodedMessage = encodeURIComponent(message)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer')

    } else if (paymentMethod === 'mercadopago' && MERCADO_PAGO_LINK) {
      window.open(MERCADO_PAGO_LINK, '_blank', 'noopener,noreferrer')

    } else if (paymentMethod === 'stripe' && STRIPE_LINK) {
      window.open(STRIPE_LINK, '_blank', 'noopener,noreferrer')
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col">
        <Navbar
          cartCount={cart.totalItems}
          onOpenCart={() => cart.setCartOpen(true)}
          onOpenMenu={() => { }}
          onOpenSearch={() => { }}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-20 h-20 mx-auto text-gray-200 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted mb-6">Agrega productos para continuar con tu compra</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              ← Ir a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg text-white">
      <Navbar
        cartCount={cart.totalItems}
        onOpenCart={() => cart.setCartOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-accent transition-all pt-24 mb-10">
          <span className="w-10 h-px bg-white/10" />
          Volver al Catálogo de Élite
        </Link>

        <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase italic tracking-tighter">Finalizar <span className="text-accent underline decoration-white/5 underline-offset-4">Compra</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <section className="glass rounded-radius-premium p-8 shadow-premium">
                <h2 className="text-xs font-black mb-10 tracking-[0.3em] uppercase italic text-accent">01. Contacto Élite</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-white placeholder:text-white/10"
                      placeholder="JUAN PÉREZ"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Teléfono *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder="222 123 4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping */}
              <section className="glass rounded-radius-premium p-8 shadow-premium">
                <h2 className="text-xs font-black mb-10 tracking-[0.3em] uppercase italic text-accent">02. Envío de Élite</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                      Dirección Completa
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder="Calle, número, colonia, CP"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      Ciudad y Estado *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder="Puebla, Puebla"
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-1">
                      Notas del pedido (opcional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-white placeholder:text-white/10 resize-none"
                      placeholder="Instrucciones especiales de entrega..."
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="glass rounded-radius-premium p-8 shadow-premium">
                <h2 className="text-xs font-black mb-10 tracking-[0.3em] uppercase italic text-accent">03. Método de Pago</h2>
                <div className="space-y-4">
                  <label className={`flex items-center gap-6 p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${paymentMethod === 'whatsapp' ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5 glass hover:border-white/20'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="whatsapp"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="sr-only"
                    />
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-black uppercase italic tracking-tighter text-white">WhatsApp</div>
                      <div className="text-xs text-white/40 font-medium">Coordinación directa con asesor de élite</div>
                    </div>
                    {paymentMethod === 'whatsapp' && (
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>

                  {MERCADO_PAGO_LINK && (
                    <label className={`flex items-center gap-6 p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${paymentMethod === 'mercadopago' ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5 glass hover:border-white/20'
                      }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={() => setPaymentMethod('mercadopago')}
                        className="sr-only"
                      />
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-black text-xs">MP</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-black uppercase italic tracking-tighter text-white">Mercado Pago</div>
                        <div className="text-xs text-white/40 font-medium">Tarjeta, transferencia, OXXO</div>
                      </div>
                      {paymentMethod === 'mercadopago' && (
                        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  )}

                  {STRIPE_LINK && (
                    <label className={`flex items-center gap-6 p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${paymentMethod === 'stripe' ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5 glass hover:border-white/20'
                      }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                        className="sr-only"
                      />
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-white font-black text-xs">S</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-black uppercase italic tracking-tighter text-white">Stripe</div>
                        <div className="text-xs text-white/40 font-medium">Tarjeta de crédito/débito</div>
                      </div>
                      {paymentMethod === 'stripe' && (
                        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1.5 1.5 0 00-1.414-1.414L9 10.586 7.707 9.293a1.5 1.5 0 00-1.414 1.414l2 2a1.5 1.5 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  )}
                </div>
              </section>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white font-black py-5 rounded-2xl transition-all duration-500 uppercase italic tracking-widest shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-95 flex items-center justify-center gap-3 group"
              >
                {paymentMethod === 'whatsapp' ? 'Enviar pedido Élite' : 'Continuar al pago seguro'}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-radius-premium p-8 sticky top-32 shadow-premium">
              <h2 className="text-xs font-black mb-10 tracking-[0.3em] uppercase italic text-accent">Resumen Élite</h2>

              <div className="space-y-4 mb-6">
                {lines.map((l) => (
                  <div key={l.variantId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-200 to-gray-50" />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{l.product.name}</p>
                      <p className="text-xs text-muted">{l.variant.label} x{l.qty}</p>
                    </div>
                    <div className="text-sm font-semibold">{formatMXN(l.variant.price * l.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-hairline pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatMXN(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Envío</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'GRATIS' : formatMXN(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted">
                    Envío gratis en compras desde {formatMXN(FREE_SHIPPING_SUBTOTAL)}
                  </p>
                )}
              </div>

              <div className="border-t border-hairline mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatMXN(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
