import { Link } from 'react-router-dom'

export function LogisticaPage() {
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
          <p className="text-xs font-black tracking-[0.3em] uppercase text-accent mb-4">Logística Pro</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-8">Envíos y Entregas</h1>

          <p className="text-white/70 leading-relaxed mb-8">
            Procesamos pedidos de lunes a sábado. Una vez confirmado tu pago, el pedido se prepara entre 12 y 24 horas hábiles y se envía con paquetería nacional con cobertura en todo México.
          </p>

          <ul className="space-y-4 text-white/70 leading-relaxed">
            <li>Tiempo estimado de entrega: 24 a 72 horas hábiles en zonas urbanas.</li>
            <li>Envío estándar: $150 MXN.</li>
            <li>Envío gratis automático a partir de 4 artículos en carrito.</li>
            <li>Te compartimos guía de rastreo por WhatsApp o correo al despachar.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
