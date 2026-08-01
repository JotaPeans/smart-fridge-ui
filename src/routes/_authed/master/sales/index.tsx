import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { PaginationBar } from '#/components/admin/pagination-bar.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table.tsx'
import { useSalesList } from '#/domain/sale/query.ts'
import { SALE_STATUS_LABEL } from '#/domain/sale/types.ts'
import { useFridges } from '#/domain/fridge/query.ts'

interface SalesSearch {
  page?: number
}

export const Route = createFileRoute('/_authed/master/sales/')({
  validateSearch: (search: Record<string, unknown>): SalesSearch => ({
    page: typeof search.page === 'number' ? search.page : Number(search.page) || undefined,
  }),
  component: SalesList,
})

function SalesList() {
  const { page = 1 } = Route.useSearch()
  const navigateSearch = Route.useNavigate()
  const navigate = useNavigate()
  const { data, isPending } = useSalesList(page, 20)
  const { data: fridges } = useFridges(1, 100)

  const fridgeName = (id: string) => fridges?.items.find((f) => f.id === id)?.name ?? id

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold text-foreground">Vendas</h1>
      <p className="mt-1 text-sm text-muted-foreground">Todas as vendas realizadas na frota.</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-background">
        {isPending && (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        )}

        {!isPending && data?.items.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma venda ainda.</p>
        )}

        {!isPending && data && data.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Geladeira</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({ to: '/master/sales/$saleId', params: { saleId: sale.id } })
                  }
                >
                  <TableCell className="font-medium text-foreground">
                    {fridgeName(sale.fridgeId)}
                  </TableCell>
                  <TableCell>{sale.items.reduce((n, i) => n + i.quantity, 0)}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    R$ {sale.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{SALE_STATUS_LABEL[sale.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && (
        <PaginationBar
          page={page}
          totalPages={data.totalPages}
          onPageChange={(p) => navigateSearch({ search: { page: p } })}
        />
      )}
    </AdminShell>
  )
}
