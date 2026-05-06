import { useState } from 'react'
import type { ProductImage } from '../app/catalog'
import { ProductImageView } from './ProductImageView'

type Props = {
  images: ProductImage[]
  name: string
}

function clampIndex(index: number, length: number) {
  if (length === 0) return 0
  return (index + length) % length
}

export function ProductGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeImages = images.length > 0 ? images : []

  if (safeImages.length === 0) return null

  const displayIndex = activeIndex < safeImages.length ? activeIndex : 0
  const activeImage = safeImages[displayIndex] ?? safeImages[0]

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-premium overflow-hidden glass flex items-center justify-center relative shadow-premium group">
        <ProductImageView
          image={activeImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => clampIndex(current - 1, safeImages.length))}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass text-white transition-colors hover:bg-white/10"
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((current) => clampIndex(current + 1, safeImages.length))}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass text-white transition-colors hover:bg-white/10"
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {safeImages.map((image, index) => (
            <button
              key={`${name}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-2xl border transition-all ${
                index === displayIndex
                  ? 'border-accent shadow-lg shadow-accent/20'
                  : 'border-white/10 hover:border-white/30'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <ProductImageView
                image={image}
                alt={`${name} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
