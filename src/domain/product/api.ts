import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type { ProductResponseType } from './types.ts'

export const listProducts = async (fridgeId: string, page = 1, pageSize = 50) =>
  createWrapQuery(async () => {
    const { data } = await api.get<Paginated<ProductResponseType>>(
      `/product/list/${fridgeId}`,
      { params: { page, pageSize } },
    )
    return data
  }, 'list-products')

export const getProduct = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.get<ProductResponseType>(`/product/${id}`)
    return data
  }, 'get-product')
