import { useEffect, useState } from 'react'
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
import { Form, FormField } from '#/components/ui/form.tsx'
import { FormInputField } from '#/components/FormInputField.tsx'
import { FormItem, FormLabel, FormControl, FormMessage } from '#/components/ui/form.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { Checkbox } from '#/components/ui/checkbox.tsx'
import { useAdmins } from '#/domain/user/query.ts'
import { useCreateFridgeMutation, useUpdateFridgeMutation } from '#/domain/fridge/query.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'

const schema = z.object({
  name: z.string().min(1, 'Obrigatório').max(255),
  location: z.string().max(255).optional(),
  deviceId: z.string().min(1, 'Obrigatório'),
  adminId: z.string().min(1, 'Selecione um admin'),
  paymentCredential: z.string().optional(),
  clearCredential: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

export function FridgeFormDialog({
  open,
  onOpenChange,
  fridge,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fridge?: FridgeResponseType
}) {
  const isEdit = !!fridge
  const { data: admins } = useAdmins()
  const createMutation = useCreateFridgeMutation()
  const updateMutation = useUpdateFridgeMutation()
  const [showCredentialField, setShowCredentialField] = useState(!isEdit)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: fridge?.name ?? '',
      location: fridge?.location ?? '',
      deviceId: fridge?.deviceId ?? '',
      adminId: fridge?.adminId ?? '',
      paymentCredential: '',
      clearCredential: false,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: fridge?.name ?? '',
        location: fridge?.location ?? '',
        deviceId: fridge?.deviceId ?? '',
        adminId: fridge?.adminId ?? '',
        paymentCredential: '',
        clearCredential: false,
      })
      setShowCredentialField(!isEdit)
    }
  }, [open, fridge, isEdit, form])

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await updateMutation.mutateAsync({
        id: fridge.id,
        body: {
          name: values.name,
          location: values.location || null,
          deviceId: values.deviceId,
          adminId: values.adminId,
          paymentCredential: values.clearCredential
            ? null
            : values.paymentCredential || undefined,
        },
      })
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        location: values.location || undefined,
        deviceId: values.deviceId,
        adminId: values.adminId,
        paymentCredential: values.paymentCredential || undefined,
      })
    }
    onOpenChange(false)
  }

  const pending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar geladeira' : 'Nova geladeira'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações desta geladeira.'
              : 'Preencha os dados para cadastrar uma nova geladeira.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Nome" placeholder="Geladeira Lobby" required {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormInputField label="Localização" placeholder="Térreo, ao lado da recepção" {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormInputField label="ID do dispositivo" placeholder="device-001" required {...field} />
              )}
            />
            <FormField
              control={form.control}
              name="adminId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">
                    Admin responsável <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 w-full rounded-2xl border-none bg-muted px-4">
                        <SelectValue placeholder="Selecione um admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {admins?.items.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.name} · {admin.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && !showCredentialField && (
              <button
                type="button"
                onClick={() => setShowCredentialField(true)}
                className="self-start text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Alterar credencial de pagamento
              </button>
            )}

            {showCredentialField && (
              <FormField
                control={form.control}
                name="paymentCredential"
                render={({ field }) => (
                  <FormInputField
                    label="Credencial de pagamento (opcional)"
                    type="password"
                    placeholder={
                      isEdit ? 'Deixe em branco para manter o valor atual' : 'Token do gateway'
                    }
                    {...field}
                  />
                )}
              />
            )}

            {isEdit && (
              <FormField
                control={form.control}
                name="clearCredential"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    Remover credencial de pagamento existente
                  </label>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {pending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar geladeira'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
