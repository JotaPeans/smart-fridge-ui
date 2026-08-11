import { Link } from '@tanstack/react-router'
import { ShoppingBasket } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { CART_BADGE_TARGET_ID, useCart } from '#/domain/cart/store.tsx'

export function CartBadge({ fridgeId }: { fridgeId: string }) {
  const { fridgeId: cartFridgeId, totalCount } = useCart()
  const shouldReduceMotion = useReducedMotion()
  const visible = cartFridgeId === fridgeId && totalCount > 0

  return (
    <motion.div
      initial={false}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 26 }
      }
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="fixed bottom-24 right-6 z-20 sm:absolute"
    >
      <Link
        id={CART_BADGE_TARGET_ID}
        to="/f/$fridgeId/cart"
        params={{ fridgeId }}
        aria-label={`Ver carrinho, ${totalCount} item(ns)`}
        tabIndex={visible ? 0 : -1}
        className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
      >
        <ShoppingBasket className="size-5" strokeWidth={2.25} />
        <motion.span
          key={totalCount}
          initial={shouldReduceMotion ? false : { scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 18 }
          }
          className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-extrabold tabular-nums text-primary"
        >
          {totalCount}
        </motion.span>
      </Link>
    </motion.div>
  )
}
