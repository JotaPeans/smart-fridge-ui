import { z } from 'zod'

export const ProductResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.number(),
  stock: z.number(),
  active: z.boolean(),
  fridgeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ProductResponseType = z.infer<typeof ProductResponseSchema>
