import React, { useState, useEffect } from 'react'
import {
  catalog as initialCatalog,
  normalizeCatalog,
  type Product,
  type CatalogLookup,
  type Category,
} from './catalog'
import { CatalogContext } from './CatalogContext'

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return initialCatalog
    const saved = localStorage.getItem('munek_catalog')
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
    try {
      localStorage.setItem('munek_catalog', JSON.stringify(products))
    } catch {
      // ignore write failures to keep the storefront usable
    }
  }, [products])

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

  const lookup: CatalogLookup = {
    byVariantId: Object.fromEntries(
      products.map((product) => [product.variant.id, { product, variant: product.variant }]),
    ),
  }

  const categories: Category[] = [...new Set(products.map((p) => p.category))]

  return (
    <CatalogContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, lookup, categories }}>
      {children}
    </CatalogContext.Provider>
  )
}
