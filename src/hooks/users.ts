import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch, authPut, authDelete } from '@/api/http'
import { API_ENDPOINTS } from '@/api/config'

// Importar tipos do arquivo de API corrigido
import {
  Departamento,
  DepartamentoCreate,
  DepartamentoUpdate,
  Cargo,
  CargoCreate,
  CargoUpdate,
  Funcionario,
  FuncionarioRegister,
  UpdateRoleInput,
  ResetPasswordInput,
  ResetPasswordResponse
} from '@/api/users'

// Tipos para as 4 roles do sistema
export type UserRole = 'ALUNO' | 'INSTRUTOR' | 'ADMIN' | 'GERENTE';

export interface UsuarioResumo {
  id: string
  nome: string
  email: string
  departamento_id?: string
  cargo_nome?: string
  ativo: boolean
  xp_total?: number
  nivel?: string
}

export interface PerfilUsuario extends UsuarioResumo {
  auth_user_id?: string
  cpf?: string
  inactivated_at?: string | null
  criado_em?: string
  atualizado_em?: string
  tipo_usuario?: UserRole  // Adicionando o tipo de usuário
}

// Tipos para dashboard baseado em roles
export interface DashboardData {
  tipo_dashboard: 'aluno' | 'instrutor' | 'admin' | 'gerente'
  xp_atual?: number
  nivel_atual?: string
  xp_proximo_nivel?: number
  proximo_badge?: string
  progresso_nivel?: number
  ranking_departamento?: any
  cursos_em_andamento?: any[]
  cursos_concluidos?: any[]
  timeline?: any[]
  badges_conquistados?: any[]
  // Campos específicos para INSTRUTOR
  cursos_ministrados?: any[]
  estatisticas_conclusao?: any
  avaliacoes_pendentes?: any[]
  metricas_performance?: any
  // Campos específicos para ADMIN/GERENTE
  metricas_gerais?: any
  cursos_populares?: any[]
  engajamento_departamento?: any[]
  alertas_sistema?: any[]
}

// Departamentos usando hooks da API corrigida
export function useListarDepartamentos() {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departamentos'],
    queryFn: () => authGet<Departamento[]>(`${API_ENDPOINTS.USERS}/departamentos`)
  });
}

export function useCriarDepartamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'departamentos', 'create'],
    mutationFn: (input: DepartamentoCreate) =>
      authPost<Departamento>(`${API_ENDPOINTS.USERS}/departamentos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] })
    }
  })
}

export function useAtualizarDepartamento(codigo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'departamentos', 'update', codigo],
    mutationFn: (input: DepartamentoUpdate) =>
      authPut<Departamento>(`${API_ENDPOINTS.USERS}/departamentos/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] })
    }
  })
}

// Cargos usando hooks da API corrigida
export function useListarCargos() {
  return useQuery<Cargo[]>({
    queryKey: ['users', 'cargos'],
    queryFn: () => authGet<Cargo[]>(`${API_ENDPOINTS.USERS}/cargos`)
  })
}

export function useCriarCargo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'cargos', 'create'],
    mutationFn: (input: CargoCreate) =>
      authPost<Cargo>(`${API_ENDPOINTS.USERS}/cargos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] })
    }
  })
}

export function useAtualizarCargo(codigo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'cargos', 'update', codigo],
    mutationFn: (input: CargoUpdate) =>
      authPut<Cargo>(`${API_ENDPOINTS.USERS}/cargos/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] })
    }
  })
}

// Funcionários usando hooks da API corrigida
export function useRegisterFuncionario() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'register'],
    mutationFn: (input: FuncionarioRegister) =>
      authPost<Funcionario>(`${API_ENDPOINTS.USERS}/funcionarios/register`, input)
  })
}

export function useFuncionarios() {
  return useQuery<Funcionario[]>({
    queryKey: ['users', 'funcionarios'],
    queryFn: () => authGet<Funcionario[]>(`${API_ENDPOINTS.USERS}/funcionarios`)
  })
}

export function useUpdateFuncionarioRole(funcionarioId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'role', funcionarioId],
    mutationFn: (input: UpdateRoleInput) =>
      authPut<Funcionario>(`${API_ENDPOINTS.USERS}/funcionarios/${funcionarioId}/role`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
    }
  })
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'reset-password'],
    mutationFn: (input: ResetPasswordInput) =>
      authPost<ResetPasswordResponse>(`${API_ENDPOINTS.USERS}/funcionarios/reset-password`, input)
  })
}

// Perfil do usuário autenticado
export function useMeuPerfil() {
  return useQuery<PerfilUsuario>({
    queryKey: ['users', 'me'],
    queryFn: () => authGet<PerfilUsuario>(`${API_ENDPOINTS.USERS}/me`),
  })
}

// Dashboard baseado na role do usuário
export function useDashboard(departamento_id?: string) {
  return useQuery<{ dashboard_data: DashboardData }>({
    queryKey: ['users', 'dashboard', departamento_id],
    queryFn: () => {
      const params = new URLSearchParams()
      if (departamento_id) {
        params.append('departamento_id', departamento_id)
      }
      const url = `${API_ENDPOINTS.USERS}/dashboard${params.toString() ? `?${params.toString()}` : ''}`
      return authGet<{ dashboard_data: DashboardData }>(url)
    },
    staleTime: 0,
    retry: false,
  })
}

// Hook combinado para dashboard + perfil do usuário
export function useDashboardCompleto(departamento_id?: string) {
  const dashboard = useDashboard(departamento_id)
  const perfil = useMeuPerfil()

  return {
    dashboard: dashboard.data,
    perfil: perfil.data,
    isLoading: dashboard.isLoading || perfil.isLoading,
    error: dashboard.error || perfil.error,
    refetch: () => {
      dashboard.refetch()
      perfil.refetch()
    },
  }
}
