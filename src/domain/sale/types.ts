import { z } from 'zod'

export const SaleStatusSchema = z.enum([
  'AWAITING_PAYMENT',
  'PAID',
  'DOOR_OPEN',
  'DOOR_CLOSED',
  'COMPLETED',
  'CANCELLED',
])
export type SaleStatus = z.infer<typeof SaleStatusSchema>

export const SaleItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  saleId: z.string(),
  productId: z.string(),
})

export const SaleResponseSchema = z.object({
  id: z.string(),
  status: SaleStatusSchema,
  startedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  totalAmount: z.number(),
  paymentExternalId: z.string().nullable(),
  fileKey: z.string().nullable(),
  userId: z.string(),
  fridgeId: z.string(),
  items: z.array(SaleItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type SaleResponseType = z.infer<typeof SaleResponseSchema>

export const TERMINAL_SALE_STATUSES: SaleStatus[] = ['COMPLETED', 'CANCELLED']
