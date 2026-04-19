import { createContext } from 'react'
import type { Product, CatalogLookup, Category } from './catalog'

export interface CatalogContextType {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  lookup: CatalogLookup
  categories: Category[]
}

export const CatalogContext = createContext<CatalogContextType | undefined>(undefined)