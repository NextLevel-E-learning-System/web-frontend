import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiPost, setAccessToken, clearAccessToken } from '@/api/http'
import { API_ENDPOINTS } from '@/api/config'
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '../types/auth'

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (input: LoginInput & { rememberMe?: boolean }) => {
      const { rememberMe = true, ...loginData } = input // Padrão: sempre lembrar

      // Inclui credenciais para permitir cookie HttpOnly de refresh
      const data = await apiPost<LoginResponse>(`${API_ENDPOINTS.AUTH}/login`, loginData, {
        credentials: 'include',
      })

      // Salvar token com opção de persistência
      setAccessToken(data.accessToken, rememberMe)

      return data
    },
    onSuccess: async () => {
      // Invalidar queries de autenticação para forçar revalidação
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })

      // Aguardar um pouco para as queries se atualizarem
      setTimeout(() => {
        navigate('/dashboard/funcionario', { replace: true })
      }, 100)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (input: RegisterInput) => {
      return apiPost<RegisterResponse>(`${API_ENDPOINTS.AUTH}/register`, input)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: async (input: ResetPasswordInput) => {
      return apiPost<ResetPasswordResponse>(`${API_ENDPOINTS.AUTH}/reset-password`, input)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation<boolean, Error, boolean | undefined>({
    mutationKey: ['auth', 'logout'],
    mutationFn: async invalidateAll => {
      const headers: Record<string, string> = {}
      if (invalidateAll) headers['x-invalidate-all'] = 'true'

      try {
        await apiPost<{ sucesso: boolean }>(
          `${API_ENDPOINTS.AUTH}/logout`,
          {},
          { credentials: 'include', headers }
        )
      } catch (error) {
        // Mesmo se logout falhar no servidor, limpar sessão local
      }

      return true
    },
    onSettled: () => {
      // IMPORTANTE: Limpar TUDO da sessão persistente
      clearAccessToken() // Remove do localStorage
      queryClient.clear() // Limpa cache React Query

      navigate('/login', { replace: true })
    },
  })
}
