import { useQuery, useMutation } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// Tipos básicos (poderão ser refinados depois com schemas reais)
export interface Departamento {
  codigo: string
  nome: string
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
  biografia?: string
  cursos_id?: string[]
}

// Departamentos
export function useListarDepartamentos() {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departments'],
    queryFn: () => authGet<Departamento[]>('/users/v1/departments'),
  })
}

export function useCriarDepartamento() {
  return useMutation<
    Departamento,
    Error,
    { codigo: string; nome: string; gestor_id?: string }
  >({
    mutationKey: ['users', 'departments', 'create'],
    mutationFn: input => authPost<Departamento>('/users/v1/departments', input),
  })
}

export function useAtualizarDepartamento(codigo: string) {
  return useMutation<
    Departamento,
    Error,
    Partial<Pick<Departamento, 'nome' | 'gestor_id'>>
  >({
    mutationKey: ['users', 'departments', 'update', codigo],
    mutationFn: input =>
      authPatch<Departamento>(`/users/v1/departments/${codigo}`, input),
  })
}

// Perfil do usuário autenticado
export function useMeuPerfil() {
  return useQuery<PerfilUsuario>({
    queryKey: ['users', 'me'],
    queryFn: () => authGet<PerfilUsuario>('/users/v1/me'),
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

export function useCompletarCadastro() {
  return useMutation<
    PerfilUsuario,
    Error,
    {
      nome: string
      cpf: string
      email?: string
      departamento_id: string
      cargo: string
    }
  >({
    mutationKey: ['users', 'create'],
    mutationFn: input => authPost<PerfilUsuario>('/users/v1', input),
  })
}

// Operações por usuário
export function useObterUsuario(id: string) {
  return useQuery<PerfilUsuario>({
    queryKey: ['users', 'byId', id],
    queryFn: () => authGet<PerfilUsuario>(`/users/v1/${id}`),
    enabled: Boolean(id),
  })
}

export function useAtualizarUsuario(id: string) {
  return useMutation<PerfilUsuario, Error, Partial<PerfilUsuario>>({
    mutationKey: ['users', 'update', id],
    mutationFn: input => authPatch<PerfilUsuario>(`/users/v1/${id}`, input),
  })
}

// Dashboards

export type DashboardTipo = 'funcionario' | 'instrutor' | 'administrador'

export interface MenuOperacao {
  nome: string
  url: string
  icone: string
}

export interface DashboardBase {
  tipo_dashboard: DashboardTipo
  xp_atual: number
  nivel_atual: number
  xp_proximo_nivel: number
  proximo_badge: string
  progresso_nivel: number
  ranking_departamento: any
  cursos_em_andamento: any[]
  cursos_concluidos: any[]
  cursos_disponiveis: any[]
  timeline: any[]
  badges_conquistados: any[]
  menu_operacoes: MenuOperacao[]
}

export function useDashboard() {
  return useQuery<DashboardBase>({
    queryKey: ['users', 'dashboard', 'auto'],
    queryFn: () => authGet<DashboardBase>('/users/v1/dashboard'),
    staleTime: 0,
    retry: false,
  })
}
