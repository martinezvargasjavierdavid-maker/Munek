import React, { useState, useEffect, useMemo } from 'react'
import {
  catalog as initialCatalog,
  normalizeCatalog,
  type Product,
  type CatalogLookup,
  type Category,
} from './catalog'
import { parseCatalogCsv } from './catalogCsv'
import { CatalogContext } from './CatalogContext'
import { CATALOG_CSV_URL } from './site'

const LOCAL_CATALOG_KEY = 'munek_catalog'
const REMOTE_CATALOG_CACHE_KEY = 'munek_catalog_remote_cache'

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return initialCatalog

    if (CATALOG_CSV_URL) {
      const cachedRemote = localStorage.getItem(REMOTE_CATALOG_CACHE_KEY)
      if (cachedRemote) {
        try {
          const normalized = normalizeCatalog(JSON.parse(cachedRemote))
          return normalized.length > 0 ? normalized : initialCatalog
        } catch {
          return initialCatalog
        }
      }

      return initialCatalog
    }

    const saved = localStorage.getItem(LOCAL_CATALOG_KEY)
    if (saved) {
      try {
        return normalizeCatalog(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved catalog', e)
        return initialCatalog
      }
    }
    return initialCatalog
  })

  useEffect(() => {
    if (CATALOG_CSV_URL) return

    try {
      localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(products))
    } catch {
      // ignore write failures to keep the storefront usable
    }
  }, [products])

  useEffect(() => {
    if (!CATALOG_CSV_URL) return

    let cancelled = false

    async function loadRemoteCatalog() {
      try {
        const response = await fetch(CATALOG_CSV_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Catalog CSV request failed: ${response.status}`)

        const csv = await response.text()
        const remoteProducts = parseCatalogCsv(csv)
        if (remoteProducts.length === 0) {
          throw new Error('Catalog CSV did not contain valid products')
        }

        if (!cancelled) {
          setProducts(remoteProducts)
        }

        try {
          localStorage.setItem(REMOTE_CATALOG_CACHE_KEY, JSON.stringify(remoteProducts))
        } catch {
          // cache is optional
        }
      } catch (error) {
        console.error('Failed to load remote catalog CSV', error)
      }
    }

    loadRemoteCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  const addProduct = (product: Product) => {
    setProducts((prev) => normalizeCatalog([...prev, product]))
  }

  const updateProduct = (product: Product) => {
    setProducts((prev) =>
      normalizeCatalog(prev.map((p) => (p.id === product.id ? product : p))),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const lookup: CatalogLookup = useMemo(
    () => ({
      byVariantId: Object.fromEntries(
        products.map((product) => [product.variant.id, { product, variant: product.variant }]),
      ),
    }),
    [products],
  )

  const categories: Category[] = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  )

  return (
    <CatalogContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, lookup, categories }}>
      {children}
    </CatalogContext.Provider>
  )
}
