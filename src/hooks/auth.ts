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
import { setAccessToken, clearAccessToken, isTokenPersistent } from '@/api/http'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useAuth } from '@/contexts/AuthContext'

// Types específicos para hooks (estendendo os da API)
export interface LoginCredentials extends LoginRequest {
  rememberMe?: boolean
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
      const { rememberMe = true, ...loginData } = credentials
      const result = await loginAPI.mutateAsync(loginData)

      // Armazenar token baseado na preferência do usuário
      setAccessToken(result.accessToken, rememberMe)

      // Atualizar contexto de autenticação
      authLogin(result.accessToken)

      return result
    },
    onSuccess: result => {
      // Usar apenas mensagem do backend
      showSuccessToast(result)

      // Invalidar cache para forçar nova busca dos dados
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Extrair role do token JWT para redirecionamento correto
      try {
        const tokenPayload = JSON.parse(atob(result.accessToken.split('.')[1]))
        // Tratar tanto string quanto array para roles
        const userRole = Array.isArray(tokenPayload.roles)
          ? tokenPayload.roles[0]
          : tokenPayload.roles || 'ALUNO'

        console.log('[useLogin] User role from token:', userRole)

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
          default: // ALUNO ou qualquer outra
            console.log('[useLogin] Redirecting to /dashboard/funcionario')
            navigate('/dashboard/funcionario')
            break
        }
      } catch (error) {
        console.error('[useLogin] Erro ao extrair role do token:', error)
        // Fallback para dashboard padrão
        navigate('/dashboard/funcionario')
      }
    },
    onError: (error: any) => {
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
  const { logout: authLogout } = useAuth()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      try {
        await logoutAPI.mutateAsync()
      } catch (error) {
        // Mesmo se der erro na API, limpar dados locais
        console.warn(
          '[useLogout] Erro na API, mas limpando dados locais:',
          error
        )
      }

      // Limpar token e cache
      clearAccessToken()
      queryClient.clear()

      // Atualizar contexto de autenticação
      authLogout()
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
      clearAccessToken()
      queryClient.clear()
      authLogout()
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
      const result = await refreshAPI.mutateAsync()

      // Manter preferência de persistência
      const persistent = isTokenPersistent()
      setAccessToken(result.accessToken, persistent)

      return result
    },
    onError: (error: any) => {
      console.error('[useRefreshToken] Erro:', error)
      clearAccessToken()
    },
  })
}
