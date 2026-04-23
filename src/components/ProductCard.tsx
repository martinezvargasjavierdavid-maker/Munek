import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../app/catalog'
import { formatMXN } from '../app/money'
import { GradientVisual } from './GradientVisual'
import { LocalImage } from './LocalImage'

type Props = {
  product: Product
  onAdd: (variantId: string, qty: number) => void
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function ProductCard({ product, onAdd }: Props) {
  const defaultVariant = product.variants.find((v) => v.inStock) ?? product.variants[0]
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? '')
  const [qty, setQty] = useState(1)

  const hit = useMemo(() => {
    return product.variants.find((v) => v.id === variantId) ?? defaultVariant
  }, [product.variants, variantId, defaultVariant])

  const inStock = !!hit?.inStock

  // Get unique sizes and flavors
  const sizes = [...new Set(product.variants.map((v) => v.size))]
  const flavors = [...new Set(product.variants.filter((v) => v.flavor).map((v) => v.flavor))]

  return (
    <article
      id={`product-${product.id}`}
      className="group bg-zinc-900/50 rounded-radius-premium overflow-hidden border border-hairline hover:shadow-premium transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image area with gradient, URL or Local */}
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          {product.image.kind === 'url' && (
            <img src={product.image.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} />
          )}
          {product.image.kind === 'local' && (
            <LocalImage id={product.image.id} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={product.name} />
          )}
          {product.image.kind === 'gradient' && (
            <GradientVisual a={product.image.a} b={product.image.b} className="absolute inset-0 h-full w-full" />
          )}
          <div className="absolute inset-0 opacity-20 bg-linear-to-br from-white/20 to-black/40" />

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-block glass text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Discount badge if applicable */}
          {hit?.compareAt && (
            <div className="absolute top-4 right-4">
              <span className="inline-block bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round((1 - hit.price / hit.compareAt) * 100)}%
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted tracking-widest mb-1">
          {product.brand}
        </div>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-semibold text-fg leading-tight mb-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-fg">
            {hit ? formatMXN(hit.price) : '—'}
          </span>
          {hit?.compareAt && (
            <span className="text-sm text-muted line-through">
              {formatMXN(hit.compareAt)}
            </span>
          )}
        </div>

        {/* Flavor/Size selector or info */}
        {product.variants.length > 1 ? (
          <>
            {flavors.length > 1 && (
              <div className="mb-3">
                <label className="block text-[10px] text-muted tracking-widest mb-1.5 uppercase">
                  Sabor
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.inStock}
                      onClick={() => setVariantId(v.id)}
                      className={
                        'px-2 py-1.5 text-xs rounded-lg border transition-colors ' +
                        (v.id === variantId
                          ? 'border-accent bg-accent text-white'
                          : v.inStock
                            ? 'border-white/10 glass hover:border-white/30'
                            : 'border-white/5 opacity-40 cursor-not-allowed')
                      }
                      title={v.label}
                    >
                      {v.flavor || v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flavors.length <= 1 && sizes.length > 1 && (
              <div className="mb-3">
                <label className="block text-[10px] text-muted tracking-widest mb-1.5 uppercase">
                  Tamaño
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.inStock}
                      onClick={() => setVariantId(v.id)}
                      className={
                        'px-2 py-1.5 text-xs rounded-lg border transition-colors ' +
                        (v.id === variantId
                          ? 'border-accent bg-accent text-white'
                          : v.inStock
                            ? 'border-white/10 glass hover:border-white/30'
                            : 'border-white/5 opacity-40 cursor-not-allowed')
                      }
                      title={v.label}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Single variant display */
          <div className="mb-3 flex flex-col gap-1">
            <div className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-black">Presentación</div>
            <div className="text-xs font-medium text-white/70 italic">
              {product.variants[0]?.flavor && (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  Sabor: {product.variants[0].flavor}
                </span>
              )}
              {product.variants[0]?.size && (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  Tamaño: {product.variants[0].size}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-hairline rounded-lg">
            <button
              type="button"
              onClick={() => setQty((q) => clampInt(q - 1, 1, 99))}
              className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-fg transition-colors"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => clampInt(q + 1, 1, 99))}
              className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-fg transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!hit || !inStock}
            onClick={() => hit && onAdd(hit.id, qty)}
            className={
              'flex-1 py-3 px-4 text-xs font-bold tracking-widest rounded-xl transition-all duration-300 ' +
              (!hit || !inStock
                ? 'bg-zinc-800 text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20')
            }
          >
            {inStock ? 'AGREGAR' : 'AGOTADO'}
          </button>
        </div>
      </div>
    </article>
  )
}
