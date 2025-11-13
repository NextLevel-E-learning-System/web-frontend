import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  useLogin as useLoginAPI,
  useLogout as useLogoutAPI,
  useRefreshToken as useRefreshTokenAPI,
  type LoginRequest,
} from '@/api/auth'
import {
  useRegisterFuncionario,
  useResetPassword as useResetPasswordAPI,
  type ResetPasswordInput,
} from '@/api/users'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useAuth, type UserRole } from '@/contexts/AuthContext'

// Types específicos para hooks (estendendo os da API)
export interface LoginCredentials extends LoginRequest {
  rememberMe?: boolean // Não usado mais, mas mantido para compatibilidade
}

export interface RegisterData {
  cpf?: string
  nome: string
  email: string
  departamento_id?: string | null
  cargo_nome?: string | null
}

// Hook para login
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginAPI = useLoginAPI()
  const { login: authLogin } = useAuth()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (credentials: LoginCredentials) => {
      const { ...loginData } = credentials
      return await loginAPI.mutateAsync(loginData)
    },
    onSuccess: result => {
      // Usar apenas mensagem do backend
      showSuccessToast(result)

      // Atualizar contexto de autenticação com dados completos do usuário
      authLogin({
        id: result.usuario.id,
        email: result.usuario.email,
        nome: result.usuario.nome,
        role: (result.usuario.role as UserRole) || 'FUNCIONARIO',
        departamento_id: result.usuario.departamento,
        cargo_nome: result.usuario.cargo,
      })

      // Invalidar cache para forçar nova busca dos dados
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Extrair role do usuário retornado
      const userRole = result.usuario.role || 'FUNCIONARIO'
      console.log('[useLogin] User role:', userRole)

      // Redirecionar baseado na role
      switch (userRole) {
        case 'ADMIN':
        case 'GERENTE':
          console.log('[useLogin] Redirecting to /dashboard/admin')
          navigate('/dashboard/admin')
          break
        case 'INSTRUTOR':
          console.log('[useLogin] Redirecting to /dashboard/instrutor')
          navigate('/dashboard/instrutor')
          break
        default: // FUNCIONARIO ou qualquer outra
          console.log('[useLogin] Redirecting to /dashboard/funcionario')
          navigate('/dashboard/funcionario')
          break
      }
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Erro:', error)
      showErrorToast(error)
    },
  })
}

// Hook para logout
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutAPI = useLogoutAPI()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      try {
        await logoutAPI.mutateAsync()
      } catch (error) {
        // Mesmo se der erro na API, limpar cache local
        console.warn('[useLogout] Erro na API, mas limpando cache:', error)
      }

      // Limpar cache
      queryClient.clear()
    },
    onSuccess: (result: any) => {
      // Usar apenas mensagem do backend
      showSuccessToast(result)
      navigate('/login')
    },
    onError: (error: any) => {
      console.error('[useLogout] Erro:', error)
      showErrorToast(error)

      // Mesmo com erro, fazer logout local
      queryClient.clear()
      navigate('/login')
    },
  })
}

// Hook para registro
export function useRegister() {
  const registerAPI = useRegisterFuncionario()

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (data: RegisterData) => {
      return await registerAPI.mutateAsync(data)
    },
    onSuccess: (result: any) => {
      // Usar apenas mensagem do backend
      showSuccessToast(result)
    },
    onError: (error: any) => {
      console.error('[useRegister] Erro:', error)
      showErrorToast(error)
    },
  })
}

// Hook para reset de senha
export function useResetPassword() {
  const resetAPI = useResetPasswordAPI()

  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: async (data: ResetPasswordInput) => {
      return await resetAPI.mutateAsync(data)
    },
    onSuccess: (result: any) => {
      // Usar apenas mensagem do backend
      showSuccessToast(result)
    },
    onError: (error: any) => {
      console.error('[useResetPassword] Erro:', error)
      showErrorToast(error)
    },
  })
}

// Hook para refresh token
export function useRefreshToken() {
  const refreshAPI = useRefreshTokenAPI()

  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: async () => {
      return await refreshAPI.mutateAsync()
    },
    onError: (error: any) => {
      console.error('[useRefreshToken] Erro:', error)
      // Erro será tratado pelo interceptor HTTP
    },
  })
}
