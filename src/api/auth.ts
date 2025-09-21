import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, authPost, setAccessToken, clearAccessToken } from './http'
import { API_ENDPOINTS } from './config'

// Types
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresInHours: number
}

export interface LogoutResponse {
  sucesso: boolean
}

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginRequest) =>
      apiPost<LoginResponse>(`${API_ENDPOINTS.AUTH}/login`, credentials),
    onSuccess: (data: LoginResponse) => {
      // Store token using http utility
      setAccessToken(data.accessToken)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: () =>
      authPost<LogoutResponse>(`${API_ENDPOINTS.AUTH}/logout`, {}),
    onSuccess: () => {
      // Clear token and invalidate all queries
      clearAccessToken()
      queryClient.clear()
    },
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: () =>
      apiPost<LoginResponse>(`${API_ENDPOINTS.AUTH}/refresh`, {}),
    onSuccess: (data: LoginResponse) => {
      // Update token using http utility
      setAccessToken(data.accessToken)
    },
  })
}
