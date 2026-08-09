import { api, createWrapQuery } from '#/lib/api.ts'
import type { CheckoutItemType, CheckoutResponseType, PaymentMethodType } from './types.ts'

export const checkout = async (
  fridgeId: string,
  paymentMethod: PaymentMethodType,
  items: CheckoutItemType[],
) =>
  createWrapQuery(async () => {
    const { data } = await api.post<CheckoutResponseType>('/payment/checkout', {
      fridgeId,
      paymentMethod,
      items,
    })
    return data
  }, 'checkout')
