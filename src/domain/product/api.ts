import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type { CreateProductType, ProductResponseType, UpdateProductType } from './types.ts'

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

export const createProduct = async (body: CreateProductType) =>
  createWrapQuery(async () => {
    const { data } = await api.post<ProductResponseType>('/product', body)
    return data
  }, 'create-product')

export const updateProduct = async (id: string, body: UpdateProductType) =>
  createWrapQuery(async () => {
    const { data } = await api.patch<ProductResponseType>(`/product/${id}`, body)
    return data
  }, 'update-product')

export const deactivateProduct = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.delete<{ success: boolean }>(`/product/${id}`)
    return data
  }, 'deactivate-product')
