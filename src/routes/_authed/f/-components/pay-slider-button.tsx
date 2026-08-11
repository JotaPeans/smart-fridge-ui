'use client'

import { CreditCard, Loader2 } from 'lucide-react'
import { motion, useAnimation, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '#/lib/utils.ts'

const KNOB_SIZE = 48
const KNOB_OFFSET = 4
const THRESHOLD_RATIO = 0.7

export interface PaySliderButtonProps {
  className?: string
  disabled?: boolean
  label?: string
  processingLabel?: string
  onConfirm: () => Promise<void> | void
}

export function PaySliderButton({
  onConfirm,
  label = 'Deslize para pagar',
  processingLabel = 'Processando pagamento…',
  className = '',
  disabled = false,
}: PaySliderButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [maxDistance, setMaxDistance] = useState(0)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const trackRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isBusy = disabled || isProcessing

  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        setMaxDistance(trackRef.current.offsetWidth - KNOB_SIZE - KNOB_OFFSET * 2)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleDragEnd = async () => {
    if (isBusy) return
    const dragDistance = x.get()
    if (dragDistance <= maxDistance * THRESHOLD_RATIO) {
      controls.start({ x: 0 })
      return
    }
    await controls.start({ x: maxDistance })
    setIsProcessing(true)
    try {
      await onConfirm()
    } catch {
      // caller is responsible for surfacing the error (eg. a toast)
    } finally {
      setIsProcessing(false)
      controls.start({ x: 0 })
      x.set(0)
    }
  }

  return (
    <div className={cn('flex h-auto items-center justify-center', className)}>
      <div
        ref={trackRef}
        className={cn(
          'relative h-14 w-full overflow-hidden rounded-full border border-border bg-secondary',
          isBusy && 'opacity-70',
        )}
      >
        <div className="absolute inset-0 left-14 z-0 flex items-center justify-center overflow-hidden pr-4">
          <span className="select-none text-center text-sm font-semibold text-foreground">
            {isProcessing ? processingLabel : label}
          </span>
        </div>
        <motion.div
          animate={controls}
          aria-disabled={isBusy}
          className={cn(
            'absolute top-1 left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md',
            isBusy ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing',
          )}
          drag={isBusy || shouldReduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: maxDistance }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x }}
          tabIndex={isBusy ? -1 : 0}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.25, type: 'spring' as const }
          }
        >
          {isProcessing ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={2.25} />
          ) : (
            <CreditCard className="size-5" strokeWidth={2.25} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
