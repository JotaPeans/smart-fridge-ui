import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Minus, PackageOpen, Plus, ShoppingBasket } from 'lucide-react'
import { toast } from 'sonner'
import { CartBadge } from '#/components/site/cart-badge.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { useCart } from '#/domain/cart/store.tsx'
import { useProduct } from '#/domain/product/query.ts'
import { toneClasses, toneForId } from '#/lib/product-tone.ts'

export const Route = createFileRoute('/_authed/f/$fridgeId/product/$productId')({
  component: ProductDetail,
})

function ProductDetail() {
  const { fridgeId, productId } = Route.useParams()
  const navigate = useNavigate()
  const { data: product, isPending, isError } = useProduct(productId)
  const cart = useCart()
  const [qty, setQty] = useState(1)

  if (isPending) {
    return (
      <PhoneShell className="flex min-h-dvh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </PhoneShell>
    )
  }

  if (isError || !product) {
    return (
      <PhoneShell className="flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">Este produto não foi encontrado.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Voltar
        </button>
      </PhoneShell>
    )
  }

  const tone = toneForId(product.id)
  const total = (product.price * qty).toFixed(2)

  function handleAddToCart() {
    if (!product) return
    const p = product
    cart.addItem(
      fridgeId,
      {
        productId: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
      },
      qty,
      p.stock,
    )
    toast.success(`${p.name} adicionado ao carrinho`)
    navigate({ to: '/f/$fridgeId', params: { fridgeId } })
  }

  return (
    <PhoneShell className="flex flex-col pb-10">
      <header className="flex items-center justify-between px-6 pt-12">
        <h1 className="text-2xl font-extrabold text-foreground">{product.name}</h1>
        <button
          type="button"
          onClick={() => navigate({ to: '/f/$fridgeId', params: { fridgeId } })}
          aria-label="Voltar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
        >
          <ChevronLeft className="size-5" strokeWidth={2.25} />
        </button>
      </header>

      <div
        className={`relative mx-6 mt-6 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[2rem] ${toneClasses[tone]}`}
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <PackageOpen className="size-28 text-foreground/80" strokeWidth={1.25} />
        )}
        {product.description && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-card px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-semibold text-muted-foreground">{product.description}</p>
          </div>
        )}
      </div>

      {product.stock === 0 ? (
        <p className="mt-10 text-center text-sm font-semibold text-muted-foreground">
          Fora de estoque
        </p>
      ) : (
        <div className="mt-10 flex items-center justify-center gap-6 px-6">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="flex size-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
            disabled={qty <= 1}
          >
            <Minus className="size-4" strokeWidth={2.5} />
          </button>
          <span className="min-w-8 text-center text-3xl font-extrabold tabular-nums text-foreground">
            {qty.toString().padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Aumentar quantidade"
            className="flex size-11 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
            disabled={qty >= product.stock}
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className="mt-auto flex items-baseline justify-between px-6 pt-10">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-2xl font-extrabold text-foreground">R$ {total}</span>
      </div>

      <div className="mt-4 px-6">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex h-14 w-full items-center gap-3 rounded-full bg-primary pl-1.5 pr-6 text-primary-foreground transition-opacity disabled:opacity-70"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
            <ShoppingBasket className="size-5" strokeWidth={2.25} />
          </span>
          <span className="flex-1 text-left text-base font-semibold">Adicionar ao carrinho</span>
        </button>
      </div>

      <CartBadge fridgeId={fridgeId} />
    </PhoneShell>
  )
}
