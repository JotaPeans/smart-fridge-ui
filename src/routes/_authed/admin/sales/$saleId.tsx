import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import { useQuery } from '@tanstack/react-query'
import { getSale } from '#/domain/sale/api.ts'
import { SALE_STATUS_LABEL } from '#/domain/sale/types.ts'
import type { SaleResponseType } from '#/domain/sale/types.ts'
import { useFridges } from '#/domain/fridge/query.ts'
import { useProduct } from '#/domain/product/query.ts'

export const Route = createFileRoute('/_authed/admin/sales/$saleId')({ component: SaleDetail })

function SaleDetail() {
  const { saleId } = Route.useParams()
  const navigate = useNavigate()
  const { data: sale, isPending } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      const { data, error } = await getSale(saleId)
      if (error) throw error
      return data
    },
  })
  const { data: fridges } = useFridges(1, 100)
  const fridgeName = sale ? (fridges?.items.find((f) => f.id === sale.fridgeId)?.name ?? sale.fridgeId) : ''

  return (
    <AdminShell>
      <div className="flex items-center gap-3">
        <Button
          size="icon-sm"
          variant="outline"
          className="rounded-full"
          aria-label="Voltar"
          onClick={() => navigate({ to: '/admin/sales' })}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-extrabold text-foreground">Venda</h1>
      </div>

      {isPending && (
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      )}

      {!isPending && sale && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Geladeira
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">{fridgeName}</p>
              </div>
              <Badge variant="outline">{SALE_STATUS_LABEL[sale.status]}</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Total" value={`R$ ${sale.totalAmount.toFixed(2)}`} />
              <Field
                label="Criada em"
                value={new Date(sale.createdAt).toLocaleString('pt-BR')}
              />
              <Field
                label="Pagamento confirmado"
                value={sale.startedAt ? new Date(sale.startedAt).toLocaleString('pt-BR') : '—'}
              />
              <Field
                label="Porta fechada"
                value={sale.endedAt ? new Date(sale.endedAt).toLocaleString('pt-BR') : '—'}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <p className="text-sm font-semibold text-foreground">Itens</p>
            <div className="mt-3 flex flex-col gap-2">
              {sale.items.map((item) => (
                <SaleItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

function SaleItemRow({ item }: { item: SaleResponseType['items'][number] }) {
  const { data: product } = useProduct(item.productId)

  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm">
      <span className="text-muted-foreground">{product?.name ?? 'Produto'}</span>
      <span className="font-medium text-foreground">
        {item.quantity} × R$ {item.unitPrice.toFixed(2)}
      </span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
