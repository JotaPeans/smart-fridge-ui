import { api, createWrapQuery } from '#/lib/api.ts'
import type { UserResponseType } from './types.ts'

export const getMe = async () =>
  createWrapQuery(async () => {
    const { data } = await api.get<UserResponseType>('/user/me')
    return data
  }, 'get-me')
