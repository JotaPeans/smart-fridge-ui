import { useState } from 'react'
import { LockOpen, Pencil, Plus, Power } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { ConfirmAction } from '#/components/ConfirmAction.tsx'
import { AnalyticsPanel } from '#/components/admin/analytics-panel.tsx'
import { ProductFormDialog } from '#/components/admin/product-form-dialog.tsx'
import { useProducts, useDeactivateProductMutation } from '#/domain/product/query.ts'
import { useOpenDoorMutation } from '#/domain/fridge/query.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'
import type { ProductResponseType } from '#/domain/product/types.ts'

export function FridgeExpandPanel({ fridge }: { fridge: FridgeResponseType }) {
  return (
    <div className="border-t border-border bg-muted/40 p-6">
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="door">Porta</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <ProductsTab fridgeId={fridge.id} />
        </TabsContent>

        <TabsContent value="door" className="mt-4">
          <DoorTab fridge={fridge} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsPanel filters={{ fridgeId: fridge.id }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductsTab({ fridgeId }: { fridgeId: string }) {
  const { data, isPending } = useProducts(fridgeId)
  const deactivateMutation = useDeactivateProductMutation()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductResponseType | undefined>(undefined)

  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Produtos desta geladeira</h3>
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" />
          Novo produto
        </Button>
      </div>

      {isPending && <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>}

      {!isPending && data?.items.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
      )}

      {!isPending && data && data.items.length > 0 && (
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.active ? 'default' : 'outline'}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="rounded-full"
                    aria-label="Editar produto"
                    onClick={() => {
                      setEditing(product)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button
                        size="icon-sm"
                        variant="outline"
                        className="rounded-full text-destructive"
                        aria-label="Desativar produto"
                        disabled={!product.active}
                      >
                        <Power className="size-3.5" />
                      </Button>
                    }
                    title="Desativar produto"
                    description={`Tem certeza que deseja desativar "${product.name}"? Ele deixará de aparecer para os clientes.`}
                    confirmLabel="Desativar"
                    destructive
                    onConfirm={() =>
                      deactivateMutation.mutate({ id: product.id, fridgeId })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        fridgeId={fridgeId}
        product={editing}
      />
    </div>
  )
}

function DoorTab({ fridge }: { fridge: FridgeResponseType }) {
  const openDoorMutation = useOpenDoorMutation()

  return (
    <div className="rounded-2xl bg-background p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-cream text-foreground">
          <LockOpen className="size-5" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Abertura manual da porta</p>
          <p className="text-xs text-muted-foreground">
            Uso administrativo/manutenção — fora do fluxo de pagamento do cliente.
          </p>
        </div>
      </div>

      <ConfirmAction
        trigger={
          <Button
            className="mt-5 rounded-full"
            disabled={!fridge.active || openDoorMutation.isPending}
          >
            {openDoorMutation.isPending ? 'Destravando…' : 'Destravar porta'}
          </Button>
        }
        title="Destravar a porta"
        description={`Isso abrirá fisicamente a porta de "${fridge.name}" agora. Confirme apenas se estiver certo disso.`}
        confirmLabel="Destravar"
        onConfirm={() => openDoorMutation.mutate(fridge.id)}
      />

      {!fridge.active && (
        <p className="mt-3 text-xs text-destructive">
          Esta geladeira está inativa — reative-a para poder destravar a porta.
        </p>
      )}
    </div>
  )
}
