import type { ProductImage } from '../app/catalog'
import { GradientVisual } from './GradientVisual'
import { LocalImage } from './LocalImage'

type Props = {
  image: ProductImage
  alt: string
  className?: string
}

export function ProductImageView({ image, alt, className }: Props) {
  if (image.kind === 'url') {
    return <img src={image.url} alt={alt} className={className} />
  }

  if (image.kind === 'local') {
    return <LocalImage id={image.id} alt={alt} className={className} />
  }

  return <GradientVisual a={image.a} b={image.b} className={className} />
}
