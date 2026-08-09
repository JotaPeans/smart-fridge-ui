import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { CartItem } from './types.ts'

const STORAGE_KEY = 'smart-fridge:cart'

type CartState = {
  fridgeId: string | null
  items: CartItem[]
}

type CartContextValue = {
  fridgeId: string | null
  items: CartItem[]
  totalCount: number
  totalPrice: number
  addItem: (
    fridgeId: string,
    item: Omit<CartItem, 'quantity'>,
    quantity?: number,
    maxStock?: number,
  ) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number, maxStock?: number) => void
  clear: () => void
  ensureFridge: (fridgeId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStorage(): CartState {
  if (typeof window === 'undefined') return { fridgeId: null, items: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { fridgeId: null, items: [] }
    const parsed = JSON.parse(raw) as CartState
    if (!parsed || !Array.isArray(parsed.items)) return { fridgeId: null, items: [] }
    return parsed
  } catch {
    return { fridgeId: null, items: [] }
  }
}

function resetIfDifferentFridge(prev: CartState, fridgeId: string): CartState {
  if (prev.fridgeId === fridgeId) return prev
  if (prev.items.length > 0) toast.info('Seu carrinho foi limpo ao trocar de geladeira')
  return { fridgeId, items: [] }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => readStorage())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const ensureFridge = useCallback((fridgeId: string) => {
    setState((prev) => resetIfDifferentFridge(prev, fridgeId))
  }, [])

  const addItem = useCallback<CartContextValue['addItem']>(
    (fridgeId, item, quantity = 1, maxStock) => {
      setState((prev) => {
        const base = resetIfDifferentFridge(prev, fridgeId)
        const existing = base.items.find((i) => i.productId === item.productId)
        const items = existing
          ? base.items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    quantity: maxStock
                      ? Math.min(maxStock, i.quantity + quantity)
                      : i.quantity + quantity,
                  }
                : i,
            )
          : [...base.items, { ...item, quantity: maxStock ? Math.min(maxStock, quantity) : quantity }]
        return { fridgeId, items }
      })
    },
    [],
  )

  const removeItem = useCallback((productId: string) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.productId !== productId) }))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number, maxStock?: number) => {
    setState((prev) => ({
      ...prev,
      items:
        quantity <= 0
          ? prev.items.filter((i) => i.productId !== productId)
          : prev.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: maxStock ? Math.min(maxStock, quantity) : quantity }
                : i,
            ),
    }))
  }, [])

  const clear = useCallback(() => setState((prev) => ({ ...prev, items: [] })), [])

  const totalCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  )
  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      fridgeId: state.fridgeId,
      items: state.items,
      totalCount,
      totalPrice,
      addItem,
      removeItem,
      setQuantity,
      clear,
      ensureFridge,
    }),
    [state.fridgeId, state.items, totalCount, totalPrice, addItem, removeItem, setQuantity, clear, ensureFridge],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
