import { api, createWrapQuery } from '#/lib/api.ts'
import type { Paginated } from '#/lib/pagination.ts'
import type {
  AnalyticsFilters,
  ByPeriodEntryType,
  PeakHourType,
  SaleResponseType,
  TopProductType,
  VolumeType,
} from './types.ts'

export const listSales = async (page = 1, pageSize = 20) =>
  createWrapQuery(async () => {
    const { data } = await api.get<Paginated<SaleResponseType>>('/sale/list', {
      params: { page, pageSize },
    })
    return data
  }, 'list-sales')

export const getSale = async (id: string) =>
  createWrapQuery(async () => {
    const { data } = await api.get<SaleResponseType>(`/sale/${id}`)
    return data
  }, 'get-sale')

export const getSalesByPeriod = async (
  filters: AnalyticsFilters,
  groupBy: 'day' | 'month' | 'year' = 'day',
) =>
  createWrapQuery(async () => {
    const { data } = await api.get<ByPeriodEntryType[]>('/sale/analytics/by-period', {
      params: { ...filters, groupBy },
    })
    return data
  }, 'sales-by-period')

export const getSalesVolume = async (filters: AnalyticsFilters) =>
  createWrapQuery(async () => {
    const { data } = await api.get<VolumeType>('/sale/analytics/volume', { params: filters })
    return data
  }, 'sales-volume')

export const getTopProducts = async (filters: AnalyticsFilters, limit = 5) =>
  createWrapQuery(async () => {
    const { data } = await api.get<TopProductType[]>('/sale/analytics/top-products', {
      params: { ...filters, limit },
    })
    return data
  }, 'top-products')

export const getPeakHours = async (filters: AnalyticsFilters) =>
  createWrapQuery(async () => {
    const { data } = await api.get<PeakHourType[]>('/sale/analytics/peak-hours', {
      params: filters,
    })
    return data
  }, 'peak-hours')
