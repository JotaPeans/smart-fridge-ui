import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type { UserResponseType } from './types.ts'

export const getMe = async () =>
  createWrapQuery(async () => {
    const { data } = await api.get<UserResponseType>('/user/me')
    return data
  }, 'get-me')

export const listAdmins = async (page = 1, pageSize = 50, search?: string) =>
  createWrapQuery(async () => {
    const { data } = await api.get<Paginated<UserResponseType>>('/user/admins', {
      params: { page, pageSize, search: search || undefined },
    })
    return data
  }, 'list-admins')
