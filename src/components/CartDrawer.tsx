import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../app/useCatalog'
import { useCart } from '../app/useCart'
import { formatMXN } from '../app/money'
import type { Product, Variant } from '../app/catalog'
import { GradientVisual } from './GradientVisual'
import { LocalImage } from './LocalImage'
import { FREE_SHIPPING_SUBTOTAL } from '../app/site'

type Props = {
  open: boolean
  onClose: () => void
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function CartDrawer({ open, onClose }: Props) {
  const cart = useCart()
  const { lookup } = useCatalog()

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
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_SUBTOTAL - cart.subtotal)

  return (
    <>
      {/* Backdrop */}
      <div
        className={
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ' +
          (open ? 'opacity-100' : 'pointer-events-none opacity-0')
        }
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar carrito"
      />

      {/* Drawer */}
      <aside
        className={
          'fixed right-0 top-0 z-50 h-dvh w-[min(440px,92vw)] glass shadow-premium transform transition-transform duration-500 ' +
          (open ? 'translate-x-0' : 'translate-x-full underline-offset-4')
        }
        aria-label="Carrito de compras"
      >
        <div className="flex flex-col h-full bg-bg/40 backdrop-blur-xl text-white">

          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Tu Carrito <span className="text-accent underline decoration-white/5 underline-offset-4">Élite</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">
                {cart.totalItems} artículo{cart.totalItems === 1 ? '' : 's'} seleccionados
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center glass hover:bg-white/10 rounded-full transition-all"
              aria-label="Cerrar carrito"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-6">
            {lines.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-muted">Tu carrito está vacío</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 text-sm font-semibold text-accent hover:underline"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {lines.map((l) => (
                  <div
                    key={l.variantId}
                    className="flex gap-6 p-6 glass rounded-2xl relative group"
                  >
                    {/* Item Background Glow */}
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10" />

                    {/* Product visual placeholder */}
                    <div className="w-24 h-24 rounded-xl shrink-0 glass overflow-hidden flex items-center justify-center text-[10px] font-black italic tracking-widest text-white/10 relative">
                      {l.product.image.kind === 'url' && (
                        <img src={l.product.image.url} className="w-full h-full object-cover" alt={l.product.name} />
                      )}
                      {l.product.image.kind === 'local' && (
                        <LocalImage id={l.product.image.id} className="w-full h-full object-cover" alt={l.product.name} />
                      )}
                      {l.product.image.kind === 'gradient' && (
                        <GradientVisual a={l.product.image.a} b={l.product.image.b} className="absolute inset-0 h-full w-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted tracking-widest">
                        {l.product.brand}
                      </div>
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {l.product.name}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">
                        {l.variant.label}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-white/10 rounded-xl glass">
                          <button
                            type="button"
                            onClick={() => {
                              if (l.qty <= 1) {
                                cart.remove(l.variantId)
                              } else {
                                cart.setQty(l.variantId, clampInt(l.qty - 1, 1, 99))
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-accent"
                            aria-label="Disminuir"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-black italic">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => cart.setQty(l.variantId, clampInt(l.qty + 1, 1, 99))}
                            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-accent"
                            aria-label="Aumentar"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-lg italic tracking-tighter">
                            {formatMXN(l.variant.price * l.qty)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => cart.remove(l.variantId)}
                      className="self-start p-1 text-muted hover:text-fg"
                      aria-label="Eliminar producto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {lines.length > 0 && (
            <div className="p-8 glass-dark border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Subtotal de Élite</span>
                <span className="text-3xl font-black italic tracking-tighter">{formatMXN(cart.subtotal)}</span>
              </div>

              {/* Free shipping message */}
              <div className="mb-8">
                {missingForFreeShipping === 0 ? (
                  <div className="flex items-center gap-3 text-accent text-[10px] font-black tracking-widest uppercase py-3 px-4 glass rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    STATUS: ENVÍO GRATIS ACTIVADO
                  </div>
                ) : (
                  <div className="text-[10px] text-white/30 font-black tracking-widest uppercase p-4 glass rounded-xl leading-relaxed">
                    Añade <span className="text-white">{formatMXN(missingForFreeShipping)}</span> más para desbloquear <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4">LOGÍSTICA GRATUITA</span>
                  </div>
                )}
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full bg-accent text-white font-black uppercase italic tracking-widest py-5 rounded-xl hover:bg-accent/80 transition-all duration-300 shadow-premium block text-center"
              >
                FINALIZAR COMPRA
              </Link>
              <button
                type="button"
                onClick={() => cart.clear()}
                className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-red-500 transition-colors py-2"
              >
                VACIAR CARRITO
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
