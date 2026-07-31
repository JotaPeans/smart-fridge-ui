import axios from 'axios'
import { settings } from './constants.ts'

export const api = axios.create({
  baseURL: `${settings.API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export interface ResponseProps<T> {
  data: T | null
  error: { message: string; status?: number } | null
}

export async function createWrapQuery<T>(
  callback: () => Promise<T>,
  caller: string,
): Promise<ResponseProps<T>> {
  try {
    const data = await callback()
    return { data, error: null }
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const responseData = axios.isAxiosError(error) ? error.response?.data : undefined
    const message =
      typeof responseData === 'object' && responseData && 'error' in responseData
        ? String((responseData as { error: unknown }).error)
        : status === 401
          ? 'Sessão expirada, faça login novamente'
          : status === 403
            ? 'Sua conta está inativa'
            : ((error as Error).message ?? 'Algo deu errado')
    console.log(`~ ${caller} error:`, message)
    return { data: null, error: { message, status } }
  }
}
