import { Link } from '@tanstack/react-router'
import { PackageOpen } from 'lucide-react'
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

  return (
    <Link
      to="/f/$fridgeId/product/$productId"
      params={{ fridgeId, productId: product.id }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card transition-transform active:scale-[0.98]"
    >
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden ${toneClasses[tone]}`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
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
  )
}
