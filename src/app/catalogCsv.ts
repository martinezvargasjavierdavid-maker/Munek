import {
  MAX_PRODUCT_IMAGES,
  normalizeCatalog,
  type Product,
  type ProductImage,
  type Category,
} from './catalog'

type CsvRecord = Record<string, string>

const IMAGE_FIELDS = ['image', 'image1', 'image2', 'image3', 'image4']

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeHeader(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let insideQuotes = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    const nextChar = csv[index + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        field += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }

    field += char
  }

  row.push(field)
  rows.push(row)

  return rows.filter((candidate) => candidate.some((cell) => cell.trim().length > 0))
}

function csvToRecords(csv: string): CsvRecord[] {
  const rows = parseCsvRows(csv)
  const [headerRow, ...dataRows] = rows
  if (!headerRow) return []

  const headers = headerRow.map(normalizeHeader)

  return dataRows.map((dataRow) =>
    Object.fromEntries(
      headers.map((header, index) => [header, dataRow[index]?.trim() ?? '']),
    ),
  )
}

function first(record: CsvRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[normalizeHeader(key)]
    if (value) return value.trim()
  }

  return ''
}

function slugify(value: string, fallback: string) {
  const slug = stripDiacritics(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function parseMoney(value: string) {
  const cleaned = value.trim().replace(/[^\d.,-]/g, '')
  if (!cleaned) return 0

  const normalized =
    cleaned.includes(',') && cleaned.includes('.')
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function parseBoolean(value: string, fallback = true) {
  const normalized = stripDiacritics(value).toLowerCase().trim()
  if (!normalized) return fallback

  if (['1', 'true', 'si', 'yes', 'disponible', 'stock', 'enstock'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'agotado', 'sinstock', 'no disponible'].includes(normalized)) {
    return false
  }

  return fallback
}

function normalizeDriveImageUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('/')) return trimmed

  try {
    const url = new URL(trimmed)
    const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/)
    const id = filePathMatch?.[1] ?? url.searchParams.get('id')

    if (url.hostname.includes('drive.google.com') && id) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`
    }

    return url.toString()
  } catch {
    return ''
  }
}

function imagesFromRecord(record: CsvRecord): ProductImage[] {
  const images = IMAGE_FIELDS.flatMap((fieldName) => {
    const value = first(record, [fieldName, fieldName.replace('image', 'imagen')])
    const url = normalizeDriveImageUrl(value)
    return url ? [{ kind: 'url' as const, url }] : []
  })

  return images.slice(0, MAX_PRODUCT_IMAGES)
}

function tagsFromRecord(record: CsvRecord) {
  const tags = first(record, ['tags', 'etiquetas'])
  if (!tags) return undefined

  const values = tags
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)

  return values.length > 0 ? values : undefined
}

function recordToProduct(record: CsvRecord, index: number): Product {
  const name = first(record, ['name', 'nombre', 'producto']) || `Producto ${index + 1}`
  const brand = first(record, ['brand', 'marca']) || 'MUÑEK LABS'
  const category = first(record, ['category', 'categoria']) as Category
  const size = first(record, ['size', 'tamano', 'tamaño', 'gramaje', 'presentacion'])
  const flavor = first(record, ['flavor', 'sabor'])
  const rawVariantId = first(record, ['variantid', 'variantId', 'idvariante'])
  const rawGroupId = first(record, ['groupid', 'groupId', 'grupo', 'familia'])
  const variantId = rawVariantId || `v-${index + 1}-${slugify(`${name}-${size}-${flavor}`, 'variant')}`
  const groupId = rawGroupId || `g-${slugify(name, `product-${index + 1}`)}`
  const id = first(record, ['id', 'productid', 'productId', 'idproducto']) || `${groupId}__${variantId}`
  const price = parseMoney(first(record, ['price', 'precio']))
  const compareAt = parseMoney(
    first(record, ['compareat', 'compareAt', 'precioanterior', 'precioantes']),
  )

  return {
    id,
    groupId,
    name,
    brand,
    category,
    description: first(record, ['description', 'descripcion', 'descripción']),
    tags: tagsFromRecord(record),
    images: imagesFromRecord(record),
    variant: {
      id: variantId,
      label: first(record, ['label', 'etiqueta', 'presentacioncompleta']),
      size,
      flavor,
      price,
      compareAt,
      inStock: parseBoolean(first(record, ['instock', 'inStock', 'disponible', 'stock'])),
    },
  }
}

export function parseCatalogCsv(csv: string) {
  const products = csvToRecords(csv).map(recordToProduct)
  return normalizeCatalog(products)
}
