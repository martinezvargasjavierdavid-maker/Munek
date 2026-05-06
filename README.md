# MUÑEK SUPLEMENTOS

E‑commerce de suplementos con estética tipo “galería de arte” y un efecto inspirado en gucci.com (logo grande al entrar y transición al navbar al hacer scroll).

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Features actuales

- Hero overlay con marca (fade/scale con scroll)
- Navbar sticky con búsqueda y acceso al carrito
- Grid de productos curado (cards grandes, mucho aire)
- Variantes reales (tamaños/sabores) y control de cantidad
- Carrito en drawer con persistencia en `localStorage`
- Configuración central de dominio, contacto, envíos y checkout en `src/app/site.ts`
- Envío gratis por subtotal configurable (`VITE_FREE_SHIPPING_SUBTOTAL`)

## Preparado para Produccion Basica

- SEO base en rutas principales (home, producto, legales)
- `public/robots.txt` con reglas para bloquear `/admin` y `/checkout`
- `public/sitemap.xml` con URLs publicas principales
- Fallback SPA para Netlify via `public/_redirects`
- Ruta `/admin` deshabilitada por defecto; requiere activación explícita por env

## Catálogo Editable Sin Backend

Para que el cliente modifique productos sin pagar backend, la tienda puede leer un catálogo publicado desde Google Sheets en formato CSV:

- Plantilla base: `public/catalog-template.csv`
- Guía de configuración: `docs/catalogo-google-sheets.md`
- Variable de entorno: `VITE_CATALOG_CSV_URL`

El cliente edita la hoja, sube imágenes gratis a Google Drive con acceso público, pega los links en `image1` a `image4`, y la tienda actualiza el catálogo al recargar. Google puede tardar unos minutos en refrescar el CSV publicado.

## Despliegue y Enrutamiento SPA

Esta app usa React Router con rutas como `/producto/:id`, `/logistica-pro`, `/terminos`, `/privacidad`.
Para evitar errores 404 al refrescar una ruta interna, debes configurar rewrite a `index.html` en tu hosting:

- Netlify: ya incluido con `public/_redirects`
- Vercel: agrega un rewrite global de `/(.*)` a `/index.html`
- Nginx: `try_files $uri /index.html;`
- Apache: regla de rewrite a `index.html` para rutas no existentes

## Checklist de Indexacion

- Verificar dominio final en `VITE_SITE_URL` (si aplica)
- Subir sitio y confirmar que `https://tu-dominio.com/sitemap.xml` responda 200
- Registrar propiedad en Google Search Console
- Enviar sitemap y solicitar indexacion de home + paginas legales
- Validar que `/admin` y `/checkout` aparezcan con `noindex`

## Variables de entorno

Revisa `.env.example` para las variables soportadas. Las más importantes son:

- `VITE_SITE_URL`
- `VITE_FREE_SHIPPING_SUBTOTAL`
- `VITE_SHIPPING_COST`
- `VITE_CONTACT_EMAIL`
- `VITE_CONTACT_PHONE_DISPLAY`
- `VITE_CONTACT_PHONE`
- `VITE_WHATSAPP_NUMBER`
- `VITE_MERCADO_PAGO_LINK`
- `VITE_STRIPE_LINK`
- `VITE_CATALOG_CSV_URL`

### Admin

El admin sigue siendo frontend-only. Aunque ahora está apagado por defecto, si decides activarlo con:

- `VITE_ENABLE_ADMIN=true`
- `VITE_ADMIN_EMAIL`
- `VITE_ADMIN_PASSWORD`

debes considerar que no ofrece seguridad real para producción. Lo correcto es moverlo a un backend o a un entorno privado.

## Branding

El ícono/mark actual es un placeholder SVG generado (ver `public/icon.svg` y `src/components/BrandMark.tsx`).
Puedes reemplazarlo por tu logo oficial conservando la misma paleta rojo/negro.
