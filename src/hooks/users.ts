import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// Tipos básicos (poderão ser refinados depois com schemas reais)
export interface Departamento {
  codigo: string
  nome: string
  descricao?: string
  gestor_id?: string
}

export interface UsuarioResumo {
  id: string
  nome: string
  email: string
  departamento_id?: string
  cargo?: string
  status?: 'ATIVO' | 'INATIVO'
  tipo_usuario?: 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN'
}

export interface PaginacaoUsuarios {
  items: UsuarioResumo[]
  total?: number
}

export interface PerfilUsuario extends UsuarioResumo {
  cpf?: string
  xp_total?: number
  nivel?: string
  biografia?: string // Para instrutores
  cursos_id?: string[] // Para instrutores
  data_criacao?: string
  ultimo_login?: string
}

// Interface específica para completar cadastro inicial
export interface CompletarCadastro {
  nome: string
  cpf: string // Exatamente 11 dígitos
  departamento_id: string
  cargo: string
  email?: string
}

// Interface para atualização administrativa (ADMIN pode alterar todos os campos)
export interface AtualizacaoAdmin {
  nome?: string
  cpf?: string // 11 dígitos
  email?: string
  departamento_id?: string
  cargo?: string
  status?: 'ATIVO' | 'INATIVO'
  tipo_usuario?: 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN'
  biografia?: string // Para quando promover para INSTRUTOR
  cursos_id?: string[] // Para quando promover para INSTRUTOR
}

// Interface para atualização de biografia (instrutor)
export interface AtualizacaoBiografia {
  biografia: string
}

// Departamentos
export function useListarDepartamentos(filtro?: {
  codigo?: string
  gestor_id?: string
}) {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departments', filtro],
    queryFn: () => {
      const params = new URLSearchParams()
      if (filtro) {
        Object.entries(filtro).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '')
            params.append(k, String(v))
        })
      }
      const qs = params.toString()
      const url = `/users/v1/departments${qs ? `?${qs}` : ''}`
      return authGet<Departamento[]>(url)
    },
  })
}

export function useCriarDepartamento() {
  const queryClient = useQueryClient()

  return useMutation<
    Departamento,
    Error,
    { codigo: string; nome: string; descricao?: string; gestor_id?: string }
  >({
    mutationKey: ['users', 'departments', 'create'],
    mutationFn: input => authPost<Departamento>('/users/v1/departments', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departments'] })
    },
  })
}

export function useAtualizarDepartamento(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation<
    Departamento,
    Error,
    Partial<Pick<Departamento, 'nome' | 'descricao' | 'gestor_id'>>
  >({
    mutationKey: ['users', 'departments', 'update', codigo],
    mutationFn: input =>
      authPatch<Departamento>(`/users/v1/departments/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departments'] })
    },
  })
}

// Perfil do usuário autenticado
export function useMeuPerfil() {
  return useQuery<PerfilUsuario>({
    queryKey: ['users', 'me'],
    queryFn: () => authGet<PerfilUsuario>('/users/v1/me'),
  })
}

export function useAtualizarMeuPerfil() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean },
    Error,
    Partial<PerfilUsuario> & { userId: string }
  >({
    mutationKey: ['users', 'me', 'update'],
    mutationFn: ({ userId, ...input }) =>
      authPatch<{ success: boolean }>(`/users/v1/${userId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({
        queryKey: ['users', 'byId', variables.userId],
      })
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

// Função específica para completar cadastro inicial
export function useCompletarCadastro() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean },
    Error,
    CompletarCadastro & { userId: string }
  >({
    mutationKey: ['users', 'complete-registration'],
    mutationFn: ({ userId, ...input }) =>
      authPatch<{ success: boolean }>(`/users/v1/${userId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({
        queryKey: ['users', 'byId', variables.userId],
      })
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })
    },
  })
}

// Função específica para atualizações administrativas
export function useAtualizacaoAdministrativa(id: string) {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, AtualizacaoAdmin>({
    mutationKey: ['users', 'admin-update', id],
    mutationFn: input =>
      authPatch<{ success: boolean }>(`/users/v1/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'byId', id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      const currentUser = queryClient.getQueryData(['users', 'me']) as
        | PerfilUsuario
        | undefined
      if (currentUser && id === currentUser.id) {
        queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
        queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })
      }
    },
  })
}

// Função específica para instrutor atualizar biografia
export function useAtualizarBiografia() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean },
    Error,
    AtualizacaoBiografia & { userId: string }
  >({
    mutationKey: ['users', 'update-bio'],
    mutationFn: ({ userId, ...input }) =>
      authPatch<{ success: boolean }>(`/users/v1/${userId}`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      queryClient.invalidateQueries({
        queryKey: ['users', 'byId', variables.userId],
      })
    },
  })
}

// Função específica para promover funcionário para instrutor (ADMIN)
export function usePromoverParaInstrutor(id: string) {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean },
    Error,
    { biografia?: string; cursos_id?: string[] }
  >({
    mutationKey: ['users', 'promote-instructor', id],
    mutationFn: input =>
      authPatch<{ success: boolean }>(`/users/v1/${id}`, {
        tipo_usuario: 'INSTRUTOR',
        ...input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'byId', id] })
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

// Listagem e criação de usuários (completa cadastro)
export interface ListarUsuariosFiltro {
  status?: 'ATIVO' | 'INATIVO'
  departamento_id?: string
  tipo_usuario?: 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN'
  search?: string
  limit?: number
  offset?: number
}

export function useListarUsuarios(filtro: ListarUsuariosFiltro = {}) {
  return useQuery<PaginacaoUsuarios>({
    queryKey: ['users', 'list', filtro],
    queryFn: () => {
      const params = new URLSearchParams()
      Object.entries(filtro).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
          params.append(k, String(v))
      })
      const qs = params.toString()
      const url = `/users/v1${qs ? `?${qs}` : ''}`
      return authGet<PaginacaoUsuarios>(url)
    },
  })
}

// Função de conveniência para listar apenas instrutores
export function useListarInstrutores(
  filtro: Omit<ListarUsuariosFiltro, 'tipo_usuario'> = {}
) {
  return useListarUsuarios({ ...filtro, tipo_usuario: 'INSTRUTOR' })
}

// Operações por usuário

/**
 * Sistema de permissões para atualização de usuários:
 *
 * 🔑 ADMIN: Pode alterar todos os campos incluindo:
 *   - Dados básicos: nome, cpf, email, departamento_id, cargo
 *   - Status: ATIVO/INATIVO
 *   - Tipo: FUNCIONARIO/INSTRUTOR/ADMIN
 *   - Promover para INSTRUTOR (com biografia e cursos_id opcionais)
 *
 * 👨‍🏫 INSTRUTOR: Pode alterar apenas:
 *   - Sua própria biografia
 *
 * 👤 FUNCIONARIO:
 *   - Não pode alterar nenhum campo (bloqueado)
 */

export function useObterUsuario(id: string) {
  return useQuery<PerfilUsuario>({
    queryKey: ['users', 'byId', id],
    queryFn: () => authGet<PerfilUsuario>(`/users/v1/${id}`),
    enabled: Boolean(id),
  })
}

export function useAtualizarUsuario(id: string) {
  return useMutation<{ success: boolean }, Error, Partial<PerfilUsuario>>({
    mutationKey: ['users', 'update', id],
    mutationFn: input =>
      authPatch<{ success: boolean }>(`/users/v1/${id}`, input),
  })
}

// Conquistas do usuário
export interface ConquistaUsuario {
  id: string
  nome: string
  descricao: string
  data_obtencao: string
  tipo: string
  xp_ganho?: number
  badge_id?: string
}

export interface HistoricoConquistas {
  conquistas: ConquistaUsuario[]
  badges_conquistados: any[]
  xp_total: number
  nivel_atual: number
}

export function useConquistasUsuario(id: string) {
  return useQuery<HistoricoConquistas>({
    queryKey: ['users', 'achievements', id],
    queryFn: () => authGet<HistoricoConquistas>(`/users/v1/${id}/achievements`),
    enabled: Boolean(id),
  })
}

// Dashboards

export type DashboardTipo = 'funcionario' | 'instrutor' | 'administrador'

export interface DashboardData {
  tipo_dashboard: DashboardTipo
  xp_atual?: number
  nivel_atual?: number
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
  // Campos específicos para ADMIN
  metricas_gerais?: any
  cursos_populares?: any[]
  engajamento_departamento?: any
  alertas_sistema?: any[]
}

export interface DashboardBase {
  // Nova estrutura: pode vir com dashboard_data wrapper ou diretamente
  dashboard_data?: DashboardData
  // Campos diretos para compatibilidade
  tipo_dashboard?: DashboardTipo
  xp_atual?: number
  nivel_atual?: number
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
  // Campos específicos para ADMIN
  metricas_gerais?: any
  cursos_populares?: any[]
  engajamento_departamento?: any
  alertas_sistema?: any[]
}

export function useDashboard() {
  return useQuery<DashboardBase>({
    queryKey: ['users', 'dashboard', 'auto'],
    queryFn: async () => {
      console.log('[Dashboard] Buscando dados do dashboard...')
      const result = await authGet<DashboardBase>('/users/v1/dashboard')
      console.log('[Dashboard] Dados recebidos:', result)
      return result
    },
    staleTime: 0,
    retry: false,
  })
}

// Hook combinado para dashboard + perfil do usuário
export function useDashboardCompleto() {
  const dashboard = useDashboard()
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
