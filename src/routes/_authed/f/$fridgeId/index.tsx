import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { CartBadge } from '#/components/site/cart-badge.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { ProductCard } from '#/components/site/product-card.tsx'
import { Input } from '#/components/ui/input.tsx'
import { useCart } from '#/domain/cart/store.tsx'
import { useProducts } from '#/domain/product/query.ts'

export const Route = createFileRoute('/_authed/f/$fridgeId/')({ component: Browse })

function Browse() {
  const { fridgeId } = Route.useParams()
  const { data, isPending, isError } = useProducts(fridgeId)
  const [search, setSearch] = useState('')
  const { ensureFridge } = useCart()

  useEffect(() => {
    ensureFridge(fridgeId)
  }, [fridgeId, ensureFridge])

  const visible = useMemo(() => {
    const items = data?.items ?? []
    if (!search.trim()) return items
    const q = search.trim().toLowerCase()
    return items.filter((p) => p.name.toLowerCase().includes(q))
  }, [data, search])

  return (
    <PhoneShell className="pb-32">
      <header className="px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-foreground">O que você busca?</h1>x
      </header>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted px-4 mx-6">
        <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos"
          className="h-11 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {isPending && (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="mt-16 px-6 text-center text-sm text-muted-foreground">
          Não foi possível carregar os produtos desta geladeira. Confira o código e tente
          novamente.
        </p>
      )}

      {!isPending && !isError && (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 px-6">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} fridgeId={fridgeId} />
          ))}
        </div>
      )}

      {!isPending && !isError && visible.length === 0 && (
        <p className="mt-16 px-6 text-center text-sm text-muted-foreground">
          {search ? 'Nenhum produto encontrado.' : 'Esta geladeira ainda não tem produtos.'}
        </p>
      )}

      <CartBadge fridgeId={fridgeId} />
      <BottomNav fridgeId={fridgeId} />
    </PhoneShell>
  )
}
