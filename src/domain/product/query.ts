import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createProduct, deactivateProduct, getProduct, listProducts, updateProduct } from './api.ts'
import type { CreateProductType, UpdateProductType } from './types.ts'

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

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateProductType) => {
      const { data, error } = await createProduct(body)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', data?.fridgeId] })
      toast.success('Produto criado')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      fridgeId,
      body,
    }: {
      id: string
      fridgeId: string
      body: UpdateProductType
    }) => {
      const { data, error } = await updateProduct(id, body)
      if (error) throw error
      return { data, fridgeId }
    },
    onSuccess: ({ fridgeId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', fridgeId] })
      toast.success('Produto atualizado')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}

export const useDeactivateProductMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, fridgeId }: { id: string; fridgeId: string }) => {
      const { error } = await deactivateProduct(id)
      if (error) throw error
      return { fridgeId }
    },
    onSuccess: ({ fridgeId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', fridgeId] })
      toast.success('Produto desativado')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}
