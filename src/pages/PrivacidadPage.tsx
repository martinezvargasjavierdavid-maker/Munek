import { Link } from 'react-router-dom'
import { CONTACT_EMAIL } from '../app/site'
import { useSeo } from '../hooks/useSeo'

export function PrivacidadPage() {
  useSeo({
    title: 'Aviso de Privacidad | MUNEK SUPLEMENTOS',
    description: 'Conoce como MUNEK SUPLEMENTOS protege y usa los datos personales de sus clientes.',
    path: '/privacidad',
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
          <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">Privacidad</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-8">Aviso de Privacidad</h1>

          <div className="space-y-5 text-white/70 leading-relaxed">
            <p>Recopilamos datos de contacto y entrega únicamente para procesar tus pedidos, confirmar pagos y brindar soporte postventa.</p>
            <p>No comercializamos ni compartimos tu información personal con terceros ajenos al proceso logístico y de pago.</p>
            <p>Protegemos tus datos con medidas administrativas y técnicas razonables para evitar accesos no autorizados.</p>
            <p>Puedes solicitar corrección o eliminación de tus datos enviando un correo a {CONTACT_EMAIL}.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
