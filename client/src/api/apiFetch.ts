import { API_BASE_URL } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'

// Drop-in replacement for the native fetch() used across the dashboard,
// meetings, tasks, and analytics pages. Behaves exactly like fetch() —
// same signature, same Response object returned — but transparently
// refreshes the access token once and retries on a 401, instead of every
// page silently failing once the access token expires.
let refreshPromise: Promise<string> | null = null

const requestNewAccessToken = async (): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to refresh access token')
  }
  const data = await res.json()
  return data.data.accessToken as string
}

export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const token = useAuthStore.getState().token

  const withAuthHeader = (existing?: HeadersInit): HeadersInit => {
    const headers = new Headers(existing)
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  }

  const response = await fetch(input, {
    ...init,
    headers: withAuthHeader(init.headers),
  })

  if (response.status !== 401) {
    return response
  }

  // Don't try to refresh on the refresh/login/register endpoints themselves.
  const url = typeof input === 'string' ? input : input.toString()
  if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
    return response
  }

  try {
    if (!refreshPromise) {
      refreshPromise = requestNewAccessToken().finally(() => {
        refreshPromise = null
      })
    }
    const newToken = await refreshPromise
    useAuthStore.getState().setToken(newToken)

    const retryHeaders = new Headers(init.headers)
    retryHeaders.set('Authorization', `Bearer ${newToken}`)

    return await fetch(input, { ...init, headers: retryHeaders })
  } catch {
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return response
  }
}
