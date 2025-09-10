import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (input: LoginInput & { rememberMe?: boolean }) => {
      const { rememberMe = true, ...loginData } = input // Padrão: sempre lembrar

      // Inclui credenciais para permitir cookie HttpOnly de refresh
      const data = await apiPost<LoginResponse>('/auth/v1/login', loginData, {
        credentials: 'include',
      })

      // Salvar token com opção de persistência
      setAccessToken(data.accessToken, rememberMe)

      return data
    },
    onSuccess: async () => {
      console.log('[Login] Login bem-sucedido, invalidando queries...')
      
      // Invalidar queries de autenticação para forçar revalidação
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })
      
      // Aguardar um pouco para as queries se atualizarem
      setTimeout(() => {
        console.log('[Login] Navegando para verificação de dashboard...')
        navigate('/dashboard/funcionario', { replace: true })
      }, 100)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (input: RegisterInput) => {
      return apiPost<RegisterResponse>('/auth/v1/register', input)
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: async (input: ResetPasswordInput) => {
      return apiPost<ResetPasswordResponse>('/auth/v1/reset-password', input)
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
          '/auth/v1/logout',
          {},
          { credentials: 'include', headers }
        )
      } catch (error) {
        // Mesmo se logout falhar no servidor, limpar sessão local
        console.warn(
          '[Logout] Falha no servidor, limpando sessão local:',
          error
        )
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
