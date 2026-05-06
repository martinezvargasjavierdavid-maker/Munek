import React, { useEffect, useMemo, useState } from 'react'
import { CartContext, type CartState } from './CartContext'
import type { CatalogLookup } from './catalog'
import { useCatalog } from './useCatalog'

export type CartLine = {
  variantId: string
  qty: number
}

const STORAGE_KEY = 'munek.cart.v1'

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.floor(value)))
}

function normalizeCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []

  const quantitiesByVariantId = new Map<string, number>()

  value.forEach((line) => {
    if (!line || typeof line !== 'object') return

    const candidate = line as Partial<CartLine>
    const variantId = typeof candidate.variantId === 'string' ? candidate.variantId.trim() : ''
    if (!variantId) return

    const qty = clampInt(Number(candidate.qty), 1, 99)
    const nextQty = clampInt((quantitiesByVariantId.get(variantId) ?? 0) + qty, 1, 99)
    quantitiesByVariantId.set(variantId, nextQty)
  })

  return [...quantitiesByVariantId.entries()].map(([variantId, qty]) => ({ variantId, qty }))
}

function reconcileCartLines(lines: CartLine[], lookup: CatalogLookup) {
  return normalizeCartLines(lines).filter((line) => {
    const hit = lookup.byVariantId[line.variantId]
    return Boolean(hit?.variant.inStock)
  })
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
      return normalizeCartLines(parsed)
    } catch {
      return []
    }
  })

  const activeLines = useMemo(() => reconcileCartLines(lines, lookup), [lines, lookup])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLines))
    } catch {
      // ignore
    }
  }, [activeLines])

  const totalItems = useMemo(
    () => activeLines.reduce((sum, l) => sum + l.qty, 0),
    [activeLines],
  )

  const subtotal = useMemo(() => {
    return activeLines.reduce((sum, l) => {
      const hit = lookup.byVariantId[l.variantId]
      if (!hit) return sum
      return sum + hit.variant.price * l.qty
    }, 0)
  }, [activeLines, lookup])

  const api: CartState = useMemo(
    () => ({
      cartOpen,
      setCartOpen,
      lines: activeLines,
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
    [activeLines, cartOpen, subtotal, totalItems, lookup],
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}
