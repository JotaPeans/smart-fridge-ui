import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { checkout } from './api.ts'
import type { CheckoutItemType } from './types.ts'

export const useCheckoutMutation = () =>
  useMutation({
    mutationFn: async ({ fridgeId, items }: { fridgeId: string; items: CheckoutItemType[] }) => {
      const { data, error } = await checkout(fridgeId, items)
      if (error) throw error
      return data
    },
    onError: (error: { message: string }) => {
      toast.error(error.message)
    },
  })
