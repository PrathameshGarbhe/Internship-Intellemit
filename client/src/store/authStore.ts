import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'host' | 'member' | 'viewer'
  avatar?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),

      setToken: (token) => set({ token }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'intellmeet-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)