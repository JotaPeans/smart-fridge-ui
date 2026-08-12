import { Fragment, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Pencil, Plus, Power, Search, Wallet } from 'lucide-react'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { FridgeConnectionBadge } from '#/components/admin/fridge-connection-badge.tsx'
import { FridgeFormDialog } from '#/components/admin/fridge-form-dialog.tsx'
import { FridgeFinancialFormDialog } from '#/components/admin/fridge-financial-form-dialog.tsx'
import { FridgeExpandPanel } from '#/components/admin/fridge-expand-panel.tsx'
import { ConfirmAction } from '#/components/ConfirmAction.tsx'
import { PaginationBar } from '#/components/admin/pagination-bar.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import { useFridges, useDeactivateFridgeMutation } from '#/domain/fridge/query.ts'
import { useAdmins } from '#/domain/user/query.ts'
import { cn } from '#/lib/utils.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'

interface FridgesSearch {
  expanded?: string
  page?: number
}

export const Route = createFileRoute('/_authed/master/fridges/')({
  validateSearch: (search: Record<string, unknown>): FridgesSearch => ({
    expanded: typeof search.expanded === 'string' ? search.expanded : undefined,
    page: typeof search.page === 'number' ? search.page : Number(search.page) || undefined,
  }),
  component: FridgesWorkbench,
})

function FridgesWorkbench() {
  const { expanded, page = 1 } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isPending } = useFridges(page, 20)
  const { data: admins } = useAdmins()
  const deactivateMutation = useDeactivateFridgeMutation()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FridgeResponseType | undefined>(undefined)
  const [financialOpen, setFinancialOpen] = useState(false)
  const [editingFinancial, setEditingFinancial] = useState<FridgeResponseType | undefined>(undefined)

  const adminName = (id: string) => admins?.items.find((a) => a.id === id)?.name ?? id

  const PLACEHOLDER_CNPJ = '00.000.000/0000-00'

  const visible = data?.items.filter((f) =>
    search.trim() ? f.name.toLowerCase().includes(search.trim().toLowerCase()) : true,
  )

  function toggleExpand(id: string) {
    navigate({ search: (prev) => ({ ...prev, expanded: prev.expanded === id ? undefined : id }) })
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Geladeiras</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie a frota, produtos e portas de cada geladeira.
          </p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nova geladeira
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-background px-4 max-w-sm border border-border">
        <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome"
          className="h-11 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-background">
        {isPending && (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        )}

        {!isPending && visible?.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? 'Nenhuma geladeira encontrada.' : 'Nenhuma geladeira cadastrada ainda.'}
          </p>
        )}

        {!isPending && visible && visible.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((fridge) => (
                <Fragment key={fridge.id}>
                  <TableRow
                    key={fridge.id}
                    className="cursor-pointer"
                    onClick={() => toggleExpand(fridge.id)}
                  >
                    <TableCell>
                      <ChevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          expanded === fridge.id && 'rotate-180',
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{fridge.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {fridge.location ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {adminName(fridge.adminId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {fridge.cnpj}
                        {fridge.cnpj === PLACEHOLDER_CNPJ && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600/40">
                            Pendente de revisão
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <FridgeConnectionBadge status={fridge.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={fridge.active ? 'default' : 'outline'}>
                        {fridge.active ? 'Desbloqueada' : 'Bloqueada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          className="rounded-full"
                          aria-label="Editar geladeira"
                          onClick={() => {
                            setEditing(fridge)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          className="rounded-full"
                          aria-label="Editar dados financeiros"
                          onClick={() => {
                            setEditingFinancial(fridge)
                            setFinancialOpen(true)
                          }}
                        >
                          <Wallet className="size-3.5" />
                        </Button>
                        <ConfirmAction
                          trigger={
                            <Button
                              size="icon-sm"
                              variant="outline"
                              className="rounded-full text-destructive"
                              aria-label="Desativar geladeira"
                              disabled={!fridge.active}
                            >
                              <Power className="size-3.5" />
                            </Button>
                          }
                          title="Desativar geladeira"
                          description={`Tem certeza que deseja desativar "${fridge.name}"? Ela deixará de aparecer para os clientes.`}
                          confirmLabel="Desativar"
                          destructive
                          onConfirm={() => deactivateMutation.mutate(fridge.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded === fridge.id && (
                    <TableRow key={`${fridge.id}-expand`} className="hover:bg-transparent">
                      <TableCell colSpan={8} className="p-0">
                        <FridgeExpandPanel fridge={fridge} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && (
        <PaginationBar
          page={page}
          totalPages={data.totalPages}
          onPageChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
        />
      )}

      <FridgeFormDialog open={formOpen} onOpenChange={setFormOpen} fridge={editing} />

      {editingFinancial && (
        <FridgeFinancialFormDialog
          open={financialOpen}
          onOpenChange={setFinancialOpen}
          fridge={editingFinancial}
        />
      )}
    </AdminShell>
  )
}
