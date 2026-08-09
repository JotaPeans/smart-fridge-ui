import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { BottomNav } from '#/components/site/bottom-nav.tsx'
import { PhoneShell } from '#/components/site/phone-shell.tsx'
import { authClient } from '#/lib/auth-client.ts'
import { useCart } from '#/domain/cart/store.tsx'
import { useMe } from '#/domain/user/query.ts'
import { queryClient } from '#/lib/query-client.ts'
import { useSales } from '#/domain/sale/query.ts'
import { SALE_STATUS_LABEL } from '#/domain/sale/types.ts'

export const Route = createFileRoute('/_authed/account')({ component: Account })

function Account() {
  const { data: user } = useMe()
  const { data: sales, isPending: salesPending } = useSales()
  const navigate = useNavigate()
  const cart = useCart()

  async function handleSignOut() {
    await authClient.signOut()
    queryClient.clear()
    cart.clear()
    navigate({ to: '/login' })
  }

  return (
    <PhoneShell className="pb-32">
      <header className="px-6 pt-12">
        <h1 className="text-3xl font-extrabold text-foreground">Conta</h1>
      </header>

      <div className="mt-6 mx-6 flex items-center gap-4 rounded-3xl bg-muted p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {user?.name?.[0]?.toUpperCase() ?? user?.email[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">
            {user?.name ?? 'Cliente da geladeira'}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mx-6 mt-8">
        <h2 className="text-sm font-semibold text-foreground">Histórico de compras</h2>
        <div className="mt-3 flex flex-col gap-2">
          {salesPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}

          {!salesPending && sales?.items.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma compra ainda.
            </p>
          )}

          {sales?.items.map((sale) => (
            <Link
              key={sale.id}
              to="/f/$fridgeId/sale/$saleId"
              params={{ fridgeId: sale.fridgeId, saleId: sale.id }}
              className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {sale.items.reduce((n, item) => n + item.quantity, 0)} item(ns)
                </p>
                <p className="text-xs text-muted-foreground">{SALE_STATUS_LABEL[sale.status]}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-foreground">
                R$ {sale.totalAmount.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-6 mt-8">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-semibold text-foreground"
        >
          <LogOut className="size-4" strokeWidth={2.25} />
          Sair
        </button>
      </div>

      <BottomNav />
    </PhoneShell>
  )
}
