import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createFridge,
  deactivateFridge,
  getFridge,
  listFridges,
  openFridgeDoor,
  updateFridge,
} from './api.ts'
import type { CreateFridgeType, UpdateFridgeType } from './types.ts'

export const useFridges = (page = 1, pageSize = 20) =>
  useQuery({
    queryKey: ['fridges', page, pageSize],
    queryFn: async () => {
      const { data, error } = await listFridges(page, pageSize)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 15,
  })

export const useFridge = (id: string) =>
  useQuery({
    queryKey: ['fridge', id],
    queryFn: async () => {
      const { data, error } = await getFridge(id)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const useCreateFridgeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateFridgeType) => {
      const { data, error } = await createFridge(body)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridges'] })
      toast.success('Geladeira criada com sucesso')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}

export const useUpdateFridgeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateFridgeType }) => {
      const { data, error } = await updateFridge(id, body)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fridges'] })
      queryClient.invalidateQueries({ queryKey: ['fridge', variables.id] })
      toast.success('Geladeira atualizada')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}

export const useDeactivateFridgeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await deactivateFridge(id)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fridges'] })
      toast.success('Geladeira desativada')
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })
}

export const useOpenDoorMutation = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await openFridgeDoor(id)
      if (error) throw error
      return data
    },
    onSuccess: () => toast.success('Porta destravada'),
    onError: (error: { message: string }) => toast.error(error.message),
  })
