import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Endpoints that should never trigger a refresh-and-retry (avoids infinite loops
// and refreshing on the auth flows themselves).
const REFRESH_EXEMPT_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

const requestNewAccessToken = async (): Promise<string> => {
  // The refresh token lives in an httpOnly cookie set by the backend, so
  // this call relies on withCredentials rather than sending a body.
  const res = await axios.post<{ data: { accessToken: string } }>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  )
  return res.data.data.accessToken
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    const isExempt = REFRESH_EXEMPT_PATHS.some((path) =>
      originalRequest?.url?.includes(path)
    )

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isExempt) {
      originalRequest._retry = true

      try {
        // Coalesce concurrent 401s into a single refresh call.
        if (!refreshPromise) {
          refreshPromise = requestNewAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newAccessToken = await refreshPromise

        useAuthStore.getState().setToken(newAccessToken)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh token is also invalid/expired — log the user out.
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
