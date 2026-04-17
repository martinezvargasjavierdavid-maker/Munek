import React, { createContext, useContext, useState, useEffect } from 'react'
import { catalog as initialCatalog, type Product, type CatalogLookup, type Category } from './catalog'

interface CatalogContextType {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  lookup: CatalogLookup
  categories: Category[]
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('munek_catalog')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved catalog', e)
        return initialCatalog
      }
    }
    return initialCatalog
  })

  useEffect(() => {
    localStorage.setItem('munek_catalog', JSON.stringify(products))
  }, [products])

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product])
  }

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const lookup: CatalogLookup = {
    byVariantId: Object.fromEntries(
      products.flatMap((product) =>
        product.variants.map((variant) => [variant.id, { product, variant }]),
      ),
    ),
  }

  const categories: Category[] = [...new Set(products.map((p) => p.category))]

  return (
    <CatalogContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, lookup, categories }}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}
