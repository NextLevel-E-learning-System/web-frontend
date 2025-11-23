import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  useLogin as useLoginAPI,
  useLogout as useLogoutAPI,
  useRefreshToken as useRefreshTokenAPI,
  type LoginRequest
} from '@/api/auth'
import {
  useRegisterFuncionario,
  useResetPassword as useResetPasswordAPI,
  type ResetPasswordInput
} from '@/api/users'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { useAuth, type UserRole } from '@/contexts/AuthContext'

// Types
type LoginCredentials = LoginRequest

export interface RegisterData {
  cpf?: string
  nome: string
  email: string
  departamento_id?: string | null
  cargo_nome?: string | null
}

// Mapeamento de roles para rotas
const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  GERENTE: '/dashboard/admin',
  INSTRUTOR: '/dashboard/instrutor',
  FUNCIONARIO: '/dashboard/funcionario'
}

const getRouteByRole = (role: string): string =>
  ROLE_ROUTES[role] || '/dashboard/funcionario'

// Hook para login
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginAPI = useLoginAPI()
  const { login: authLogin } = useAuth()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginCredentials) =>
      loginAPI.mutateAsync(credentials),
    onSuccess: (result) => {
      const { usuario } = result

      // Atualizar contexto com dados do usuário
      authLogin({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: (usuario.role as UserRole) || 'FUNCIONARIO',
        departamento_id: usuario.departamento,
        cargo_nome: usuario.cargo,
        xp_total: usuario.xp,
        nivel: usuario.nivel
      })

      showSuccessToast(result)
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Redirecionar baseado na role
      const route = getRouteByRole(usuario.role)
      console.log(`[useLogin] Redirecting ${usuario.role} to ${route}`)
      navigate(route)
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Erro:', error)
      showErrorToast(error)
    }
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
        console.warn('[useLogout] Erro na API, mas limpando cache:', error)
      }

      // Limpar contexto de autenticação (inclui localStorage)
      authLogout()
      queryClient.clear()
    },
    onSuccess: (result) => {
      showSuccessToast(result)
      navigate('/login')
    },
    onError: (error: unknown) => {
      console.error('[useLogout] Erro:', error)
      showErrorToast(error)

      // Limpar mesmo em caso de erro
      authLogout()
      queryClient.clear()
      navigate('/login')
    }
  })
}

// Hook para registro
export function useRegister() {
  const registerAPI = useRegisterFuncionario()

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: (data: RegisterData) => registerAPI.mutateAsync(data),
    onSuccess: (result) => showSuccessToast(result),
    onError: (error: unknown) => {
      console.error('[useRegister] Erro:', error)
      showErrorToast(error)
    }
  })
}

// Hook para reset de senha
export function useResetPassword() {
  const resetAPI = useResetPasswordAPI()

  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: (data: ResetPasswordInput) => resetAPI.mutateAsync(data),
    onSuccess: (result) => {
      showSuccessToast(result)
    },
    onError: (error: unknown) => {
      console.error('[useResetPassword] Erro:', error)
      showErrorToast(error)
    }
  })
}

// Hook para refresh token
export function useRefreshToken() {
  const refreshAPI = useRefreshTokenAPI()

  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: () => refreshAPI.mutateAsync(),
    onError: (error: unknown) => {
      console.error('[useRefreshToken] Erro:', error)
    }
  })
}
