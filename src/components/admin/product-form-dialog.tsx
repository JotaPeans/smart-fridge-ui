import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '#/components/ui/form.tsx'
import { FormInputField } from '#/components/FormInputField.tsx'
import { Textarea } from '#/components/ui/textarea.tsx'
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '#/domain/product/query.ts'
import type { ProductResponseType } from '#/domain/product/types.ts'

const schema = z.object({
  name: z.string().min(1, 'Obrigatório').max(255),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().optional(),
  price: z
    .string()
    .min(1, 'Obrigatório')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Deve ser ≥ 0'),
  stock: z
    .string()
    .min(1, 'Obrigatório')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Deve ser um inteiro ≥ 0'),
})
type FormValues = z.infer<typeof schema>

export function ProductFormDialog({
  open,
  onOpenChange,
  fridgeId,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fridgeId: string
  product?: ProductResponseType
}) {
  const isEdit = !!product
  const createMutation = useCreateProductMutation()
  const updateMutation = useUpdateProductMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      imageUrl: product?.imageUrl ?? '',
      price: product?.price?.toString() ?? '',
      stock: product?.stock?.toString() ?? '0',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: product?.name ?? '',
        description: product?.description ?? '',
        imageUrl: product?.imageUrl ?? '',
        price: product?.price?.toString() ?? '',
        stock: product?.stock?.toString() ?? '0',
      })
    }
  }, [open, product, form])

  async function onSubmit(values: FormValues) {
    const price = Number(values.price)
    const stock = Number(values.stock)
    if (isEdit) {
      await updateMutation.mutateAsync({
        id: product.id,
        fridgeId,
        body: {
          name: values.name,
          description: values.description || null,
          imageUrl: values.imageUrl || null,
          price,
          stock,
        },
      })
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        price,
        stock,
        fridgeId,
      })
    }
    onOpenChange(false)
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações deste produto.' : 'Cadastre um produto nesta geladeira.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Nome" placeholder="Água com gás" required {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Gelada, sem açúcar, 500ml"
                      className="rounded-2xl border-none bg-muted px-4 py-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormInputField label="URL da imagem" placeholder="https://…" {...field} />
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormInputField label="Preço (R$)" type="number" step="0.01" min="0" required {...field} />
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormInputField label="Estoque" type="number" step="1" min="0" required {...field} />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {pending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar produto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
