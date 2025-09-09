import { useMutation } from '@tanstack/react-query'
import { apiPost, setAccessToken, clearAccessToken } from '@/api/http'
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '../types/auth'

export function useLogin() {
  return useMutation({
    mutationKey: ['auth','login'],
    mutationFn: async (input: LoginInput) => {
  // Inclui credenciais para permitir cookie HttpOnly de refresh
  const data = await apiPost<LoginResponse>('/auth/v1/login', input, { credentials: 'include' })
  setAccessToken(data.accessToken)
  return data
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationKey: ['auth','register'],
    mutationFn: async (input: RegisterInput) => {
      return apiPost<RegisterResponse>('/auth/v1/register', input)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['auth','reset-password'],
    mutationFn: async (input: ResetPasswordInput) => {
      return apiPost<ResetPasswordResponse>('/auth/v1/reset-password', input)
    },
  })
}

export function useLogout() {
  return useMutation<boolean, Error, boolean | undefined>({
    mutationKey: ['auth','logout'],
    mutationFn: async (invalidateAll) => {
      const headers: Record<string,string> = {}
      if (invalidateAll) headers['x-invalidate-all'] = 'true'
      await apiPost<{ sucesso: boolean }>(
        '/auth/v1/logout',
        {},
        { credentials: 'include', headers }
      )
      clearAccessToken()
      return true
    },
  })
}
