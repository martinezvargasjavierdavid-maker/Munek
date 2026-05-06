import { Link, useLocation } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

export function NotFoundPage() {
  const location = useLocation()

  useSeo({
    title: 'Página no encontrada | MUNEK SUPLEMENTOS',
    description: 'La ruta solicitada no existe en MUNEK SUPLEMENTOS.',
    path: location.pathname,
    robots: 'noindex, nofollow',
  })

  return (
    <main className="min-h-dvh bg-bg text-white px-6 py-16 flex items-center justify-center">
      <div className="glass max-w-xl rounded-3xl border border-white/10 p-10 text-center">
        <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">404</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight mb-6">
          Página no encontrada
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          La dirección que intentaste abrir no existe o ya no está disponible.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-accent/90"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
