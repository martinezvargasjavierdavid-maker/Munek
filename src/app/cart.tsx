import React, { useEffect, useMemo, useState } from 'react'
import { CartContext, type CartState } from './CartContext'
import { useCatalog } from './useCatalog'

export type CartLine = {
  variantId: string
  qty: number
}

const STORAGE_KEY = 'munek.cart.v1'

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { lookup } = useCatalog()
  const [cartOpen, setCartOpen] = useState(false)
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as CartLine[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // ignore
    }
  }, [lines])

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  )

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const hit = lookup.byVariantId[l.variantId]
      if (!hit) return sum
      return sum + hit.variant.price * l.qty
    }, 0)
  }, [lines, lookup])

  const api: CartState = useMemo(
    () => ({
      cartOpen,
      setCartOpen,
      lines,
      totalItems,
      subtotal,
      add: (variantId, qty = 1) => {
        const hit = lookup.byVariantId[variantId]
        if (!hit || !hit.variant.inStock) return
        const addQty = clampInt(qty, 1, 99)
        setLines((prev) => {
          const i = prev.findIndex((l) => l.variantId === variantId)
          if (i === -1) return [...prev, { variantId, qty: addQty }]
          const next = prev.slice()
          next[i] = { ...next[i], qty: clampInt(next[i].qty + addQty, 1, 99) }
          return next
        })
        setCartOpen(true)
      },
      remove: (variantId) => {
        setLines((prev) => prev.filter((l) => l.variantId !== variantId))
      },
      setQty: (variantId, qty) => {
        const nextQty = clampInt(qty, 1, 99)
        setLines((prev) =>
          prev.map((l) => (l.variantId === variantId ? { ...l, qty: nextQty } : l)),
        )
      },
      clear: () => setLines([]),
    }),
    [cartOpen, lines, subtotal, totalItems, lookup],
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

