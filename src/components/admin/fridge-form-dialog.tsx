import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin } from 'lucide-react'
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
import { LocationPickerDialog } from '#/components/admin/location-picker-dialog.tsx'
import { useAdmins } from '#/domain/user/query.ts'
import { useCreateFridgeMutation, useUpdateFridgeMutation } from '#/domain/fridge/query.ts'
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
import { geocodeCep } from '#/lib/geo.ts'
import { cn } from '#/lib/utils.ts'
import { maskCep, maskCnpj } from '#/lib/masks.ts'

const schema = z.object({
  name: z.string().min(1, 'Obrigatório').max(255),
  location: z.string().max(255).optional(),
  cep: z
    .string()
    .min(8, 'CEP inválido')
    .max(9, 'CEP inválido'),
  lat: z
    .string()
    .min(1, 'Obrigatório')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90, 'Deve ser entre -90 e 90'),
  lng: z
    .string()
    .min(1, 'Obrigatório')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180, 'Deve ser entre -180 e 180'),
  serialNumber: z.string().min(1, 'Obrigatório'),
  adminId: z.string().optional(),
  cnpj: z.string().regex(CNPJ_REGEX, 'CNPJ inválido'),
  regimeTributario: RegimeTributarioSchema,
  nfcPlatform: NfcPlatformSchema.optional(),
  paymentCredential: z.string().optional(),
  gatewayType: GatewayTypeSchema,
  gatewayCardMachineId: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

/**
 * Handles fridge creation (a two-step wizard: identificação/localização → fiscal/pagamento)
 * and editing of general attributes only. Fiscal/pagamento for an existing fridge is edited
 * separately via `FridgeFinancialFormDialog`, reachable from its own table action.
 */
export function FridgeFormDialog({
  open,
  onOpenChange,
  fridge,
  hideAdminField,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fridge?: FridgeResponseType
  /** Hide the admin-owner picker — for an ADMIN editing their own fridge, where reassigning ownership isn't their call. */
  hideAdminField?: boolean
}) {
  const isEdit = !!fridge
  const { data: admins } = useAdmins(undefined, { enabled: !hideAdminField })
  const createMutation = useCreateFridgeMutation()
  const updateMutation = useUpdateFridgeMutation()
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const isWizard = !isEdit
  const showStep1 = isEdit || step === 1
  const showStep2 = isWizard && step === 2

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: fridge?.name ?? '',
      location: fridge?.location ?? '',
      cep: fridge?.cep ?? '',
      lat: fridge ? String(fridge.lat) : '',
      lng: fridge ? String(fridge.lng) : '',
      serialNumber: fridge?.serialNumber ?? '',
      adminId: fridge?.adminId ?? '',
      cnpj: fridge?.cnpj ?? '',
      regimeTributario: fridge?.regimeTributario ?? 'MEI',
      nfcPlatform: fridge?.nfcPlatform ?? undefined,
      paymentCredential: '',
      gatewayType: fridge?.gatewayType ?? 'ABACATEPAY',
      gatewayCardMachineId: '',
    },
  })

  const gatewayType = form.watch('gatewayType')
  const lat = form.watch('lat')
  const lng = form.watch('lng')

  useEffect(() => {
    if (open) {
      form.reset({
        name: fridge?.name ?? '',
        location: fridge?.location ?? '',
        cep: fridge?.cep ?? '',
        lat: fridge ? String(fridge.lat) : '',
        lng: fridge ? String(fridge.lng) : '',
        serialNumber: fridge?.serialNumber ?? '',
        adminId: fridge?.adminId ?? '',
        cnpj: fridge?.cnpj ?? '',
        regimeTributario: fridge?.regimeTributario ?? 'MEI',
        nfcPlatform: fridge?.nfcPlatform ?? undefined,
        paymentCredential: '',
        gatewayType: fridge?.gatewayType ?? 'ABACATEPAY',
        gatewayCardMachineId: '',
      })
      setStep(1)
    }
  }, [open, fridge, form])

  async function handleNext() {
    const fields: (keyof FormValues)[] = ['name', 'location', 'cep', 'lat', 'lng', 'serialNumber']
    if (!hideAdminField) fields.push('adminId')
    const valid = await form.trigger(fields)
    if (!valid) return
    if (!hideAdminField && !form.getValues('adminId')) {
      form.setError('adminId', { message: 'Selecione um admin' })
      return
    }
    setStep(2)
  }

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length < 8) return

    setIsGeocoding(true)
    try {
      const result = await geocodeCep(cep)
      if (result) {
        form.setValue('lat', String(result.lat))
        form.setValue('lng', String(result.lng))
        setPickerOpen(true)
      }
    } finally {
      setIsGeocoding(false)
    }
  }

  async function onSubmit(values: FormValues) {
    const cep = values.cep
    const latNumber = Number(values.lat)
    const lngNumber = Number(values.lng)

    if (isEdit) {
      await updateMutation.mutateAsync({
        id: fridge.id,
        body: {
          name: values.name,
          location: values.location || null,
          cep,
          lat: latNumber,
          lng: lngNumber,
          serialNumber: hideAdminField ? undefined : values.serialNumber,
          adminId: hideAdminField ? undefined : values.adminId,
        },
      })
    } else {
      if (!values.adminId) return
      await createMutation.mutateAsync({
        name: values.name,
        location: values.location || undefined,
        cep,
        lat: latNumber,
        lng: lngNumber,
        serialNumber: values.serialNumber,
        adminId: values.adminId,
        cnpj: values.cnpj,
        regimeTributario: values.regimeTributario,
        nfcPlatform: values.nfcPlatform,
        paymentCredential: values.paymentCredential || undefined,
        gatewayType: values.gatewayType,
        gatewayCardMachineId:
          values.gatewayType === 'MERCADOPAGO'
            ? values.gatewayCardMachineId || undefined
            : undefined,
      })
    }
    onOpenChange(false)
  }

  const pending = createMutation.isPending || updateMutation.isPending
  const hasCoords = lat !== '' && lng !== '' && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar geladeira' : `Nova geladeira · Etapa ${step} de 2`}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Atualize a identificação e a localização desta geladeira.'
                : step === 1
                  ? 'Identificação, localização e admin responsável.'
                  : 'Dados fiscais, NFC-e e pagamento.'}
            </DialogDescription>
          </DialogHeader>

          {isWizard && (
            <div className="flex gap-1.5">
              <div className={cn('h-1 flex-1 rounded-full', step >= 1 ? 'bg-primary' : 'bg-muted')} />
              <div className={cn('h-1 flex-1 rounded-full', step >= 2 ? 'bg-primary' : 'bg-muted')} />
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={(e) => {
                if (isWizard && step === 1) {
                  e.preventDefault()
                  handleNext()
                  return
                }
                form.handleSubmit(onSubmit)(e)
              }}
              className="flex flex-col gap-4"
            >
              {showStep1 && (
                <>
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

                  {hideAdminField ? (
                    <>
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormInputField
                            label="CEP"
                            placeholder="01310-100"
                            required
                            {...field}
                            onChange={(e) => field.onChange(maskCep(e.target.value))}
                            onBlur={(e) => {
                              field.onBlur()
                              handleCepBlur(e.target.value)
                            }}
                          />
                        )}
                      />

                      <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                        <div className="text-sm">
                          {isGeocoding ? (
                            <span className="text-muted-foreground">Buscando localização…</span>
                          ) : hasCoords ? (
                            <span className="text-muted-foreground">
                              {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Informe o CEP para localizar no mapa</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={!hasCoords}
                          onClick={() => setPickerOpen(true)}
                        >
                          <MapPin className="size-3.5" />
                          Ajustar no mapa
                        </Button>
                      </div>
                      {(form.formState.errors.lat || form.formState.errors.lng) && (
                        <p className="text-xs text-destructive">Selecione a localização no mapa.</p>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormInputField
                            label="CEP"
                            placeholder="01310-100"
                            required
                            {...field}
                            onChange={(e) => field.onChange(maskCep(e.target.value))}
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lat"
                        render={({ field }) => (
                          <FormInputField label="Latitude" type="number" step="any" required {...field} />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lng"
                        render={({ field }) => (
                          <FormInputField label="Longitude" type="number" step="any" required {...field} />
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormInputField
                        label="Número de série"
                        placeholder="SN-001"
                        required
                        disabled={hideAdminField}
                        {...field}
                      />
                    )}
                  />
                  {hideAdminField && (
                    <p className="-mt-2 text-xs text-muted-foreground">
                      Apenas o master pode alterar o número de série.
                    </p>
                  )}

                  {!hideAdminField && (
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
                  )}
                </>
              )}

              {showStep2 && (
                <>
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
                          placeholder="ID do terminal Point Smart"
                          {...field}
                        />
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="paymentCredential"
                    render={({ field }) => (
                      <FormInputField
                        label="Credencial de pagamento (opcional)"
                        type="password"
                        placeholder="Token do gateway"
                        {...field}
                      />
                    )}
                  />
                </>
              )}

              <DialogFooter>
                {isWizard && step === 1 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Avançar
                  </Button>
                )}
                {isWizard && step === 2 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-11 rounded-full px-6 text-sm font-semibold"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={pending}
                      className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      {pending ? 'Salvando…' : 'Criar geladeira'}
                    </Button>
                  </>
                )}
                {!isWizard && (
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {pending ? 'Salvando…' : 'Salvar alterações'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {hideAdminField && (
        <LocationPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          lat={hasCoords ? Number(lat) : 0}
          lng={hasCoords ? Number(lng) : 0}
          onConfirm={(coords) => {
            form.setValue('lat', String(coords.lat))
            form.setValue('lng', String(coords.lng))
          }}
        />
      )}
    </>
  )
}
