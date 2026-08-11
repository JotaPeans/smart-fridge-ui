import { Link } from '@tanstack/react-router'
import { ShoppingBasket } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { CART_BADGE_TARGET_ID, useCart } from '#/domain/cart/store.tsx'

export function CartBadge({ fridgeId }: { fridgeId: string }) {
  const { fridgeId: cartFridgeId, totalCount, totalPrice } = useCart()
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
        aria-label={`Ver carrinho, total R$ ${totalPrice.toFixed(2)}`}
        tabIndex={visible ? 0 : -1}
        className="flex h-14 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-primary-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
      >
        <ShoppingBasket className="size-5 shrink-0" strokeWidth={2.25} />
        <motion.span
          key={totalPrice}
          initial={shouldReduceMotion ? false : { scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 18 }
          }
          className="text-sm font-extrabold tabular-nums whitespace-nowrap"
        >
          R$ {totalPrice.toFixed(2)}
        </motion.span>
      </Link>
    </motion.div>
  )
}
