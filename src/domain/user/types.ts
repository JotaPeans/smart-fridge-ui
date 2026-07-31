import { z } from 'zod'

export const RoleSchema = z.enum(['MASTER', 'ADMIN', 'USER'])
export type Role = z.infer<typeof RoleSchema>

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  cpf: z.string().nullable(),
  role: RoleSchema,
  active: z.boolean(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type UserResponseType = z.infer<typeof UserResponseSchema>
