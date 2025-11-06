import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPut, authDelete } from './http'
import { API_ENDPOINTS } from './config'

// Types alinhados com o schema do banco de dados
export interface Departamento {
  codigo: string
  nome: string
  descricao?: string | null
  gestor_funcionario_id?: string | null
  gestor_nome?: string | null
  gestor_email?: string | null
  criado_em: string
  atualizado_em: string
  total_funcionarios?: number
  total_categorias?: number
}

export interface DepartamentoCreate {
  codigo: string
  nome: string
  descricao?: string | null
  gestor_funcionario_id?: string | null
}

export interface DepartamentoUpdate {
  nome?: string
  descricao?: string | null
  gestor_funcionario_id?: string | null
}

export interface Cargo {
  codigo: string // PRIMARY KEY no schema
  nome: string
  criado_em: string
  atualizado_em: string
}

export interface CargoCreate {
  codigo: string // Requer codigo como PK
  nome: string
}

export interface CargoUpdate {
  nome?: string
}

// Schema do banco: funcionarios com role simplificado
export interface Funcionario {
  id: string
  cpf: string
  nome: string
  email: string
  departamento_id?: string | null // references departamentos(codigo)
  cargo_nome?: string | null // references cargos(nome) - não cargo_id!
  role: 'ADMIN' | 'INSTRUTOR' | 'GERENTE' | 'FUNCIONARIO' // Role simplificado
  xp_total: number
  nivel: string
  ativo: boolean
  inactivated_at?: string | null
  criado_em: string
  atualizado_em: string
}

export interface FuncionarioRegister {
  cpf?: string
  nome: string
  email: string
  departamento_id?: string | null
  cargo_nome?: string | null // Corrigido para cargo_nome
  role?: 'ADMIN' | 'INSTRUTOR' | 'GERENTE' | 'FUNCIONARIO' // Role opcional (default: FUNCIONARIO)
}

export interface UpdateRoleInput {
  role: 'ADMIN' | 'INSTRUTOR' | 'GERENTE' | 'FUNCIONARIO' // Atualizado
}

export interface UpdateFuncionarioInput {
  nome?: string
  email?: string
  departamento_id?: string
  cargo_nome?: string
  role?: 'ADMIN' | 'INSTRUTOR' | 'GERENTE' | 'FUNCIONARIO'
  ativo?: boolean
}

export interface ResetPasswordInput {
  email: string
}

export interface ResetPasswordResponse {
  sucesso: boolean
}

// Instructor Types
export interface Instructor {
  id: string
  funcionario_id: string
  nome: string
  email: string
  cpf?: string | null
  departamento_id?: string | null
  departamento_nome?: string | null
  cargo_nome?: string | null
  biografia?: string | null
  especialidades?: string[] | null
  avaliacao_media?: string | null // Vem como string da API
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface InstructorCreate {
  funcionario_id: string
  biografia?: string
  especialidades?: string[]
}

export interface InstructorUpdate {
  biografia?: string
  especialidades?: string[]
}

export interface DashboardInstrutor {
  tipo_dashboard: 'instrutor'
  metricas: {
    total_cursos: number
    total_alunos: number
    taxa_conclusao_geral: number
    avaliacao_media_geral: number
    pendentes_correcao: number
  }
  cursos: {
    codigo: string
    titulo: string
    inscritos: number
    concluidos: number
    taxa_conclusao: number
    avaliacao_media?: number
    status: string
    pendentes_correcao: number
  }[]
  atividades_recentes: any[]
}

export interface DashboardGerente {
  tipo_dashboard: 'gerente'
  metricas_gerais: {
    total_funcionarios: number
    funcionarios_ativos: number
    alunos_ativos?: number
    total_cursos: number
    taxa_conclusao_media: number
    inscricoes_30d?: number
  }
  engajamento_departamentos: {
    codigo: string
    nome: string
    total_funcionarios: number
    xp_medio: number
    funcionarios_ativos: number
  }[]
}

export interface DashboardAdmin {
  tipo_dashboard: 'administrador'
  metricas_gerais: {
    total_funcionarios: number
    funcionarios_ativos: number
    alunos_ativos: number
    total_instrutores: number
    total_cursos: number
    taxa_conclusao_media: number
    inscricoes_30d: number
  }
  engajamento_departamentos: {
    codigo: string
    nome: string
    total_funcionarios: number
    xp_medio: number
    funcionarios_ativos: number
  }[]
  cursos_populares: any[]
}

export type DashboardData =
  | DashboardInstrutor
  | DashboardGerente
  | DashboardAdmin

// Estrutura de resposta completa do endpoint /funcionarios/dashboard
export interface DashboardResponse {
  usuario: {
    id: string
    nome: string
    email: string
    departamento?: string
    cargo?: string
    nivel: string
    xp_total: number
    role: string
  }
  notificacoes_nao_lidas: number
  notificacoes: any[]
  dashboard: DashboardData
}

// Tipos adicionais para compatibilidade
export type UserRole = 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN' | 'GERENTE'

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
  tipo_usuario?: UserRole
  cargo_nome?: string
  xp_total?: number
  nivel?: string
}

// Hooks para Departamentos
export function useListarDepartamentos() {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departamentos'],
    queryFn: () =>
      authGet<Departamento[]>(`${API_ENDPOINTS.USERS}/departamentos`),
  })
}

export function useListarDepartamentosAdmin() {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departamentos', 'admin'],
    queryFn: () =>
      authGet<Departamento[]>(`${API_ENDPOINTS.USERS}/departamentos/admin`),
  })
}

export function useBuscarDepartamento(codigo: string) {
  return useQuery<Departamento>({
    queryKey: ['users', 'departamentos', codigo],
    queryFn: () =>
      authGet<Departamento>(`${API_ENDPOINTS.USERS}/departamentos/${codigo}`),
    enabled: !!codigo,
  })
}

export function useCriarDepartamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'departamentos', 'create'],
    mutationFn: (input: DepartamentoCreate) =>
      authPost<Departamento>(`${API_ENDPOINTS.USERS}/departamentos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] })
    },
  })
}

export function useAtualizarDepartamento(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'departamentos', 'update', codigo],
    mutationFn: (input: DepartamentoUpdate) =>
      authPut<Departamento>(
        `${API_ENDPOINTS.USERS}/departamentos/${codigo}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] })
    },
  })
}

export function useDeleteDepartamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'departamentos', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.USERS}/departamentos/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] })
    },
  })
}

// Hooks para Cargos
export function useListarCargos() {
  return useQuery<Cargo[]>({
    queryKey: ['users', 'cargos'],
    queryFn: () => authGet<Cargo[]>(`${API_ENDPOINTS.USERS}/cargos`),
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
    },
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
    },
  })
}

export function useExcluirCargo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'cargos', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.USERS}/cargos/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] })
    },
  })
}

// Resposta paginada para funcionários
export interface FuncionariosResponse {
  items: Funcionario[]
  mensagem: string
}

// Hooks para Funcionários
export function useRegisterFuncionario() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'register'],
    mutationFn: (input: FuncionarioRegister) =>
      authPost<Funcionario>(`${API_ENDPOINTS.USERS}/register`, input),
  })
}

export function useFuncionarios() {
  return useQuery<FuncionariosResponse>({
    queryKey: ['users', 'funcionarios'],
    queryFn: () =>
      authGet<FuncionariosResponse>(`${API_ENDPOINTS.USERS}/funcionarios`),
  })
}

export function useUpdateFuncionarioRole(funcionarioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'funcionarios', 'role', funcionarioId],
    mutationFn: (input: UpdateRoleInput) =>
      authPut<Funcionario>(
        `${API_ENDPOINTS.USERS}/funcionarios/${funcionarioId}/role`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
    },
  })
}

export function useUpdateFuncionario(funcionarioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['users', 'funcionarios', 'update', funcionarioId],
    mutationFn: (input: UpdateFuncionarioInput) =>
      authPut<Funcionario>(
        `${API_ENDPOINTS.USERS}/funcionarios/${funcionarioId}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'instrutores'] })
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'reset-password'],
    mutationFn: (input: ResetPasswordInput) =>
      authPost<ResetPasswordResponse>(
        `${API_ENDPOINTS.USERS}/reset-password`,
        input
      ),
  })
}

// Hook para Dashboard
export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['users', 'dashboard'],
    queryFn: () =>
      authGet<DashboardResponse>(
        `${API_ENDPOINTS.USERS}/funcionarios/dashboard`
      ),
  })
}

// Hook combinado para dashboard + perfil do usuário
export function useDashboardCompleto() {
  const dashboard = useDashboard()

  return {
    dashboard: dashboard.data?.dashboard,
    perfil: dashboard.data?.usuario,
    notificacoes: dashboard.data?.notificacoes,
    notificacoes_nao_lidas: dashboard.data?.notificacoes_nao_lidas,
    isLoading: dashboard.isLoading,
    error: dashboard.error,
    refetch: () => {
      dashboard.refetch()
    },
  }
}

// Hook para excluir funcionário
export function useExcluirFuncionario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'delete'],
    mutationFn: (funcionarioId: string) =>
      authDelete(`${API_ENDPOINTS.USERS}/funcionarios/${funcionarioId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
    },
  })
}

// ===============================================
// INSTRUCTORS API HOOKS
// ===============================================

// Hook para listar instrutores
export function useInstrutores() {
  return useQuery<Instructor[]>({
    queryKey: ['users', 'instrutores'],
    queryFn: () =>
      authGet<{ items: Instructor[] }>(
        `${API_ENDPOINTS.USERS}/instrutores`
      ).then(response => response.items),
  })
}

// Hook para buscar instrutor específico
export function useInstrutor(id: string) {
  return useQuery<Instructor>({
    queryKey: ['users', 'instrutores', id],
    queryFn: () =>
      authGet<{ instrutor: Instructor }>(
        `${API_ENDPOINTS.USERS}/instrutores/${id}`
      ).then(response => response.instrutor),
    enabled: !!id,
  })
}

// Hook para criar instrutor
export function useCreateInstrutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'instrutores', 'create'],
    mutationFn: (data: InstructorCreate) =>
      authPost<{ instrutor: Instructor; mensagem: string }>(
        `${API_ENDPOINTS.USERS}/instrutores`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'instrutores'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
    },
  })
}

// Hook para atualizar instrutor
export function useUpdateInstrutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'instrutores', 'update'],
    mutationFn: ({ id, data }: { id: string; data: InstructorUpdate }) =>
      authPut<{ instrutor: Instructor; mensagem: string }>(
        `${API_ENDPOINTS.USERS}/instrutores/${id}`,
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'instrutores'] })
      queryClient.invalidateQueries({
        queryKey: ['users', 'instrutores', variables.id],
      })
    },
  })
}

// Hook para remover instrutor
export function useDeleteInstrutor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'instrutores', 'delete'],
    mutationFn: (id: string) =>
      authDelete<{ mensagem: string }>(
        `${API_ENDPOINTS.USERS}/instrutores/${id}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'instrutores'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] })
    },
  })
}

// Hook para ativar/desativar instrutor
export function useToggleInstructorStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'instrutores', 'toggle-status'],
    mutationFn: (id: string) =>
      authPut<{ ativo: boolean; mensagem: string }>(
        `${API_ENDPOINTS.USERS}/instrutores/${id}/toggle-status`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'instrutores'] })
    },
  })
}
