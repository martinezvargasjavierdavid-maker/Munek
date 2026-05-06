import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../app/useCatalog'
import {
  buildVariantLabel,
  CATEGORY_OPTIONS,
  createDefaultProductImage,
  getProductPrimaryImage,
  MAX_PRODUCT_IMAGES,
  normalizeProductImages,
  type Category,
  type Product,
  type ProductImage,
} from '../app/catalog'
import { formatMXN } from '../app/money'
import { Navbar } from '../components/Navbar'
import { useCart } from '../app/useCart'
import { saveImage, deleteImage as removeFromStorage } from '../app/imageStorage'
import { useSeo } from '../hooks/useSeo'
import {
  ADMIN_CONFIGURED,
  ADMIN_EMAIL,
  ADMIN_ENABLED,
  ADMIN_PASSWORD,
  CATALOG_CSV_URL,
} from '../app/site'
import { ProductImageView } from '../components/ProductImageView'

const ADMIN_SESSION_KEY = 'munek_admin_session'

type VariantDraft = {
  id: string
  size: string
  flavor: string
  price: string
  compareAt: string
  inStock: boolean
}

type ProductFormData = {
  name: string
  brand: string
  category: Category
  description: string
  tags: string
  groupId: string
  images: ProductImage[]
  variant: VariantDraft
}

type FormNotice = {
  tone: 'success' | 'error'
  text: string
}

function createEmptyVariantDraft(): VariantDraft {
  return {
    id: '',
    size: '',
    flavor: '',
    price: '',
    compareAt: '',
    inStock: true,
  }
}

function createEmptyFormData(groupId = ''): ProductFormData {
  return {
    name: '',
    brand: 'MUÑEK LABS',
    category: 'Creatina',
    description: '',
    tags: '',
    groupId,
    images: [createDefaultProductImage()],
    variant: createEmptyVariantDraft(),
  }
}

function productToFormData(product: Product): ProductFormData {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    tags: product.tags?.join(', ') ?? '',
    groupId: product.groupId,
    images: product.images,
    variant: {
      id: product.variant.id,
      size: product.variant.size,
      flavor: product.variant.flavor ?? '',
      price: product.variant.price > 0 ? String(product.variant.price) : '',
      compareAt: product.variant.compareAt ? String(product.variant.compareAt) : '',
      inStock: product.variant.inStock,
    },
  }
}

function sanitizeDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

function parseMoney(value: string) {
  const parsed = Number(sanitizeDigits(value))
  return Number.isFinite(parsed) ? parsed : 0
}

function isPlaceholderGradient(images: ProductImage[]) {
  return images.length === 1 && images[0].kind === 'gradient'
}

function getEditableImages(images: ProductImage[]) {
  return isPlaceholderGradient(images) ? [] : images
}

function appendProductImages(currentImages: ProductImage[], additions: ProductImage[]) {
  const nextImages = [...getEditableImages(currentImages), ...additions].slice(
    0,
    MAX_PRODUCT_IMAGES,
  )

  return nextImages.length > 0 ? normalizeProductImages(nextImages) : [createDefaultProductImage()]
}

function normalizeProductImageUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/')) return trimmed

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function moveImage(images: ProductImage[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= images.length) return images

  const nextImages = images.slice()
  const current = nextImages[index]
  nextImages[index] = nextImages[targetIndex]
  nextImages[targetIndex] = current
  return nextImages
}

function makePrimaryImage(images: ProductImage[], index: number) {
  if (index <= 0 || index >= images.length) return images

  const nextImages = images.slice()
  const [selectedImage] = nextImages.splice(index, 1)
  return selectedImage ? [selectedImage, ...nextImages] : images
}

function getErrorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function buildProductFromForm(formData: ProductFormData, editingId: string | null): Product {
  const nextTimestamp = Date.now()
  const productId = editingId || `p-${nextTimestamp}`
  const groupId = formData.groupId.trim() || `g-${nextTimestamp}`
  const size = formData.variant.size.trim()
  const flavor = formData.variant.flavor.trim()
  const price = parseMoney(formData.variant.price)
  const compareAt = parseMoney(formData.variant.compareAt)

  return {
    id: productId,
    groupId,
    name: formData.name.trim(),
    brand: formData.brand.trim() || 'MUÑEK LABS',
    category: formData.category,
    description: formData.description.trim(),
    tags: formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    images: normalizeProductImages(formData.images),
    variant: {
      id: formData.variant.id.trim() || `v-${nextTimestamp}-${Math.random().toString(36).slice(2, 5)}`,
      label: buildVariantLabel({ size, flavor }),
      size,
      flavor: flavor || undefined,
      price,
      compareAt: compareAt > price ? compareAt : undefined,
      inStock: formData.variant.inStock,
    },
  }
}

function extractLocalImageIds(images: ProductImage[]) {
  return images
    .filter((image): image is Extract<ProductImage, { kind: 'local' }> => image.kind === 'local')
    .map((image) => image.id)
}

function isLocalImageStillReferenced(
  products: Product[],
  imageId: string,
  excludedProductIds: string[] = [],
) {
  return products.some(
    (product) =>
      !excludedProductIds.includes(product.id) &&
      extractLocalImageIds(product.images).includes(imageId),
  )
}

async function optimizeAndSaveImage(file: File): Promise<ProductImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen compatible')
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo procesar la imagen'))
    image.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  let width = imageElement.width
  let height = imageElement.height
  const maxSize = 1200

  if (width <= 0 || height <= 0) {
    throw new Error('La imagen no tiene dimensiones válidas')
  }

  if (width > height && width > maxSize) {
    height *= maxSize / width
    width = maxSize
  } else if (height > maxSize) {
    width *= maxSize / height
    height = maxSize
  }

  canvas.width = Math.round(width)
  canvas.height = Math.round(height)
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('No se pudo preparar el optimizador de imágenes')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('No se pudo generar el archivo optimizado'))
      },
      'image/jpeg',
      0.82,
    )
  })

  const imageId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  await saveImage(imageId, blob)
  return { kind: 'local', id: imageId }
}

export function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useCatalog()
  const cart = useCart()

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined' || !ADMIN_CONFIGURED) return false
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(() => createEmptyFormData())
  const [optimizing, setOptimizing] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [formNotice, setFormNotice] = useState<FormNotice | null>(null)

  const editableImageCount = getEditableImages(formData.images).length
  const imageSlotsRemaining = Math.max(0, MAX_PRODUCT_IMAGES - editableImageCount)

  const relatedCount = formData.groupId
    ? products.filter(
        (product) => product.groupId === formData.groupId && product.id !== editingId,
      ).length
    : 0

  const handleLogin = (email: string, pass: string) => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true')
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    setIsLoggedIn(false)
  }

  useSeo({
    title: 'Admin | MUNEK SUPLEMENTOS',
    description: 'Panel administrativo interno de MUNEK SUPLEMENTOS.',
    path: '/admin',
    robots: 'noindex, nofollow',
  })

  if (!ADMIN_ENABLED) return <AdminUnavailable />
  if (!ADMIN_CONFIGURED) return <AdminNotConfigured />
  if (!isLoggedIn) return <AdminLogin onLogin={handleLogin} />

  const resetForm = () => {
    setEditingId(null)
    setFormData(createEmptyFormData())
    setImageUrlInput('')
    setFormNotice(null)
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData(productToFormData(product))
    setImageUrlInput('')
    setFormNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? [])
    const files = selectedFiles.filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) {
      if (selectedFiles.length > 0) {
        setFormNotice({
          tone: 'error',
          text: 'Selecciona archivos de imagen compatibles.',
        })
      }
      e.target.value = ''
      return
    }

    const currentImages = getEditableImages(formData.images)
    const availableSlots = Math.max(0, MAX_PRODUCT_IMAGES - currentImages.length)
    if (availableSlots === 0) {
      setFormNotice({
        tone: 'error',
        text: `Este producto ya tiene el máximo de ${MAX_PRODUCT_IMAGES} imágenes.`,
      })
      e.target.value = ''
      return
    }

    setOptimizing(true)
    setFormNotice(null)

    try {
      const uploadedImages = await Promise.all(
        files.slice(0, availableSlots).map((file) => optimizeAndSaveImage(file)),
      )

      setFormData((prev) => {
        return {
          ...prev,
          images: appendProductImages(prev.images, uploadedImages),
        }
      })

      setFormNotice({
        tone: 'success',
        text:
          files.length > availableSlots
            ? `Se agregaron ${uploadedImages.length} imágenes. Las demás no cabían en el carrusel.`
            : `Se agregaron ${uploadedImages.length} imágenes al carrusel.`,
      })
    } catch (error) {
      console.error('Error uploading product images:', error)
      setFormNotice({
        tone: 'error',
        text: getErrorText(error, 'No se pudieron procesar las imágenes seleccionadas.'),
      })
    } finally {
      setOptimizing(false)
      e.target.value = ''
    }
  }

  const handleAddImageUrl = () => {
    const url = normalizeProductImageUrl(imageUrlInput)

    if (!url) {
      setFormNotice({
        tone: 'error',
        text: 'Pega una URL válida que empiece con http://, https:// o /.'
      })
      return
    }

    if (imageSlotsRemaining === 0) {
      setFormNotice({
        tone: 'error',
        text: `Este producto ya tiene el máximo de ${MAX_PRODUCT_IMAGES} imágenes.`,
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: appendProductImages(prev.images, [{ kind: 'url', url }]),
    }))
    setImageUrlInput('')
    setFormNotice({ tone: 'success', text: 'La URL de imagen se agregó al carrusel.' })
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const nextImages = getEditableImages(prev.images).filter((_, imageIndex) => imageIndex !== index)

      return {
        ...prev,
        images: nextImages.length > 0 ? nextImages : [createDefaultProductImage()],
      }
    })
  }

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    setFormData((prev) => ({
      ...prev,
      images: moveImage(prev.images, index, direction),
    }))
  }

  const handleMakePrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: makePrimaryImage(prev.images, index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const previousProduct = editingId
      ? products.find((product) => product.id === editingId) ?? null
      : null
    const nextProduct = buildProductFromForm(formData, editingId)

    if (previousProduct) {
      const previousLocalIds = extractLocalImageIds(previousProduct.images)
      const nextLocalIds = new Set(extractLocalImageIds(nextProduct.images))

      await Promise.all(
        previousLocalIds
          .filter(
            (imageId) =>
              !nextLocalIds.has(imageId) &&
              !isLocalImageStillReferenced(products, imageId, [previousProduct.id]),
          )
          .map((imageId) => removeFromStorage(imageId)),
      )

      updateProduct(nextProduct)
    } else {
      addProduct(nextProduct)
    }

    resetForm()
  }

  const startRelatedVariantDraft = (copyImages: boolean) => {
    const nextGroupId = formData.groupId.trim() || editingId || `g-${Date.now()}`
    setEditingId(null)
    setFormData((prev) => ({
      ...prev,
      groupId: nextGroupId,
      images: copyImages ? prev.images.map((image) => ({ ...image })) : [createDefaultProductImage()],
      variant: createEmptyVariantDraft(),
    }))
    setImageUrlInput('')
    setFormNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-dvh bg-bg text-white pb-20">
      <Navbar
        cartCount={cart.totalItems}
        onOpenCart={() => cart.setCartOpen(true)}
        onOpenMenu={() => {}}
        onOpenSearch={() => {}}
      />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent text-[10px] font-black tracking-[0.4em] uppercase italic mb-2 block">
              Panel de Control
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Gestión de <span className="text-accent">Inventario</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
            >
              Cerrar Sesión
            </button>
            <Link
              to="/"
              className="glass px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>

        {CATALOG_CSV_URL && (
          <div className="mb-8 rounded-2xl border border-accent/20 bg-accent/10 px-6 py-5 text-sm text-white/70">
            <strong className="text-white">Catálogo externo activo.</strong> La tienda está leyendo
            productos desde Google Sheets. Los cambios hechos aquí solo sirven como prueba local;
            para modificar la tienda pública edita la hoja conectada.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="glass rounded-3xl p-8 border border-white/5 sticky top-32">
              <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">
                {editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                    placeholder="Ej: Proteína Isolatada"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as Category })
                      }
                      title="Categoría del producto"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all appearance-none text-white [&>option]:bg-zinc-900 [&>option]:text-white"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="brand"
                      className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                    >
                      Marca
                    </label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="MUÑEK LABS"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el producto"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                  >
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="creatina, fuerza, volumen"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent italic">
                        Carrusel de Esta Variante
                      </h3>
                      <p className="text-xs text-white/40 mt-2">
                        {editableImageCount}/{MAX_PRODUCT_IMAGES} imágenes propias para esta variante.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, images: [createDefaultProductImage()] })
                          setFormNotice({ tone: 'success', text: 'Se restauró el gradiente base.' })
                        }}
                        className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all"
                      >
                        Usar Gradiente
                      </button>
                      <label
                        className={`px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/20 transition-all cursor-pointer ${
                          optimizing || imageSlotsRemaining === 0 ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        {optimizing ? 'Optimizando...' : 'Subir Imágenes'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={optimizing || imageSlotsRemaining === 0}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddImageUrl()
                        }
                      }}
                      placeholder="https://ejemplo.com/producto.jpg"
                      className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all placeholder:text-white/10"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={imageSlotsRemaining === 0}
                      className="px-5 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
                    >
                      Agregar URL
                    </button>
                  </div>

                  {formNotice && (
                    <div
                      className={`rounded-2xl border px-5 py-4 text-xs font-bold ${
                        formNotice.tone === 'error'
                          ? 'border-red-500/20 bg-red-500/10 text-red-500'
                          : 'border-accent/20 bg-accent/10 text-white/70'
                      }`}
                    >
                      {formNotice.text}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: MAX_PRODUCT_IMAGES }).map((_, index) => {
                      const image = formData.images[index]
                      return (
                        <div
                          key={index}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                        >
                          {image ? (
                            <>
                              <ProductImageView
                                image={image}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                {index + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white transition-colors hover:bg-red-500"
                                aria-label={`Quitar imagen ${index + 1}`}
                              >
                                ×
                              </button>
                              {!isPlaceholderGradient(formData.images) && (
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMakePrimaryImage(index)}
                                    disabled={index === 0}
                                    className="rounded-full bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/80 transition-colors hover:bg-accent disabled:text-accent disabled:hover:bg-black/60"
                                  >
                                    Principal
                                  </button>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(index, -1)}
                                      disabled={index === 0}
                                      className="h-7 w-7 rounded-full bg-black/60 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                                      aria-label={`Mover imagen ${index + 1} a la izquierda`}
                                    >
                                      ‹
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(index, 1)}
                                      disabled={index >= formData.images.length - 1}
                                      className="h-7 w-7 rounded-full bg-black/60 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                                      aria-label={`Mover imagen ${index + 1} a la derecha`}
                                    >
                                      ›
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-center text-xs font-black uppercase tracking-widest text-white/20 px-6">
                              Espacio Libre
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent italic">
                        Variante Individual
                      </h3>
                      <p className="text-xs text-white/40 mt-2">
                        Cada variante se guarda como un producto separado con su propio carrusel.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startRelatedVariantDraft(false)}
                        className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/20 transition-all"
                      >
                        + Variante con Imágenes Nuevas
                      </button>
                      <button
                        type="button"
                        onClick={() => startRelatedVariantDraft(true)}
                        className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
                      >
                        + Variante con Mismas Imágenes
                      </button>
                    </div>
                  </div>

                  {relatedCount > 0 && (
                    <div className="rounded-2xl border border-white/5 glass px-5 py-4 text-xs text-white/50">
                      Esta familia ya tiene {relatedCount} variante{relatedCount === 1 ? '' : 's'} adicional{relatedCount === 1 ? '' : 'es'}.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="flavor"
                        className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                      >
                        Sabor
                      </label>
                      <input
                        id="flavor"
                        type="text"
                        value={formData.variant.flavor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant: { ...formData.variant, flavor: e.target.value },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                        placeholder="Chocolate"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="size"
                        className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                      >
                        Tamaño / Gramaje
                      </label>
                      <input
                        id="size"
                        type="text"
                        value={formData.variant.size}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant: { ...formData.variant, size: e.target.value },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                        placeholder="2 lb"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                      >
                        Precio (MXN)
                      </label>
                      <input
                        id="price"
                        type="text"
                        inputMode="numeric"
                        required
                        value={formData.variant.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant: {
                              ...formData.variant,
                              price: sanitizeDigits(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all text-xl font-bold"
                        placeholder="999"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="compareAt"
                        className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2"
                      >
                        Precio Anterior
                      </label>
                      <input
                        id="compareAt"
                        type="text"
                        inputMode="numeric"
                        value={formData.variant.compareAt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant: {
                              ...formData.variant,
                              compareAt: sanitizeDigits(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                        placeholder="1199"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 glass px-4 py-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.variant.inStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          variant: { ...formData.variant, inStock: e.target.checked },
                        })
                      }
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span className="text-sm font-medium text-white/80">Disponible para venta</span>
                  </label>

                  <div className="rounded-2xl border border-white/5 glass px-5 py-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                      Vista rápida
                    </div>
                    <div className="text-sm font-bold text-white">
                      {buildVariantLabel({
                        size: formData.variant.size,
                        flavor: formData.variant.flavor,
                      })}
                    </div>
                    <div className="text-sm text-accent mt-1">
                      {formatMXN(parseMoney(formData.variant.price))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/80 text-white font-black uppercase italic tracking-widest py-4 rounded-xl transition-all"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    {editingId ? 'Cancelar' : 'Limpiar'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">
              Productos en el Sistema ({products.length})
            </h2>
            <div className="grid gap-4">
              {products.map((product) => {
                const familyCount = products.filter(
                  (candidate) => candidate.groupId === product.groupId,
                ).length

                return (
                  <div
                    key={product.id}
                    className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-xl shrink-0 shadow-lg overflow-hidden relative">
                        <ProductImageView
                          image={getProductPrimaryImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">
                            {product.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {product.brand}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            Grupo: {familyCount}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg uppercase italic tracking-tight">
                          {product.name}
                        </h3>
                        <p className="text-sm text-white/40">
                          {buildVariantLabel(product.variant)} • {formatMXN(product.variant.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('¿Seguro que quieres eliminar este producto?')) {
                            await Promise.all(
                              extractLocalImageIds(product.images)
                                .filter(
                                  (imageId) =>
                                    !isLocalImageStillReferenced(products, imageId, [product.id]),
                                )
                                .map((imageId) => removeFromStorage(imageId)),
                            )
                            deleteProduct(product.id)
                            if (editingId === product.id) resetForm()
                          }
                        }}
                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function AdminUnavailable() {
  return (
    <div className="min-h-dvh bg-bg text-white flex items-center justify-center p-6">
      <div className="glass max-w-lg rounded-3xl border border-white/10 p-8 text-center">
        <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">
          Acceso Cerrado
        </p>
        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">
          Admin deshabilitado
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          El panel administrativo público quedó desactivado por seguridad. Si necesitas volver a
          usarlo, habilítalo explícitamente en variables de entorno y considera moverlo detrás de
          un backend o acceso privado.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-accent/90"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}

function AdminNotConfigured() {
  return (
    <div className="min-h-dvh bg-bg text-white flex items-center justify-center p-6">
      <div className="glass max-w-lg rounded-3xl border border-white/10 p-8 text-center">
        <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">
          Configuración Incompleta
        </p>
        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">
          Admin sin credenciales
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          Activa `VITE_ENABLE_ADMIN=true` solo si también defines `VITE_ADMIN_EMAIL` y
          `VITE_ADMIN_PASSWORD`. Aun así, recuerda que un admin en frontend no ofrece seguridad
          real de producción.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-accent/90"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}

function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    setTimeout(() => {
      const success = onLogin(email, pass)
      if (!success) {
        setError(true)
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-dvh bg-bg text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full rotate-12" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="glass w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-premium group">
            <img
              src="/splementos.png"
              alt="Muñek"
              className="w-16 h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <span className="text-accent text-[10px] font-black tracking-[0.5em] uppercase italic block mb-3">
            Acceso Restringido
          </span>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            MUNËK <span className="text-accent">ADMIN</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl"
        >
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">
              Email de Usuario
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(false)
              }}
              placeholder="admin@munek.com"
              className={`w-full bg-white/5 border ${
                error ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-4 focus:border-accent focus:outline-none transition-all placeholder:text-white/10`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => {
                setPass(e.target.value)
                setError(false)
              }}
              placeholder="••••••••••••"
              className={`w-full bg-white/5 border ${
                error ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl px-5 py-4 focus:border-accent focus:outline-none transition-all placeholder:text-white/10`}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                Credenciales Incorrectas
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-accent/40 text-white font-black uppercase italic tracking-[0.2em] py-5 rounded-xl transition-all shadow-premium hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Autenticando...</span>
              </>
            ) : (
              'Entrar al Panel'
            )}
          </button>

          <Link
            to="/"
            className="block text-center text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors pt-4"
          >
            ← Volver a la Tienda
          </Link>
        </form>
      </div>
    </div>
  )
}
