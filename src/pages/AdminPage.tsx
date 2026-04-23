import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../app/useCatalog'
import { CATEGORY_OPTIONS, type Category, type Product } from '../app/catalog'
import { formatMXN } from '../app/money'
import { Navbar } from '../components/Navbar'
import { useCart } from '../app/useCart'
import { GradientVisual } from '../components/GradientVisual'
import { LocalImage } from '../components/LocalImage'
import { saveImage, deleteImage as removeFromStorage } from '../app/imageStorage'
import { useSeo } from '../hooks/useSeo'
import { ADMIN_CONFIGURED, ADMIN_EMAIL, ADMIN_ENABLED, ADMIN_PASSWORD } from '../app/site'

const ADMIN_SESSION_KEY = 'munek_admin_session'

export function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useCatalog()
  const cart = useCart()

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined' || !ADMIN_CONFIGURED) return false
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  })

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

  // --- Admin Logic State (Must be top-level for Hooks consistency) ---
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: 'MUÑEK LABS',
    category: 'Creatina',
    description: '',
    variants: [{ id: '', label: '', size: '', flavor: '', price: 0, inStock: true }]
  })
  const [optimizing, setOptimizing] = useState(false)

  useSeo({
    title: 'Admin | MUNEK SUPLEMENTOS',
    description: 'Panel administrativo interno de MUNEK SUPLEMENTOS.',
    path: '/admin',
    robots: 'noindex, nofollow',
  })

  if (!ADMIN_ENABLED) return <AdminUnavailable />
  if (!ADMIN_CONFIGURED) return <AdminNotConfigured />
  if (!isLoggedIn) return <AdminLogin onLogin={handleLogin} />

  // -----------------------------
  
  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      brand: 'MUÑEK LABS',
      category: 'Creatina',
      description: '',
      variants: [{ id: '', label: '', size: '', flavor: '', price: 0, inStock: true }]
    })
  }

  const handleEdit = (p: Product) => {
    setEditingId(p.id)
    setFormData(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentGradient = formData.image?.kind === 'gradient' ? formData.image : null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOptimizing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const max = 1200 // Increased quality slightly since we are in IDB

        if (width > height) {
          if (width > max) {
            height *= max / width
            width = max
          }
        } else {
          if (height > max) {
            width *= max / height
            height = max
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to Blob for IndexedDB instead of Base64 URL
        canvas.toBlob(async (blob) => {
          if (blob) {
            const imageId = `local-${Date.now()}`
            await saveImage(imageId, blob)
            setFormData({ ...formData, image: { kind: 'local', id: imageId } })
          }
          setOptimizing(false)
        }, 'image/jpeg', 0.8)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      id: editingId || `p-${Date.now()}`,
      image: formData.image || { kind: 'gradient' as const, a: '#d10b1c', b: '#0b0b0c' },
      variants: formData.variants?.map(v => ({
        ...v,
        id: v.id || `v-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
      }))
    } as Product

    if (editingId) {
      updateProduct(productData)
    } else {
      addProduct(productData)
    }
    resetForm()
  }

  return (
    <div className="min-h-dvh bg-bg text-white pb-20">
      <Navbar
        cartCount={cart.totalItems}
        onOpenCart={() => cart.setCartOpen(true)}
        onOpenMenu={() => {}}
        onOpenSearch={() => {}}
      />

      <main className="max-w-6xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-accent text-[10px] font-black tracking-[0.4em] uppercase italic mb-2 block">Panel de Control</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Gestión de <span className="text-accent">Inventario</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
            >
              Cerrar Sesión
            </button>
            <Link to="/" className="glass px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Volver a la Tienda
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-5">
            <div className="glass rounded-3xl p-8 border border-white/5 sticky top-32">
              <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">
                {editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                    placeholder="Ej: Proteína Isolatada"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Categoría</label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
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
                    <label htmlFor="brand" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Marca</label>
                    <input
                      id="brand"
                      type="text"
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="MUÑEK LABS"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30">Visual del Producto</label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: { kind: 'gradient', a: '#d10b1c', b: '#0b0b0c' } })}
                      className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.image?.kind === 'gradient' ? 'border-accent bg-accent/10 text-white' : 'border-white/5 glass text-white/40'
                      }`}
                    >
                      Usar Gradiente
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.image?.kind === 'local' ? 'border-accent bg-accent/10 text-white' : 'border-white/5 glass text-white/40'
                      }`}
                    >
                      {optimizing ? 'Optimizando...' : 'Subir Imagen'}
                    </button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      title="Subir imagen del producto"
                      className="hidden"
                    />
                  </div>

                  {(formData.image?.kind === 'url' || formData.image?.kind === 'local') && (
                    <div className="relative aspect-square rounded-2xl overflow-hidden glass border border-white/10 group">
                      {formData.image.kind === 'url' ? (
                        <img src={formData.image.url} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <LocalImage id={formData.image.id} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Imagen Preparada</span>
                      </div>
                    </div>
                  )}

                  {formData.image?.kind === 'gradient' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="color-a" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Color A</label>
                        <input
                          id="color-a"
                          type="color"
                          value={currentGradient?.a ?? '#d10b1c'}
                          onChange={e => setFormData({ ...formData, image: { kind: 'gradient', a: e.target.value, b: currentGradient?.b ?? '#0b0b0c' } })}
                          className="w-full h-10 bg-transparent border-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label htmlFor="color-b" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Color B</label>
                        <input
                          id="color-b"
                          type="color"
                          value={currentGradient?.b ?? '#0b0b0c'}
                          onChange={e => setFormData({ ...formData, image: { kind: 'gradient', a: currentGradient?.a ?? '#d10b1c', b: e.target.value } })}
                          className="w-full h-10 bg-transparent border-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Descripción</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el producto"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="border-t border-white/5 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent italic">Variantes y Sabores</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const vs = [...(formData.variants || [])];
                        vs.push({ id: '', label: '', size: '', flavor: '', price: 0, inStock: true });
                        setFormData({ ...formData, variants: vs });
                      }}
                      className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/20 transition-all"
                    >
                      + Agregar Variante
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.variants?.map((variant, index) => (
                      <div key={index} className="glass p-6 rounded-2xl border border-white/5 space-y-4 relative">
                        {formData.variants!.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const vs = formData.variants!.filter((_, i) => i !== index);
                              setFormData({ ...formData, variants: vs });
                            }}
                            className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                            title="Eliminar variante"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`flavor-${index}`} className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Sabor</label>
                            <input
                              id={`flavor-${index}`}
                              type="text"
                              value={variant.flavor}
                              onChange={e => {
                                const vs = [...(formData.variants || [])];
                                vs[index].flavor = e.target.value;
                                vs[index].label = `${vs[index].size || ''} ${e.target.value}`.trim();
                                setFormData({ ...formData, variants: vs });
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                              placeholder="Chocolate"
                            />
                          </div>
                          <div>
                            <label htmlFor={`size-${index}`} className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Tamaño</label>
                            <input
                              id={`size-${index}`}
                              type="text"
                              value={variant.size}
                              onChange={e => {
                                const vs = [...(formData.variants || [])];
                                vs[index].size = e.target.value;
                                vs[index].label = `${e.target.value} ${vs[index].flavor || ''}`.trim();
                                setFormData({ ...formData, variants: vs });
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all"
                              placeholder="2 lb"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`price-${index}`} className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Precio (MXN)</label>
                          <input
                            id={`price-${index}`}
                            type="number"
                            required
                            value={variant.price === 0 ? '' : variant.price}
                            onChange={e => {
                              const val = e.target.value;
                              const vs = [...(formData.variants || [])];
                              vs[index].price = val === '' ? 0 : Number(val);
                              setFormData({ ...formData, variants: vs });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent focus:outline-none transition-all text-xl font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/80 text-white font-black uppercase italic tracking-widest py-4 rounded-xl transition-all"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Producto'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight mb-8">Productos en el Sistema ({products.length})</h2>
            <div className="grid gap-4">
              {products.map(p => (
                <div key={p.id} className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl shrink-0 shadow-lg overflow-hidden relative">
                      {p.image.kind === 'url' && <img src={p.image.url} className="w-full h-full object-cover" alt={p.name} />}
                      {p.image.kind === 'local' && <LocalImage id={p.image.id} className="w-full h-full object-cover" alt={p.name} />}
                      {p.image.kind === 'gradient' && <GradientVisual a={p.image.a} b={p.image.b} className="absolute inset-0 h-full w-full" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">{p.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{p.brand}</span>
                      </div>
                      <h3 className="font-bold text-lg uppercase italic tracking-tight">{p.name}</h3>
                      <p className="text-sm text-white/40">
                        {p.variants.length} variante(s) • Desde {formatMXN(Math.min(...p.variants.map(v => v.price)))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Seguro que quieres eliminar este producto?')) {
                          if (p.image.kind === 'local') {
                            await removeFromStorage(p.image.id)
                          }
                          deleteProduct(p.id)
                        }
                      }}
                      className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
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
        <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">Acceso Cerrado</p>
        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">Admin deshabilitado</h1>
        <p className="text-white/70 leading-relaxed mb-8">
          El panel administrativo público quedó desactivado por seguridad. Si necesitas volver a usarlo, habilítalo explícitamente en variables de entorno y considera moverlo detrás de un backend o acceso privado.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-accent/90">
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
        <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">Configuración Incompleta</p>
        <h1 className="text-3xl font-black uppercase italic tracking-tight mb-4">Admin sin credenciales</h1>
        <p className="text-white/70 leading-relaxed mb-8">
          Activa `VITE_ENABLE_ADMIN=true` solo si también defines `VITE_ADMIN_EMAIL` y `VITE_ADMIN_PASSWORD`. Aun así, recuerda que un admin en frontend no ofrece seguridad real de producción.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-accent/90">
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}

function AdminLogin({ onLogin }: { onLogin: (e: string, p: string) => boolean }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    // Simulate a tiny delay for "premium" feel
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
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full rotate-12" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="glass w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-premium group">
            <img src="/splementos.png" alt="Muñek" className="w-16 h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
          </div>
          <span className="text-accent text-[10px] font-black tracking-[0.5em] uppercase italic block mb-3">Acceso Restringido</span>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">MUNËK <span className="text-accent">ADMIN</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Email de Usuario</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              placeholder="admin@munek.com"
              className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-5 py-4 focus:border-accent focus:outline-none transition-all placeholder:text-white/10`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              placeholder="••••••••••••"
              className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-5 py-4 focus:border-accent focus:outline-none transition-all placeholder:text-white/10`}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Credenciales Incorrectas</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-accent/40 text-white font-black uppercase italic tracking-[0.2em] py-5 rounded-xl transition-all shadow-premium hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Autenticando...</span>
              </>
            ) : (
              'Entrar al Panel'
            )}
          </button>

          <Link to="/" className="block text-center text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors pt-4">
            ← Volver a la Tienda
          </Link>
        </form>
      </div>
    </div>
  )
}
