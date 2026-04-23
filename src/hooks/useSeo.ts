import { useEffect } from 'react'
import { DEFAULT_SOCIAL_IMAGE_PATH, SITE_URL } from '../app/site'

type SeoOptions = {
  title: string
  description: string
  path: string
  robots?: string
  image?: string
}

function upsertMetaByName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function upsertMetaByProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export function useSeo({ title, description, path, robots = 'index, follow', image }: SeoOptions) {
  useEffect(() => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const pageUrl = `${SITE_URL}${normalizedPath}`
    const imagePath = image || DEFAULT_SOCIAL_IMAGE_PATH
    const imageUrl = imagePath.startsWith('http') ? imagePath : `${SITE_URL}${imagePath}`

    document.title = title
    upsertMetaByName('description', description)
    upsertMetaByName('robots', robots)

    upsertMetaByProperty('og:type', 'website')
    upsertMetaByProperty('og:site_name', 'MUNEK SUPLEMENTOS')
    upsertMetaByProperty('og:url', pageUrl)
    upsertMetaByProperty('og:title', title)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:image', imageUrl)

    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:url', pageUrl)
    upsertMetaByName('twitter:title', title)
    upsertMetaByName('twitter:description', description)
    upsertMetaByName('twitter:image', imageUrl)

    upsertCanonical(pageUrl)
  }, [description, image, path, robots, title])
}
