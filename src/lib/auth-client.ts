import { createAuthClient } from 'better-auth/react'
import { settings } from './constants.ts'

export const authClient = createAuthClient({
  baseURL: settings.API_URL,
  fetchOptions: { credentials: 'include' },
})
