import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch, authPut, authDelete } from './http'
import { API_ENDPOINTS } from './config'

// Types alinhados com schema do banco
export interface Category {
  codigo: string // PRIMARY KEY no schema
  nome: string
  descricao?: string
  departamento_codigo?: string // REFERENCES departamentos(codigo)
  cor_hex: string
  criado_em: string
  atualizado_em: string
}

export interface CreateCategoryInput {
  codigo: string
  nome: string
  descricao?: string
  departamento_codigo?: string
  cor_hex?: string
}

export interface Course {
  codigo: string // PRIMARY KEY no schema
  titulo: string
  descricao?: string
  categoria_id?: string // REFERENCES categorias(codigo)
  instrutor_id?: string // REFERENCES instrutores(funcionario_id)
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: string
  ativo: boolean
  pre_requisitos?: string[]
  criado_em: string
  atualizado_em: string
  // Campos relacionados ao instrutor
  instrutor_nome?: string
  // Campos de categoria
  categoria_nome?: string
  departamento_codigo?: string
  // Estatísticas de progresso
  total_inscricoes?: number
  total_conclusoes?: number
  taxa_conclusao?: number
  media_conclusao?: number
  total_modulos?: number
  // Módulos do curso (quando detalhado)
  modulos?: Module[]
  // Campos legados (manter por compatibilidade)
  avaliacao_media?: number
  pendentes_correcao?: number
  total_avaliacoes?: number
  total_concluidos?: number
  total_inscritos?: number
}

export interface CreateCourseInput {
  codigo: string
  titulo: string
  descricao?: string
  categoria_id?: string
  instrutor_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: string
  pre_requisitos?: string[]
  ativo?: boolean
}

export interface UpdateCourseInput {
  titulo?: string
  descricao?: string
  categoria_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: string
}

export interface Module {
  id: string
  titulo: string
  conteudo?: string | null
  ordem: number
  obrigatorio: boolean
  xp: number
  xp_modulo: number // campo correto do backend
  tipo_conteudo?: string | null
  curso_id?: string
  criado_em?: string
  atualizado_em?: string
}

export interface MaterialModulo {
  id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho: number
  storage_key: string
  url_download?: string // Presigned URL do S3
  criado_em: string
}

export interface ModuloCompleto {
  modulo_id: string
  curso_id: string
  ordem: number
  titulo: string
  conteudo?: string | null
  tipo_conteudo?: string | null
  obrigatorio: boolean
  xp_modulo: number
  criado_em: string
  atualizado_em: string
  materiais: MaterialModulo[]
  avaliacao?: {
    codigo: string
    titulo: string
    tempo_limite?: number
    tentativas_permitidas?: number
    nota_minima?: number
    ativo: boolean
  } | null
  total_materiais: number
  tem_avaliacao: boolean
}
export interface CreateModuleInput {
  titulo: string
  conteudo?: string
  ordem?: number
  obrigatorio?: boolean
  xp?: number
  tipo_conteudo?: string
}

export interface UpdateModuleInput {
  titulo?: string
  conteudo?: string
  ordem?: number
  obrigatorio?: boolean
  xp?: number
  tipo_conteudo?: string
}

export interface Material {
  id: string
  modulo_id: string
  nome_arquivo: string
  storage_key: string
  tamanho: string | number // Vem como string do backend
  tipo_arquivo: string
  url_download?: string
  criado_em: string
}

export interface UploadMaterialInput {
  nome_arquivo: string
  base64: string
}

export interface CatalogFilters {
  q?: string // Busca por título/descrição
  categoria?: string
  categoria_id?: string // Alias para categoria
  instrutor?: string
  nivel?: string
  duracaoMax?: number
  departamento?: string // Para GERENTE filtrar por departamento
  ativo?: boolean // Para INSTRUTOR filtrar por status
}

export interface CoursesResponse {
  items: Course[]
  total?: number
}

// Hooks para Categorias
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['courses', 'categories'],
    queryFn: async () => {
      const response = await authGet<{
        items: Category[]
        mensagem: string
      }>(`${API_ENDPOINTS.COURSES}/categorias`)
      return response.items || []
    }
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'categories', 'create'],
    mutationFn: (input: CreateCategoryInput) =>
      authPost<Category>(`${API_ENDPOINTS.COURSES}/categorias`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'categories'] })
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'categories', 'update'],
    mutationFn: ({
      codigo,
      ...input
    }: { codigo: string } & Partial<CreateCategoryInput>) =>
      authPut<Category>(`${API_ENDPOINTS.COURSES}/categorias/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'categories'] })
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'categories', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.COURSES}/categorias/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'categories'] })
    }
  })
}

// Hooks para Cursos
export function useCourse(codigo: string) {
  return useQuery<Course>({
    queryKey: ['courses', 'detail', codigo],
    queryFn: () => authGet<Course>(`${API_ENDPOINTS.COURSES}/${codigo}`),
    enabled: !!codigo
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'create'],
    mutationFn: (input: CreateCourseInput) =>
      authPost<Course>(`${API_ENDPOINTS.COURSES}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}

export function useUpdateCourse(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'update', codigo],
    mutationFn: (input: UpdateCourseInput) =>
      authPatch<Course>(`${API_ENDPOINTS.COURSES}/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', codigo] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'duplicate'],
    mutationFn: (codigo: string) =>
      authPost<Course>(`${API_ENDPOINTS.COURSES}/${codigo}/duplicar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}

export function useToggleCourseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'toggle-status'],
    mutationFn: ({ codigo, active }: { codigo: string; active: boolean }) =>
      authPatch(`${API_ENDPOINTS.COURSES}/${codigo}/active`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    }
  })
}

// Hooks para Módulos
export function useCourseModules(codigo: string) {
  return useQuery<Module[]>({
    queryKey: ['courses', 'modules', codigo],
    queryFn: async () => {
      const raw = await authGet<
        | Module[]
        | {
          items: Module[]
          mensagem: string
        }
      >(`${API_ENDPOINTS.COURSES}/${codigo}/modulos`)
      const list: Module[] = Array.isArray(raw) ? raw : raw.items || []
      return list.map(m => ({
        ...m
      }))
    },
    enabled: !!codigo
  })
}

export function useCreateModule(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'modules', 'create', codigo],
    mutationFn: (input: CreateModuleInput) =>
      authPost<{ modulo: Module; mensagem: string }>(
        `${API_ENDPOINTS.COURSES}/${codigo}/modulos`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses', 'modules', codigo]
      })
    }
  })
}

export function useUpdateModule(codigo: string, moduloId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'modules', 'update', codigo, moduloId],
    mutationFn: (input: UpdateModuleInput) =>
      authPatch<{ modulo: Module; mensagem: string }>(
        `${API_ENDPOINTS.COURSES}/${codigo}/modulos/${moduloId}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses', 'modules', codigo]
      })
    }
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'modules', 'delete'],
    mutationFn: (moduloId: string) =>
      authDelete<{ mensagem: string }>(
        `${API_ENDPOINTS.COURSES}/modulos/${moduloId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses', 'modules']
      })
    }
  })
}

// Hooks para Materiais
export function useModuleMaterials(moduloId: string) {
  return useQuery<Material[]>({
    queryKey: ['courses', 'materials', moduloId],
    queryFn: async () => {
      const response = await authGet<{ items: Material[]; mensagem: string }>(
        `${API_ENDPOINTS.COURSES}/modulos/${moduloId}/materiais`
      )
      return response.items || []
    },
    enabled: !!moduloId
  })
}

export function useUploadMaterial(moduloId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'materials', 'upload', moduloId],
    mutationFn: (input: UploadMaterialInput) =>
      authPost<{
        created: boolean
        storage_key: string
        tamanho: number
        tipo_arquivo: string
      }>(`${API_ENDPOINTS.COURSES}/modulos/${moduloId}/materiais`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses', 'materials', moduloId]
      })
    }
  })
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['courses', 'materials', 'delete'],
    mutationFn: (materialId: string) =>
      authDelete(`${API_ENDPOINTS.COURSES}/materiais/${materialId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courses', 'materials']
      })
    }
  })
}

// Hooks para Catálogo/Listagem Unificada
export function useCourseCatalog(filters: CatalogFilters = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  const queryString = searchParams.toString()
  const url = `${API_ENDPOINTS.COURSES}${queryString ? `?${queryString}` : ''}`

  return useQuery<Course[]>({
    queryKey: ['courses', 'catalog', filters],
    queryFn: async () => {
      const response = await authGet<CoursesResponse>(url)
      return response.items || (response as unknown as Course[])
    }
  })
}

// Hook específico para buscar cursos com resposta estruturada
export function useCourses(filters: CatalogFilters = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  const queryString = searchParams.toString()
  const url = `${API_ENDPOINTS.COURSES}${queryString ? `?${queryString}` : ''}`

  return useQuery<CoursesResponse>({
    queryKey: ['courses', 'list', filters],
    queryFn: () => authGet<CoursesResponse>(url)
  })
}

// Helper para conversão de arquivo para Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove o prefixo data:*/*;base64, se existir
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Hook customizado para resolver títulos de pré-requisitos
export function usePrerequisitesTitles(
  prerequisiteCodes: string[] | undefined
) {
  const { data: coursesResponse } = useCourses()

  if (!coursesResponse || !coursesResponse.items) {
    return prerequisiteCodes // Retorna só os códigos se ainda não carregou
  }

  const allCourses = coursesResponse.items

  // Mapear códigos para títulos
  const titles = prerequisiteCodes?.map(code => {
    const course = allCourses.find(c => c.codigo === code)
    if (course) {
      return course.titulo
    } else {
      return code
    }
  })

  return titles
}

// Hook para buscar um módulo completo específico
export function useModuloCompleto(moduloId: string) {
  return useQuery<ModuloCompleto>({
    queryKey: ['courses', 'modulo-completo', moduloId],
    queryFn: async () => {
      const response = await authGet<{ data: ModuloCompleto }>(
        `${API_ENDPOINTS.COURSES}/modulos/${moduloId}/completo`
      )
      return response.data
    },
    enabled: !!moduloId
  })
}
