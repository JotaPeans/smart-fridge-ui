import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type { CreateFridgeType, FridgeResponseType, UpdateFridgeType } from './types.ts'

export const listFridges = async (page = 1, pageSize = 50) =>
  createWrapQuery(async () => {
    const { data } = await api.get<Paginated<FridgeResponseType>>('/fridge/list', {
      params: { page, pageSize },
    })
    return data
  }, 'list-fridges')

export const getFridge = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.get<FridgeResponseType>(`/fridge/${id}`)
    return data
  }, 'get-fridge')

export const createFridge = async (body: CreateFridgeType) =>
  createWrapQuery(async () => {
    const { data } = await api.post<FridgeResponseType>('/fridge', body)
    return data
  }, 'create-fridge')

export const updateFridge = async (id: string, body: UpdateFridgeType) =>
  createWrapQuery(async () => {
    const { data } = await api.patch<FridgeResponseType>(`/fridge/${id}`, body)
    return data
  }, 'update-fridge')

export const deactivateFridge = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.delete<{ success: boolean }>(`/fridge/${id}`)
    return data
  }, 'deactivate-fridge')

export const openFridgeDoor = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.post<{ success: boolean }>(`/fridge/${id}/open-door`)
    return data
  }, 'open-fridge-door')
