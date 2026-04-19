import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CartDrawer } from '../components/CartDrawer'
import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { CategoryMenu } from '../components/CategoryMenu'
import { SearchModal } from '../components/SearchModal'
import { ProductCarousel } from '../components/ProductCarousel'
import { useCart } from '../app/useCart'
import { useCatalog } from '../app/useCatalog'
import { type Category } from '../app/catalog'

const CATEGORIES: Category[] = [
  'Proteína',
  'Creatina',
  'Pre-entreno',
  'Aminoácidos',
  'Ganador',
  'Vitaminas',
  'Minerales',
  'Extras',
  'Hybrid Club',
]

const BANNER_IMAGES = [
  '/belcast.jpg',
  '/cbum.jpg',
  '/ramon.jpg'
]

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const cart = useCart()
  const { products } = useCatalog()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const activeCategory = (() => {
    const category = searchParams.get('category') as Category | null
    return category && CATEGORIES.includes(category) ? category : null
  })()

  const updateCategory = (category: Category | null) => {
    setSearchParams(category ? { category } : {})
  }

  const filtered = useMemo(() => {
    if (!activeCategory) return products
    return products.filter((p) => p.category === activeCategory)
  }, [activeCategory, products])

  return (
    <div className="min-h-dvh">
      <Navbar
        cartCount={cart.totalItems}
        onOpenCart={() => cart.setCartOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <CategoryMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={CATEGORIES}
        active={activeCategory}
        onSelect={(cat: Category | null) => {
          updateCategory(cat)
          setMenuOpen(false)
        }}
      />

      {/* Hero Section - Immersive & Premium */}
      <section className="relative h-dvh min-h-175 bg-bg text-white overflow-hidden flex flex-col">
        {/* Carousel Background */}
        <div className="absolute inset-0 z-0">
          {BANNER_IMAGES.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-[2000ms] ease-out ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden="true"
              draggable={false}
            />
          ))}
        </div>

        {/* Dynamic Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-bg/40 via-transparent to-bg z-10" />
        <div className="absolute inset-0 bg-linear-to-r from-accent/10 to-transparent mix-blend-overlay z-15" />

        <div className="relative z-20 grow flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[10px] tracking-[0.3em] font-black text-white/80 mb-10 animate-fade-in translate-y-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
              ELITE PERFORMANCE
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic">
              ELEVA TUS <br />
              <span className="text-accent underline decoration-white/10 decoration-8 underline-offset-8">LÍMITES</span>
            </h1>
            
            <p className="mt-8 text-white/50 text-lg md:text-xl max-w-xl mx-auto font-medium">
              Suplementos premium para atletas que no se conforman con lo ordinario.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <button
                type="button"
                onClick={() => {
                  updateCategory(null)
                  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group relative bg-white text-black font-black uppercase italic tracking-widest px-10 py-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-premium overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors">
                  Explorar Catálogo
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="font-black uppercase italic tracking-widest px-10 py-5 rounded-xl glass hover:bg-white/10 transition-all border-white/20"
              >
                Categorías
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Refined */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <div className="w-px h-20 bg-linear-to-b from-white/20 via-white/40 to-transparent" />
        </div>
      </section>

      {/* Features strip - elegant & minimal */}
      <section className="bg-bg border-b border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Pago seguro</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Envío 24-72h</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">100% Original</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 12.728l3.536-3.536m-7.072 0a12 12 0 1116.97 0 12 12 0 01-16.97 0z" />
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Soporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Message - Compact Red Full Text */}
      <section className="relative py-12 px-6 bg-accent/90 border-y border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/splementos.png')] bg-center opacity-5 scale-150 rotate-12" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="relative p-10 glass rounded-3xl text-center shadow-premium">
            <p className="text-xl md:text-3xl font-black text-white leading-[1.1] tracking-tighter uppercase italic max-w-3xl mx-auto">
              “Colabora con nosotros, una empresa comprometida con la salud y el rendimiento. Juntos podemos crecer mediante alianzas estratégicas.”
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main id="productos" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeCategory ?? 'Todos los productos'}
            </h2>
            <p className="mt-2 text-muted">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          {activeCategory && (
            <button
              type="button"
              onClick={() => updateCategory(null)}
              className="text-sm text-accent hover:underline"
            >
              ← Ver todos los productos
            </button>
          )}
        </div>

        {activeCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(variantId, qty) => cart.add(variantId, qty)}
              />
            ))}
          </div>
        ) : (
          <ProductCarousel
            title="Catálogo Completo"
            products={products}
            onAdd={(variantId, qty) => cart.add(variantId, qty)}
          />
        )}
      </main>

      {/* Sobre Nosotros Section - Elite Aesthetic */}
      <section id="sobre-nosotros" className="py-24 bg-bg overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Logo Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative group">
                <div className="aspect-square rounded-premium overflow-hidden glass p-8 flex items-center justify-center shadow-premium relative z-10">
                  <img
                    src="/splementos.png"
                    alt="Logo Muñek"
                    className="w-[85%] h-[85%] object-contain transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
                  />
                  <div className="absolute bottom-8 left-8 right-8 text-left">
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase mb-1 text-accent">EST. 2024</p>
                    <h3 className="text-2xl font-black leading-none text-white italic uppercase tracking-tighter">Pasión de Élite.</h3>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-accent/10 rounded-full blur-[80px] -z-10 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Text Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass text-accent text-[10px] font-black tracking-[0.3em] uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                NUESTRO ADN
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8 italic leading-[0.9]">
                MÁS QUE UNA TIENDA, <br/>
                <span className="text-accent underline decoration-white/5 underline-offset-4">TU ALIADO</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed mb-10 font-medium">
                En MUÑEK SUPLEMENTOS no solo vendemos productos; impulsamos tu transformación. 
                Seleccionamos la élite de la suplementación para que tu único foco sea romper tus récords.
              </p>
              <div className="grid grid-cols-2 gap-10">
                <div className="border-l-2 border-accent/20 pl-6">
                  <h4 className="font-black text-white mb-2 uppercase text-sm italic tracking-widest">Calidad Superior</h4>
                  <p className="text-sm text-white/40 leading-snug">Marcas certificadas con trazabilidad total.</p>
                </div>
                <div className="border-l-2 border-accent/20 pl-6">
                  <h4 className="font-black text-white mb-2 uppercase text-sm italic tracking-widest">Asesoría Élite</h4>
                  <p className="text-sm text-white/40 leading-snug">Basada en ciencia y resultados reales.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 bg-bg text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">
              VISÍTANOS EN <span className="text-accent">NUESTRAS SUCURSALES</span>
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Sucursal 1 */}
            <div className="p-8 border border-white/10 rounded-2xl hover:border-accent/50 transition-colors bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Sucursal Zacatelco
              </h3>
              <a 
                href="https://maps.app.goo.gl/jmx1tBYo2UqwXGpW9?g_st=iw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 text-sm mb-6 uppercase tracking-wider hover:text-accent transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver Ubicación
              </a>
              <div className="space-y-4">
                <h4 className="text-xs font-black text-accent uppercase tracking-[0.2em]">Horarios de Atención</h4>
                <ul className="text-sm space-y-2 text-white/80">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Lunes a Viernes</span>
                    <span className="font-bold">11:00 am - 8:00 pm</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Sábados</span>
                    <span className="font-bold">12:00 pm - 8:00 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Domingos</span>
                    <span className="font-bold">1:00 pm - 8:00 pm</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sucursal 2 */}
            <div className="p-8 border border-white/10 rounded-2xl hover:border-accent/50 transition-colors bg-white/5 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Sucursal Tlaxcala centro
              </h3>
              <a 
                href="https://maps.app.goo.gl/8FLdELCpH1KAPrcN7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 text-sm mb-6 uppercase tracking-wider hover:text-accent transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ver Ubicación
              </a>
              <div className="space-y-4">
                <h4 className="text-xs font-black text-accent uppercase tracking-[0.2em]">Horarios de Atención</h4>
                <ul className="text-sm space-y-2 text-white/80">
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Lunes a Viernes</span>
                    <span className="font-bold">11:00 am - 8:00 pm</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Sábados</span>
                    <span className="font-bold">12:00 pm - 8:00 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Domingos</span>
                    <span className="font-bold">1:00 pm - 8:00 pm</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center text-center md:text-left">
              <h3 className="text-2xl font-bold mb-6 italic uppercase">¿Dudas o pedidos?</h3>
              <p className="text-white/60 mb-8 max-w-sm">
                Estamos listos para asesorarte y llevar tu entrenamiento al siguiente nivel.
                Envíanos un mensaje o llámanos directamente.
              </p>
              <div className="space-y-6">
                <a
                  href="tel:2462094321"
                  className="flex items-center gap-4 group hover:text-accent transition-colors justify-center md:justify-start"
                >
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/40 uppercase font-black">Llámanos</span>
                    <span className="text-xl font-bold">246 209 4321</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Elite Finish */}
      <footer className="bg-bg border-t border-hairline text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="space-y-8">
              <div className="glass p-6 rounded-2xl inline-block shadow-premium group">
                <img
                  src="/splementos.png"
                  alt="Muñek Suplementos"
                  className="h-14 w-auto grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-60 font-medium italic">
                Elevando tu potencial humano a través de la suplementación de élite. Est. 2024.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black mb-8 tracking-[0.3em] text-accent uppercase italic">Categorías</h4>
              <ul className="space-y-4 text-sm text-white/50 font-bold uppercase italic tracking-tight">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => {
                        updateCategory(cat)
                        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="hover:text-white transition-colors hover:translate-x-1 inline-block"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black mb-8 tracking-[0.3em] text-accent uppercase italic">Elite Club</h4>
              <ul className="space-y-4 text-sm text-white/50 font-bold uppercase italic tracking-tight">
                <li><a href="#sobre-nosotros" className="hover:text-white transition-colors">ADN Muñek</a></li>
                <li><a href="#envios" className="hover:text-white transition-colors">Logística Pro</a></li>
                <li><a href="#terminos" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#privacidad" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black mb-8 tracking-[0.3em] text-accent uppercase italic">Contacto Directo</h4>
              <ul className="space-y-4 text-sm text-white/50 font-bold italic">
                <li>
                  <a href="mailto:elite@muneksuplementos.com" className="hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1 h-px bg-accent/30" />
                    elite@muneksuplementos.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                   <span className="w-1 h-px bg-accent/30" />
                   Zacatelco, Tlaxcala - HQ
                </li>
              </ul>
              <div className="flex gap-4 mt-10">
                {[
                  { icon: 'Facebook', url: '#' },
                  { icon: 'Instagram', url: '#' },
                  { icon: 'TikTok', url: '#' }
                ].map((social) => (
                  <a
                    key={social.icon}
                    href={social.url}
                    className="w-10 h-10 rounded-xl glass flex items-center justify-center transition-all hover:bg-accent hover:-translate-y-1 hover:shadow-[0_0_20px_var(--color-accent)]"
                    aria-label={social.icon}
                  >
                    <div className="w-4 h-4 bg-white/40 rounded-sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
            <p>© {new Date().getFullYear()} MUÑEK SUPLEMENTOS. ÉLITE PERFORMANCE.</p>
            <div className="flex gap-8">
              <span>DESIGNED BY AI ÉLITE</span>
              <span className="text-accent">|</span>
              <span>MEXICO HQ</span>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={cart.cartOpen}
        onClose={() => cart.setCartOpen(false)}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(productId) => {
          updateCategory(null)
          setTimeout(() => {
            const el = document.getElementById(`product-${productId}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el?.classList.add('ring-2', 'ring-accent')
            setTimeout(() => el?.classList.remove('ring-2', 'ring-accent'), 2000)
          }, 100)
        }}
      />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/522462094321"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
