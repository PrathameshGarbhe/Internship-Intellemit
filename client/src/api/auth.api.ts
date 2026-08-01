import axiosInstance from './axiosInstance'
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '@/types/auth.types'

type AuthData = AuthResponse['data']

export const registerAPI = async (
  data: RegisterCredentials
): Promise<AuthData> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/register', data)
  return res.data.data
}

export const loginAPI = async (
  data: LoginCredentials
): Promise<AuthData> => {
  const res = await axiosInstance.post<AuthResponse>('/auth/login', data)
  return res.data.data
}

export const logoutAPI = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout')
}