import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  getPeakHours,
  getSale,
  getSalesByPeriod,
  getSalesVolume,
  getTopProducts,
  listSales,
} from './api.ts'
import { TERMINAL_SALE_STATUSES } from './types.ts'
import type { AnalyticsFilters } from './types.ts'

export const useSales = () =>
  useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await listSales()
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const useSalesList = (page: number, pageSize: number) =>
  useQuery({
    queryKey: ['sales', 'list', page, pageSize],
    queryFn: async () => {
      const { data, error } = await listSales(page, pageSize)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 10 * 60 * 1000

export function useSalePolling(id: string) {
  const startedAt = useRef(Date.now())
  const [timedOut, setTimedOut] = useState(false)

  const query = useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      const { data, error } = await getSale(id)
      if (error) throw error
      return data
    },
    refetchInterval: (q) => {
      const status = q.state.data?.status
      if (status && TERMINAL_SALE_STATUSES.includes(status)) return false
      if (timedOut) return false
      return POLL_INTERVAL_MS
    },
  })

  useEffect(() => {
    if (query.data && TERMINAL_SALE_STATUSES.includes(query.data.status)) return
    const remaining = POLL_TIMEOUT_MS - (Date.now() - startedAt.current)
    if (remaining <= 0) {
      setTimedOut(true)
      return
    }
    const timer = setTimeout(() => setTimedOut(true), remaining)
    return () => clearTimeout(timer)
  }, [query.data])

  return { ...query, timedOut }
}

export const useSalesByPeriod = (
  filters: AnalyticsFilters,
  groupBy: 'day' | 'month' | 'year',
) =>
  useQuery({
    queryKey: ['analytics', 'by-period', filters, groupBy],
    queryFn: async () => {
      const { data, error } = await getSalesByPeriod(filters, groupBy)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const useSalesVolume = (filters: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'volume', filters],
    queryFn: async () => {
      const { data, error } = await getSalesVolume(filters)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const useTopProducts = (filters: AnalyticsFilters, limit: number) =>
  useQuery({
    queryKey: ['analytics', 'top-products', filters, limit],
    queryFn: async () => {
      const { data, error } = await getTopProducts(filters, limit)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })

export const usePeakHours = (filters: AnalyticsFilters) =>
  useQuery({
    queryKey: ['analytics', 'peak-hours', filters],
    queryFn: async () => {
      const { data, error } = await getPeakHours(filters)
      if (error) throw error
      return data
    },
    staleTime: 1000 * 30,
  })
