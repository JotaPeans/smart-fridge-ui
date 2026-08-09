import { Link } from '@tanstack/react-router'
import { ShoppingBasket } from 'lucide-react'
import { useCart } from '#/domain/cart/store.tsx'

export function CartBadge({ fridgeId }: { fridgeId: string }) {
  const { fridgeId: cartFridgeId, totalCount } = useCart()

  if (cartFridgeId !== fridgeId || totalCount === 0) return null

  return (
    <Link
      to="/f/$fridgeId/cart"
      params={{ fridgeId }}
      aria-label={`Ver carrinho, ${totalCount} item(ns)`}
      className="fixed bottom-24 right-6 z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] transition-transform active:scale-95 sm:absolute"
    >
      <ShoppingBasket className="size-5" strokeWidth={2.25} />
      <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-extrabold tabular-nums text-primary">
        {totalCount}
      </span>
    </Link>
  )
}
