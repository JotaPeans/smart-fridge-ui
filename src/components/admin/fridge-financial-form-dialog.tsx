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
import { useUpdateFridgeMutation } from '#/domain/fridge/query.ts'
import {
  CNPJ_REGEX,
  GATEWAY_TYPE_LABEL,
  GatewayTypeSchema,
  NFC_PLATFORM_LABEL,
  NfcPlatformSchema,
  REGIME_TRIBUTARIO_LABEL,
  RegimeTributarioSchema,
} from '#/domain/fridge/types.ts'
import type { FridgeResponseType } from '#/domain/fridge/types.ts'
import { maskCnpj } from '#/lib/masks.ts'

const schema = z.object({
  cnpj: z.string().regex(CNPJ_REGEX, 'CNPJ inválido'),
  regimeTributario: RegimeTributarioSchema,
  nfcPlatform: NfcPlatformSchema.optional(),
  nfcApiKey: z.string().optional(),
  clearNfcApiKey: z.boolean().optional(),
  gatewayType: GatewayTypeSchema,
  gatewayCardMachineId: z.string().optional(),
  paymentCredential: z.string().optional(),
  clearCredential: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

/** Fiscal, NFC-e and payment-gateway configuration for an existing fridge — split from `FridgeFormDialog` since it's a distinct concern with its own access rules. */
export function FridgeFinancialFormDialog({
  open,
  onOpenChange,
  fridge,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fridge: FridgeResponseType
}) {
  const updateMutation = useUpdateFridgeMutation()
  const [showNfcApiKeyField, setShowNfcApiKeyField] = useState(false)
  const [showCredentialField, setShowCredentialField] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cnpj: fridge.cnpj,
      regimeTributario: fridge.regimeTributario,
      nfcPlatform: fridge.nfcPlatform ?? undefined,
      nfcApiKey: '',
      clearNfcApiKey: false,
      gatewayType: fridge.gatewayType,
      gatewayCardMachineId: '',
      paymentCredential: '',
      clearCredential: false,
    },
  })

  const gatewayType = form.watch('gatewayType')

  useEffect(() => {
    if (open) {
      form.reset({
        cnpj: fridge.cnpj,
        regimeTributario: fridge.regimeTributario,
        nfcPlatform: fridge.nfcPlatform ?? undefined,
        nfcApiKey: '',
        clearNfcApiKey: false,
        gatewayType: fridge.gatewayType,
        gatewayCardMachineId: '',
        paymentCredential: '',
        clearCredential: false,
      })
      setShowNfcApiKeyField(false)
      setShowCredentialField(false)
    }
  }, [open, fridge, form])

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync({
      id: fridge.id,
      body: {
        cep: fridge.cep,
        lat: fridge.lat,
        lng: fridge.lng,
        cnpj: values.cnpj,
        regimeTributario: values.regimeTributario,
        nfcPlatform: values.nfcPlatform,
        nfcApiKey: values.clearNfcApiKey ? null : values.nfcApiKey || undefined,
        gatewayType: values.gatewayType,
        gatewayCardMachineId:
          values.gatewayType === 'MERCADOPAGO'
            ? values.gatewayCardMachineId || undefined
            : undefined,
        paymentCredential: values.clearCredential
          ? null
          : values.paymentCredential || undefined,
      },
    })
    onOpenChange(false)
  }

  const pending = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dados financeiros</DialogTitle>
          <DialogDescription>
            Configure CNPJ, regime tributário, NFC-e e gateway de pagamento desta geladeira.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormInputField
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  required
                  {...field}
                  onChange={(e) => field.onChange(maskCnpj(e.target.value))}
                />
              )}
            />
            <FormField
              control={form.control}
              name="regimeTributario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">
                    Regime tributário <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 w-full rounded-2xl border-none bg-muted px-4">
                        <SelectValue placeholder="Selecione o regime tributário" />
                      </SelectTrigger>
                      <SelectContent>
                        {RegimeTributarioSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {REGIME_TRIBUTARIO_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nfcPlatform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">
                    Plataforma de NFC-e
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? 'NONE'}
                      onValueChange={(value) => field.onChange(value === 'NONE' ? undefined : value)}
                    >
                      <SelectTrigger className="h-12 w-full rounded-2xl border-none bg-muted px-4">
                        <SelectValue placeholder="Selecione uma plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Não configurada</SelectItem>
                        {NfcPlatformSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {NFC_PLATFORM_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!showNfcApiKeyField && (
              <button
                type="button"
                onClick={() => setShowNfcApiKeyField(true)}
                className="self-start text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Alterar chave de API da NFC-e
              </button>
            )}

            {showNfcApiKeyField && (
              <FormField
                control={form.control}
                name="nfcApiKey"
                render={({ field }) => (
                  <FormInputField
                    label="Chave de API da NFC-e"
                    type="password"
                    placeholder="Chave de API não pode ser recuperada — deixe em branco para manter a atual"
                    {...field}
                  />
                )}
              />
            )}

            {showNfcApiKeyField && (
              <FormField
                control={form.control}
                name="clearNfcApiKey"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    Remover chave de API da NFC-e existente
                  </label>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="gatewayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground">
                    Gateway de pagamento <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 w-full rounded-2xl border-none bg-muted px-4">
                        <SelectValue placeholder="Selecione um gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        {GatewayTypeSchema.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {GATEWAY_TYPE_LABEL[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {gatewayType === 'MERCADOPAGO' && (
              <FormField
                control={form.control}
                name="gatewayCardMachineId"
                render={({ field }) => (
                  <FormInputField
                    label="Terminal Point (terminal_id)"
                    placeholder="Deixe em branco para manter o valor atual"
                    {...field}
                  />
                )}
              />
            )}

            {!showCredentialField && (
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
                    placeholder="Deixe em branco para manter o valor atual"
                    {...field}
                  />
                )}
              />
            )}

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

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {pending ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
