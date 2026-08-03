import { Fragment, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Pencil, Search } from 'lucide-react'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { FridgeFormDialog } from '#/components/admin/fridge-form-dialog.tsx'
import { FridgeExpandPanel } from '#/components/admin/fridge-expand-panel.tsx'
import { PaginationBar } from '#/components/admin/pagination-bar.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import { useFridges } from '#/domain/fridge/query.ts'
import { cn } from '#/lib/utils.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'

interface FridgesSearch {
  expanded?: string
  page?: number
}

export const Route = createFileRoute('/_authed/admin/fridges/')({
  validateSearch: (search: Record<string, unknown>): FridgesSearch => ({
    expanded: typeof search.expanded === 'string' ? search.expanded : undefined,
    page: typeof search.page === 'number' ? search.page : Number(search.page) || undefined,
  }),
  component: AdminFridgesWorkbench,
})

function AdminFridgesWorkbench() {
  const { expanded, page = 1 } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isPending } = useFridges(page, 20)

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FridgeResponseType | undefined>(undefined)

  const visible = data?.items.filter((f) =>
    search.trim() ? f.name.toLowerCase().includes(search.trim().toLowerCase()) : true,
  )

  function toggleExpand(id: string) {
    navigate({ search: (prev) => ({ ...prev, expanded: prev.expanded === id ? undefined : id }) })
  }

  return (
    <AdminShell>
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Minhas geladeiras</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os produtos e a porta de cada geladeira sob sua responsabilidade.
        </p>
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
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        )}

        {!isPending && visible?.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search
              ? 'Nenhuma geladeira encontrada.'
              : 'Nenhuma geladeira foi atribuída a você ainda.'}
          </p>
        )}

        {!isPending && visible && visible.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Nome</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((fridge) => (
                <Fragment key={fridge.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleExpand(fridge.id)}>
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
                    <TableCell>
                      <Badge variant={fridge.active ? 'default' : 'outline'}>
                        {fridge.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                    </TableCell>
                  </TableRow>
                  {expanded === fridge.id && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="p-0">
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

      <FridgeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        fridge={editing}
        hideAdminField
      />
    </AdminShell>
  )
}
