import { useQuery } from '@tanstack/react-query'
import { getProduct, listProducts } from './api.ts'

export const useProducts = (fridgeId: string) =>
  useQuery({
    queryKey: ['products', fridgeId],
    queryFn: async () => {
      const { data, error } = await listProducts(fridgeId)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await getProduct(id)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })
