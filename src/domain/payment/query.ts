import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { checkout } from './api.ts'
import type { CheckoutItemType, PaymentMethodType } from './types.ts'

export const useCheckoutMutation = () =>
  useMutation({
    mutationFn: async ({
      fridgeId,
      paymentMethod,
      items,
    }: {
      fridgeId: string
      paymentMethod: PaymentMethodType
      items: CheckoutItemType[]
    }) => {
      const { data, error } = await checkout(fridgeId, paymentMethod, items)
      if (error) throw error
      return data
    },
    onError: (error: { message: string; status?: number }) => {
      if (error.status === 409) {
        toast.error('Terminal ocupado no momento, tente novamente em alguns segundos')
        return
      }
      toast.error(error.message)
    },
  })
