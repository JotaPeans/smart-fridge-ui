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

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  AWAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pago',
  DOOR_OPEN: 'Porta aberta',
  DOOR_CLOSED: 'Porta fechada',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

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

export interface AnalyticsFilters {
  fridgeId?: string
  startDate?: string
  endDate?: string
}

export const ByPeriodEntrySchema = z.object({
  period: z.string(),
  count: z.number(),
  totalAmount: z.number(),
})
export type ByPeriodEntryType = z.infer<typeof ByPeriodEntrySchema>

export const VolumeSchema = z.object({
  count: z.number(),
  totalAmount: z.number(),
})
export type VolumeType = z.infer<typeof VolumeSchema>

export const TopProductSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantitySold: z.number(),
})
export type TopProductType = z.infer<typeof TopProductSchema>

export const PeakHourSchema = z.object({
  hour: z.number(),
  count: z.number(),
})
export type PeakHourType = z.infer<typeof PeakHourSchema>
