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

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Obrigatório').max(255),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Deve ser ≥ 0'),
  stock: z.coerce.number().int().min(0).optional(),
  fridgeId: z.string(),
})
export type CreateProductType = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal('')),
  price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
})
export type UpdateProductType = z.infer<typeof UpdateProductSchema>
