import { Link } from '@tanstack/react-router'
import { PackageOpen, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCart } from '#/domain/cart/store.tsx'
import { toneClasses, toneForId } from '#/lib/product-tone.ts'
import type { ProductResponseType } from '#/domain/product/types.ts'

export function ProductCard({
  product,
  fridgeId,
}: {
  product: ProductResponseType
  fridgeId: string
}) {
  const tone = toneForId(product.id)
  const cart = useCart()
  const shouldReduceMotion = useReducedMotion()
  const inCartQty =
    cart.fridgeId === fridgeId
      ? (cart.items.find((i) => i.productId === product.id)?.quantity ?? 0)
      : 0

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-card transition-transform active:scale-[0.98]">
      <Link
        to="/f/$fridgeId/product/$productId"
        params={{ fridgeId, productId: product.id }}
        className="contents"
      >
        <div
          className={`relative flex aspect-square items-center justify-center overflow-hidden ${toneClasses[tone]}`}
        >
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
          ) : (
            <PackageOpen className="size-14 text-foreground/80" strokeWidth={1.5} />
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground/70">
              restam {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-semibold text-foreground/70">
              Fora de estoque
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-2 px-0.5 pt-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
            {product.description && (
              <p className="truncate text-xs text-muted-foreground">{product.description}</p>
            )}
          </div>
          <p className="shrink-0 text-sm font-bold text-foreground">
            R$ {product.price.toFixed(2)}
          </p>
        </div>
      </Link>

      {product.stock > 0 && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!shouldReduceMotion) cart.requestFly(e.currentTarget.getBoundingClientRect())
            cart.addItem(
              fridgeId,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
              },
              1,
              product.stock,
            )
          }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.82 }}
          transition={{ type: 'spring', stiffness: 700, damping: 22 }}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          className="absolute bottom-[3.75rem] right-2.5 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)]"
        >
          {inCartQty > 0 ? (
            <motion.span
              key={inCartQty}
              initial={shouldReduceMotion ? false : { scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 18 }
              }
              className="text-xs font-extrabold tabular-nums"
            >
              {inCartQty}
            </motion.span>
          ) : (
            <Plus className="size-4" strokeWidth={2.5} />
          )}
        </motion.button>
      )}
    </div>
  )
}
