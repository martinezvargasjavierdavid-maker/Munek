export const SITE_NAME = 'MUNEK SUPLEMENTOS'
export const DEFAULT_SOCIAL_IMAGE_PATH = '/splementos.png'

const DEFAULT_SITE_URL = 'https://muneksuplementos.com'
const DEFAULT_CONTACT_EMAIL = 'elite@muneksuplementos.com'
const DEFAULT_CONTACT_PHONE_DISPLAY = '246 209 4321'
const DEFAULT_CONTACT_PHONE = '2462094321'
const DEFAULT_WHATSAPP_NUMBER = '522462094321'
const DEFAULT_FREE_SHIPPING_SUBTOTAL = 999
const DEFAULT_SHIPPING_COST = 150

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizeUrl(value: string | undefined) {
  return value?.trim() ?? ''
}

function normalizeDigits(value: string | undefined, fallback: string) {
  const digits = (value?.trim() || fallback).replace(/\D+/g, '')
  return digits || fallback
}

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export const SITE_URL = trimTrailingSlash(
  normalizeUrl(import.meta.env.VITE_SITE_URL as string | undefined) || DEFAULT_SITE_URL,
)

export const CONTACT_EMAIL =
  normalizeUrl(import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || DEFAULT_CONTACT_EMAIL

export const CONTACT_PHONE_DISPLAY =
  normalizeUrl(import.meta.env.VITE_CONTACT_PHONE_DISPLAY as string | undefined) ||
  DEFAULT_CONTACT_PHONE_DISPLAY

export const CONTACT_PHONE_TEL = normalizeDigits(
  import.meta.env.VITE_CONTACT_PHONE as string | undefined,
  DEFAULT_CONTACT_PHONE,
)

export const WHATSAPP_NUMBER = normalizeDigits(
  import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined,
  DEFAULT_WHATSAPP_NUMBER,
)

export const FREE_SHIPPING_SUBTOTAL = readNumber(
  import.meta.env.VITE_FREE_SHIPPING_SUBTOTAL as string | undefined,
  DEFAULT_FREE_SHIPPING_SUBTOTAL,
)

export const SHIPPING_COST = readNumber(
  import.meta.env.VITE_SHIPPING_COST as string | undefined,
  DEFAULT_SHIPPING_COST,
)

export const MERCADO_PAGO_LINK = normalizeUrl(
  import.meta.env.VITE_MERCADO_PAGO_LINK as string | undefined,
)

export const STRIPE_LINK = normalizeUrl(
  import.meta.env.VITE_STRIPE_LINK as string | undefined,
)

export const CATALOG_CSV_URL = normalizeUrl(
  import.meta.env.VITE_CATALOG_CSV_URL as string | undefined,
)

export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    url: normalizeUrl(import.meta.env.VITE_FACEBOOK_URL as string | undefined),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: normalizeUrl(import.meta.env.VITE_INSTAGRAM_URL as string | undefined),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    url: normalizeUrl(import.meta.env.VITE_TIKTOK_URL as string | undefined),
  },
].filter((social) => social.url.length > 0)

export const ADMIN_ENABLED =
  normalizeUrl(import.meta.env.VITE_ENABLE_ADMIN as string | undefined).toLowerCase() === 'true'

export const ADMIN_EMAIL = normalizeUrl(
  import.meta.env.VITE_ADMIN_EMAIL as string | undefined,
)

export const ADMIN_PASSWORD = normalizeUrl(
  import.meta.env.VITE_ADMIN_PASSWORD as string | undefined,
)

export const ADMIN_CONFIGURED =
  ADMIN_ENABLED && ADMIN_EMAIL.length > 0 && ADMIN_PASSWORD.length > 0
