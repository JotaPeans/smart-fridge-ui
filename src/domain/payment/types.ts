import { z } from 'zod'

export const CheckoutItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
})
export type CheckoutItemType = z.infer<typeof CheckoutItemSchema>

export const PaymentMethodSchema = z.enum(['pix', 'credito', 'debito'])
export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodType, string> = {
  pix: 'Pix',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
}

export const RedirectCheckoutResponseSchema = z.object({
  type: z.literal('redirect'),
  saleId: z.string(),
  externalId: z.string(),
  checkoutUrl: z.string(),
})

export const PixCheckoutResponseSchema = z.object({
  type: z.literal('pix'),
  saleId: z.string(),
  externalId: z.string(),
  pixCode: z.string(),
  qrCodeBase64: z.string(),
  expiresAt: z.string(),
})

export const TerminalCheckoutResponseSchema = z.object({
  type: z.literal('terminal'),
  saleId: z.string(),
  externalId: z.string(),
})

export const CheckoutResponseSchema = z.discriminatedUnion('type', [
  RedirectCheckoutResponseSchema,
  PixCheckoutResponseSchema,
  TerminalCheckoutResponseSchema,
])
export type CheckoutResponseType = z.infer<typeof CheckoutResponseSchema>
