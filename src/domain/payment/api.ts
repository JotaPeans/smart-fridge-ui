import { api, createWrapQuery } from '#/lib/api.ts'
import type { CheckoutItemType, CheckoutResponseType } from './types.ts'

export const checkout = async (fridgeId: string, items: CheckoutItemType[]) =>
  createWrapQuery(async () => {
    const { data } = await api.post<CheckoutResponseType>('/payment/checkout', {
      fridgeId,
      items,
    })
    return data
  }, 'checkout')
