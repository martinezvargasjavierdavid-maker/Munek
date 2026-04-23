import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buildVariantLabel, getProductPrimaryImage, type Product } from '../app/catalog'
import { formatMXN } from '../app/money'
import { ProductImageView } from './ProductImageView'

type Props = {
  product: Product
  onAdd: (variantId: string, qty: number) => void
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function ProductCard({ product, onAdd }: Props) {
  const [qty, setQty] = useState(1)
  const image = getProductPrimaryImage(product)
  const presentation = buildVariantLabel(product.variant)

  return (
    <article
      id={`product-${product.id}`}
      className="group bg-zinc-900/50 rounded-radius-premium overflow-hidden border border-hairline hover:shadow-premium transition-all duration-500 hover:-translate-y-1"
    >
      <Link to={`/producto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <ProductImageView
            image={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 opacity-20 bg-linear-to-br from-white/20 to-black/40" />

          <div className="absolute top-4 left-4 z-20">
            <span className="inline-block glass text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
              {product.category}
            </span>
          </div>

          {product.variant.compareAt && (
            <div className="absolute top-4 right-4">
              <span className="inline-block bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round((1 - product.variant.price / product.variant.compareAt) * 100)}%
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>

      <div className="p-4">
        <div className="text-xs text-muted tracking-widest mb-1">{product.brand}</div>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-semibold text-fg leading-tight mb-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-fg">{formatMXN(product.variant.price)}</span>
          {product.variant.compareAt && (
            <span className="text-sm text-muted line-through">
              {formatMXN(product.variant.compareAt)}
            </span>
          )}
        </div>

        <div className="mb-3 flex flex-col gap-1">
          <div className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-black">
            Presentación
          </div>
          <div className="text-xs font-medium text-white/70 italic">{presentation}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-hairline rounded-lg">
            <button
              type="button"
              onClick={() => setQty((value) => clampInt(value - 1, 1, 99))}
              className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-fg transition-colors"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((value) => clampInt(value + 1, 1, 99))}
              className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-fg transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={!product.variant.inStock}
            onClick={() => onAdd(product.variant.id, qty)}
            className={
              'flex-1 py-3 px-4 text-xs font-bold tracking-widest rounded-xl transition-all duration-300 ' +
              (!product.variant.inStock
                ? 'bg-zinc-800 text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20')
            }
          >
            {product.variant.inStock ? 'AGREGAR' : 'AGOTADO'}
          </button>
        </div>
      </div>
    </article>
  )
}
