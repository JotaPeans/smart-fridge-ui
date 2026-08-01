import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { AdminShell } from '#/components/admin/admin-shell.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Skeleton } from '#/components/ui/skeleton.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table.tsx'
import { useAdmins } from '#/domain/user/query.ts'

export const Route = createFileRoute('/_authed/master/admins/')({ component: AdminsDirectory })

function AdminsDirectory() {
  const [search, setSearch] = useState('')
  const { data, isPending } = useAdmins(search)

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold text-foreground">Admins</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Diretório de administradores — cada geladeira pertence a um deles.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-background px-4 max-w-sm border border-border">
        <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou CPF"
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

        {!isPending && data?.items.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhum admin encontrado.
          </p>
        )}

        {!isPending && data && data.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium text-foreground">{admin.name}</TableCell>
                  <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                  <TableCell className="text-muted-foreground">{admin.phone}</TableCell>
                  <TableCell>
                    <Badge variant={admin.active ? 'default' : 'outline'}>
                      {admin.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminShell>
  )
}
