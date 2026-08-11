import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search } from 'lucide-react'
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
  const shouldReduceMotion = useReducedMotion()

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
    <div className="pb-32">
      <header className="px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-foreground">O que você busca?</h1>
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
        <motion.div layout={!shouldReduceMotion} className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 px-6">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((product, i) => (
              <motion.div
                key={product.id}
                layout={!shouldReduceMotion}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.28, delay: Math.min(i, 9) * 0.03, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <ProductCard product={product} fridgeId={fridgeId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isPending && !isError && visible.length === 0 && (
        <p className="mt-16 px-6 text-center text-sm text-muted-foreground">
          {search ? 'Nenhum produto encontrado.' : 'Esta geladeira ainda não tem produtos.'}
        </p>
      )}
    </div>
  )
}
