import { useQuery } from '@tanstack/react-query'
import { getMe, listAdmins } from './api.ts'

export const useMe = () =>
  useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data, error } = await getMe()
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60,
    retry: false,
  })

export const useAdmins = (search?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['user', 'admins', search ?? ''],
    queryFn: async () => {
      const { data, error } = await listAdmins(1, 50, search)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  })
