import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

export function TerminosPage() {
  useSeo({
    title: 'Terminos y Condiciones | MUNEK SUPLEMENTOS',
    description: 'Revisa los terminos y condiciones de compra de MUNEK SUPLEMENTOS.',
    path: '/terminos',
  })

  return (
    <main className="min-h-dvh bg-bg text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
        >
          ← Volver al inicio
        </Link>

        <section className="glass rounded-3xl border border-white/10 p-8 md:p-12">
          <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">Términos</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-8">Términos y Condiciones</h1>

          <div className="space-y-5 text-white/70 leading-relaxed">
            <p>Al realizar una compra en MUÑEK SUPLEMENTOS aceptas nuestros términos comerciales y operativos.</p>
            <p>Los productos publicados están sujetos a disponibilidad de inventario. En caso de falta de stock, te contactaremos para reembolso o sustitución.</p>
            <p>Los precios se muestran en MXN e incluyen IVA cuando aplique. MUÑEK SUPLEMENTOS puede actualizar precios sin previo aviso.</p>
            <p>Por seguridad e higiene, no se aceptan devoluciones de productos abiertos o manipulados. Si tu pedido llega dañado, repórtalo dentro de las primeras 24 horas con evidencia fotográfica.</p>
            <p>Este sitio ofrece contenido informativo y no sustituye asesoría médica profesional. Consulta a un especialista antes de iniciar cualquier suplementación.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
