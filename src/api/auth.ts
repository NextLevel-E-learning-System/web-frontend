import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost } from './http'
import { API_ENDPOINTS } from './config'

// Types
export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  usuario: {
    id: string
    email: string
    nome: string
    role: string
  }
  mensagem: string
}

export interface LogoutResponse {
  mensagem: string
}

export interface RefreshResponse {
  mensagem: string
}

// Auth Hooks
export function useLogin() {
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginRequest) =>
      apiPost<LoginResponse>(`${API_ENDPOINTS.AUTH}/login`, credentials),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: () =>
      apiPost<LogoutResponse>(`${API_ENDPOINTS.AUTH}/logout`, {}),
    onSuccess: () => {
      // Invalidar todas as queries
      queryClient.clear()
    },
  })
}

export function useRefreshToken() {
  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: () =>
      apiPost<RefreshResponse>(`${API_ENDPOINTS.AUTH}/refresh`, {}),
  })
}
