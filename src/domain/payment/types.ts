import { z } from 'zod'

export const CheckoutItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
})
export type CheckoutItemType = z.infer<typeof CheckoutItemSchema>

export const CheckoutResponseSchema = z.object({
  saleId: z.string(),
  checkoutUrl: z.string(),
})
export type CheckoutResponseType = z.infer<typeof CheckoutResponseSchema>
