export type Category =
  | 'Creatina'
  | 'Proteína'
  | 'Pre-entreno'
  | 'Aminoácidos'
  | 'Ganador'
  | 'Accesorios'
  | 'Vitaminas'
  | 'Minerales'
  | 'Extras'
  | 'Hybrid Club'

export const CATEGORY_OPTIONS: Category[] = [
  'Proteína',
  'Creatina',
  'Pre-entreno',
  'Aminoácidos',
  'Ganador',
  'Accesorios',
  'Vitaminas',
  'Minerales',
  'Extras',
  'Hybrid Club',
]

export type ProductImage =
  | { kind: 'gradient'; a: string; b: string }
  | { kind: 'url'; url: string }
  | { kind: 'local'; id: string }

export type Variant = {
  id: string
  label: string
  size: string
  flavor?: string
  price: number
  compareAt?: number
  inStock: boolean
}

export type Product = {
  id: string
  groupId: string
  name: string
  brand: string
  category: Category
  description: string
  tags?: string[]
  images: ProductImage[]
  variant: Variant
}

type LegacyProduct = {
  id: string
  groupId?: string
  name: string
  brand: string
  category: Category
  description: string
  tags?: string[]
  image?: ProductImage
  images?: ProductImage[]
  variant?: Partial<Variant>
  variants?: Partial<Variant>[]
}

export const MAX_PRODUCT_IMAGES = 4

export function createDefaultProductImage(): ProductImage {
  return { kind: 'gradient', a: '#d10b1c', b: '#0b0b0c' }
}

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && CATEGORY_OPTIONS.includes(value as Category)
}

function normalizeCategory(value: unknown): Category {
  return isCategory(value) ? value : 'Extras'
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return undefined
  const tags = value
    .map((tag) => normalizeString(tag))
    .filter(Boolean)
  return tags.length > 0 ? tags : undefined
}

function normalizeImage(rawImage: unknown): ProductImage | null {
  if (!rawImage || typeof rawImage !== 'object') return null

  const image = rawImage as Partial<ProductImage>

  if (image.kind === 'gradient') {
    const a = normalizeString(image.a)
    const b = normalizeString(image.b)
    if (a && b) return { kind: 'gradient', a, b }
  }

  if (image.kind === 'url') {
    const url = normalizeString(image.url)
    if (url) return { kind: 'url', url }
  }

  if (image.kind === 'local') {
    const id = normalizeString(image.id)
    if (id) return { kind: 'local', id }
  }

  return null
}

export function normalizeProductImages(
  rawImages: unknown,
  rawImage?: unknown,
): ProductImage[] {
  const imagesFromArray = Array.isArray(rawImages)
    ? rawImages.map((image) => normalizeImage(image)).filter(Boolean)
    : []

  if (imagesFromArray.length > 0) {
    return imagesFromArray.slice(0, MAX_PRODUCT_IMAGES) as ProductImage[]
  }

  const singleImage = normalizeImage(rawImage)
  return [singleImage ?? createDefaultProductImage()]
}

export function buildVariantLabel(input: {
  label?: string
  size?: string
  flavor?: string
}) {
  const explicitLabel = normalizeString(input.label)
  if (explicitLabel) return explicitLabel

  const size = normalizeString(input.size)
  const flavor = normalizeString(input.flavor)
  const parts = [size, flavor].filter(Boolean)

  return parts.join(' • ') || 'Presentación estándar'
}

function normalizeVariant(rawVariant: unknown, fallbackId: string): Variant {
  const variant = (rawVariant ?? {}) as Partial<Variant>
  const size = normalizeString(variant.size)
  const flavor = normalizeString(variant.flavor) || undefined
  const price = Math.max(0, normalizeNumber(variant.price))
  const compareAt = normalizeNumber(variant.compareAt)

  return {
    id: normalizeString(variant.id) || fallbackId,
    label: buildVariantLabel({ label: variant.label, size, flavor }),
    size,
    flavor,
    price,
    compareAt: compareAt > price ? compareAt : undefined,
    inStock: typeof variant.inStock === 'boolean' ? variant.inStock : true,
  }
}

function normalizeNewProduct(rawProduct: LegacyProduct, fallbackIndex: number): Product {
  const productId = normalizeString(rawProduct.id) || `product-${fallbackIndex + 1}`
  const variant = normalizeVariant(
    rawProduct.variant,
    `${productId}-variant`,
  )

  return {
    id: productId,
    groupId: normalizeString(rawProduct.groupId) || productId,
    name: normalizeString(rawProduct.name),
    brand: normalizeString(rawProduct.brand),
    category: normalizeCategory(rawProduct.category),
    description: normalizeString(rawProduct.description),
    tags: normalizeTags(rawProduct.tags),
    images: normalizeProductImages(rawProduct.images, rawProduct.image),
    variant,
  }
}

function flattenLegacyProduct(rawProduct: LegacyProduct, fallbackIndex: number): Product[] {
  const baseId = normalizeString(rawProduct.id) || `product-${fallbackIndex + 1}`
  const groupId = normalizeString(rawProduct.groupId) || baseId
  const variants = Array.isArray(rawProduct.variants) ? rawProduct.variants : []

  if (variants.length === 0) {
    return [normalizeNewProduct(rawProduct, fallbackIndex)]
  }

  return variants.map((rawVariant, variantIndex) => {
    const variant = normalizeVariant(
      rawVariant,
      `${baseId}-variant-${variantIndex + 1}`,
    )

    return {
      id: variants.length === 1 ? baseId : `${groupId}__${variant.id}`,
      groupId,
      name: normalizeString(rawProduct.name),
      brand: normalizeString(rawProduct.brand),
      category: normalizeCategory(rawProduct.category),
      description: normalizeString(rawProduct.description),
      tags: normalizeTags(rawProduct.tags),
      images: normalizeProductImages(rawProduct.images, rawProduct.image),
      variant,
    }
  })
}

export function normalizeCatalog(rawProducts: unknown): Product[] {
  if (!Array.isArray(rawProducts)) return []

  const normalizedProducts = rawProducts.flatMap((rawProduct, index) => {
    if (!rawProduct || typeof rawProduct !== 'object') return []

    const candidate = rawProduct as LegacyProduct
    if ('variant' in candidate) {
      return [normalizeNewProduct(candidate, index)]
    }

    return flattenLegacyProduct(candidate, index)
  })

  const deduped = new Map<string, Product>()
  normalizedProducts.forEach((product) => {
    deduped.set(product.id, product)
  })

  return [...deduped.values()]
}

export function getProductPrimaryImage(product: Product) {
  return product.images[0] ?? createDefaultProductImage()
}

const g = (a: string, b: string) => ({ kind: 'gradient' as const, a, b })

const legacyCatalog: LegacyProduct[] = [
  {
    id: 'p-crea-01',
    name: 'Creatina Monohidratada Micronizada',
    brand: 'MUÑEK LABS',
    category: 'Creatina',
    description:
      'Pura, sin rellenos. Fuerza, potencia y mejor rendimiento en series pesadas.',
    tags: ['monohidratada', 'micronizada', 'fuerza', 'volumen'],
    image: g('#d10b1c', '#0b0b0c'),
    variants: [
      {
        id: 'v-crea-250',
        label: '250 g • Sin sabor',
        size: '250 g',
        flavor: 'Sin sabor',
        price: 349,
        compareAt: 399,
        inStock: true,
      },
      {
        id: 'v-crea-500',
        label: '500 g • Sin sabor',
        size: '500 g',
        flavor: 'Sin sabor',
        price: 549,
        compareAt: 649,
        inStock: true,
      },
      {
        id: 'v-crea-1k',
        label: '1 kg • Sin sabor',
        size: '1 kg',
        flavor: 'Sin sabor',
        price: 899,
        compareAt: 999,
        inStock: true,
      },
    ],
  },
  {
    id: 'p-whey-01',
    name: 'Whey Protein Isolate 90',
    brand: 'MUÑEK LABS',
    category: 'Proteína',
    description:
      'Alta proteína por porción, textura limpia y sabores discretos, sin empalagar.',
    tags: ['whey', 'isolate', 'proteína', 'recuperación'],
    image: g('#0b0b0c', '#3a0b10'),
    variants: [
      {
        id: 'v-whey-1lb-van',
        label: '1 lb • Vainilla',
        size: '1 lb',
        flavor: 'Vainilla',
        price: 699,
        inStock: true,
      },
      {
        id: 'v-whey-2lb-choc',
        label: '2 lb • Chocolate',
        size: '2 lb',
        flavor: 'Chocolate',
        price: 999,
        compareAt: 1099,
        inStock: true,
      },
      {
        id: 'v-whey-5lb-fresa',
        label: '5 lb • Fresa',
        size: '5 lb',
        flavor: 'Fresa',
        price: 1999,
        compareAt: 2199,
        inStock: true,
      },
    ],
  },
  {
    id: 'p-pre-01',
    name: 'Pre-Entreno Clean Focus',
    brand: 'MUÑEK LABS',
    category: 'Pre-entreno',
    description:
      'Energía y enfoque con sensación limpia. Ideal para sesiones intensas.',
    tags: ['preworkout', 'energía', 'pump', 'focus'],
    image: g('#1b1b1d', '#d10b1c'),
    variants: [
      {
        id: 'v-pre-20-serv',
        label: '20 servicios • Sandía',
        size: '20 servicios',
        flavor: 'Sandía',
        price: 499,
        inStock: true,
      },
      {
        id: 'v-pre-30-serv',
        label: '30 servicios • Mango',
        size: '30 servicios',
        flavor: 'Mango',
        price: 649,
        inStock: true,
      },
      {
        id: 'v-pre-30-serv-u',
        label: '30 servicios • Sin sabor',
        size: '30 servicios',
        flavor: 'Sin sabor',
        price: 629,
        inStock: false,
      },
    ],
  },
  {
    id: 'p-bcaa-01',
    name: 'BCAA 2:1:1 + Electrolitos',
    brand: 'MUÑEK LABS',
    category: 'Aminoácidos',
    description:
      'Hidratación y aminoácidos para sesiones largas. Sabor ligero, cero pesadez.',
    tags: ['bcaa', 'electrolitos', 'hidratación'],
    image: g('#c8c3bb', '#0b0b0c'),
    variants: [
      {
        id: 'v-bcaa-30',
        label: '30 servicios • Limón',
        size: '30 servicios',
        flavor: 'Limón',
        price: 449,
        inStock: true,
      },
      {
        id: 'v-bcaa-30-frutos',
        label: '30 servicios • Frutos rojos',
        size: '30 servicios',
        flavor: 'Frutos rojos',
        price: 449,
        inStock: true,
      },
    ],
  },
  {
    id: 'p-mass-01',
    name: 'Mass Gainer Balance',
    brand: 'MUÑEK LABS',
    category: 'Ganador',
    description:
      'Calorías limpias para subir de peso con control. Ideal en volumen.',
    tags: ['gainer', 'volumen', 'calorías'],
    image: g('#0b0b0c', '#7a0b16'),
    variants: [
      {
        id: 'v-mass-3lb',
        label: '3 lb • Vainilla',
        size: '3 lb',
        flavor: 'Vainilla',
        price: 899,
        inStock: true,
      },
      {
        id: 'v-mass-6lb',
        label: '6 lb • Chocolate',
        size: '6 lb',
        flavor: 'Chocolate',
        price: 1499,
        compareAt: 1699,
        inStock: true,
      },
    ],
  },
]

export const catalog: Product[] = normalizeCatalog(legacyCatalog)

export type CatalogLookup = {
  byVariantId: Record<string, { product: Product; variant: Variant }>
}

export const catalogLookup: CatalogLookup = {
  byVariantId: Object.fromEntries(
    catalog.map((product) => [product.variant.id, { product, variant: product.variant }]),
  ),
}
