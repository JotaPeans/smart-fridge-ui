import { AnimatePresence, motion } from 'motion/react'
import { PackageOpen } from 'lucide-react'
import type { CartFlight } from '#/domain/cart/types.ts'

const DURATION = 0.8
const ARC_STEPS = 20

// Samples a quadratic bezier so the flight follows a real curve instead of two
// straight segments meeting at a corner.
function arcPoints(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x
  const controlX = from.x + dx / 2
  const controlY = Math.min(from.y, to.y) - Math.max(72, Math.abs(dx) * 0.45)

  const xs: number[] = []
  const ys: number[] = []
  const times: number[] = []
  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS
    const inv = 1 - t
    xs.push(inv * inv * from.x + 2 * inv * t * controlX + t * t * to.x)
    ys.push(inv * inv * from.y + 2 * inv * t * controlY + t * t * to.y)
    times.push(t)
  }
  return { xs, ys, times }
}

export function CartFlyOverlay({
  flights,
  onComplete,
}: {
  flights: CartFlight[]
  onComplete: (id: number) => void
}) {
  return (
    <AnimatePresence>
      {flights.map((flight) => {
        const { xs, ys, times } = arcPoints(flight.from, flight.to)
        const tilt = flight.to.x < flight.from.x ? 16 : -16

        return (
          <motion.div
            key={flight.id}
            initial={{ x: xs[0], y: ys[0], scale: 0.6, opacity: 1, rotate: 0 }}
            animate={{
              x: xs,
              y: ys,
              scale: [0.6, 1.05, 0.2],
              opacity: [1, 1, 0],
              rotate: [0, tilt, 0],
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{
              duration: DURATION,
              ease: 'easeInOut',
              x: { times, ease: 'easeInOut' },
              y: { times, ease: 'easeInOut' },
              scale: { times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] },
              opacity: { times: [0, 0.7, 1], ease: 'easeIn' },
              rotate: { times: [0, 0.45, 1], ease: 'easeInOut' },
            }}
            onAnimationComplete={() => onComplete(flight.id)}
            className="pointer-events-none fixed top-0 left-0 z-50 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]"
          >
            <PackageOpen className="size-3.5" strokeWidth={2} />
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}
