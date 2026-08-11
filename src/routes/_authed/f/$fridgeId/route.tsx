import { useState } from 'react'
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { CartBadge } from '#/components/site/cart-badge.tsx'
import { CartFlyOverlay } from '#/components/site/cart-fly-overlay.tsx'
import { PhoneShellFrame } from '#/components/site/phone-shell.tsx'
import { useCart } from '#/domain/cart/store.tsx'

export const Route = createFileRoute('/_authed/f/$fridgeId')({ component: FridgeLayout })

function subPath(pathname: string) {
  const rest = pathname.replace(/^.*\/f\/[^/]+/, '')
  return rest.replace(/^\/|\/$/g, '')
}

function routeDepth(sub: string) {
  return sub.split('/').filter(Boolean).length
}

const variants = {
  enter: (direction: number) => ({ x: direction >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction >= 0 ? '-30%' : '30%', opacity: 0 }),
}

function FridgeLayout() {
  const { fridgeId } = Route.useParams()
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const sub = subPath(location.pathname)
  const depth = routeDepth(sub)
  const isIndex = sub === ''
  const isProduct = sub.startsWith('product/')

  const [prevDepth, setPrevDepth] = useState(depth)
  const [direction, setDirection] = useState(0)
  if (depth !== prevDepth) {
    setDirection(depth > prevDepth ? 1 : -1)
    setPrevDepth(depth)
  }

  const cart = useCart()

  return (
    <PhoneShellFrame className="overflow-x-hidden">
      {shouldReduceMotion ? (
        <Outlet />
      ) : (
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-0 left-0 w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      )}

      <CartFlyOverlay flights={cart.flights} onComplete={cart.completeFly} />
      {(isIndex || isProduct) && <CartBadge fridgeId={fridgeId} />}
      {isIndex && <BottomNav fridgeId={fridgeId} />}
    </PhoneShellFrame>
  )
}
