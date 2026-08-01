import { z } from 'zod'

export const FridgeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().nullable(),
  deviceId: z.string(),
  active: z.boolean(),
  adminId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type FridgeResponseType = z.infer<typeof FridgeResponseSchema>

export const CreateFridgeSchema = z.object({
  name: z.string().min(1, 'Obrigatório').max(255),
  location: z.string().max(255).optional(),
  deviceId: z.string().min(1, 'Obrigatório'),
  adminId: z.string().min(1, 'Selecione um admin'),
  paymentCredential: z.string().optional(),
})
export type CreateFridgeType = z.infer<typeof CreateFridgeSchema>

export const UpdateFridgeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  location: z.string().max(255).nullable().optional(),
  deviceId: z.string().min(1).optional(),
  adminId: z.string().min(1).optional(),
  paymentCredential: z.string().nullable().optional(),
})
export type UpdateFridgeType = z.infer<typeof UpdateFridgeSchema>
