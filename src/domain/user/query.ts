import { useQuery } from '@tanstack/react-query'
import { getMe } from './api.ts'

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
