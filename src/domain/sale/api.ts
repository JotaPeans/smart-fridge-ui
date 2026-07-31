import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type { SaleResponseType } from './types.ts'

export const listSales = async (page = 1, pageSize = 20) =>
  createWrapQuery(async () => {
    const { data } = await api.get<Paginated<SaleResponseType>>('/sale/list', {
      params: { page, pageSize },
    })
    return data
  }, 'list-sales')

export const getSale = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.get<SaleResponseType>(`/sale/${id}`)
    return data
  }, 'get-sale')
