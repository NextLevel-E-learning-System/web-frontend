import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// ========================
// INTERFACES DOS CURSOS
// ========================

export interface Categoria {
  codigo: string
  nome: string
  descricao?: string
  cor_hex?: string
}

export interface Curso {
  id?: string
  codigo: string
  titulo: string
  descricao?: string
  categoria_id?: string
  categoria_nome?: string
  instrutor_id?: string
  instrutor_nome?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
  pre_requisitos?: string[]
  data_criacao?: string
  ativo?: boolean
  total_modulos?: number
  total_inscritos?: number
}

export interface CriarCurso {
  codigo: string
  titulo: string
  descricao?: string
  categoria_id?: string
  instrutor_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
  pre_requisitos?: string[]
}

export interface AtualizarCurso {
  titulo?: string
  descricao?: string
  categoria_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
}

export interface Modulo {
  id: string
  curso_codigo: string
  titulo: string
  conteudo?: string
  ordem: number
  obrigatorio: boolean
  xp: number
  tipo_conteudo?: string
  data_criacao?: string
}

export interface CriarModulo {
  titulo: string
  conteudo?: string
  ordem?: number
  obrigatorio?: boolean
  xp?: number
  tipo_conteudo?: string
}

export interface AtualizarModulo {
  titulo?: string
  conteudo?: string
  ordem?: number
  obrigatorio?: boolean
  xp?: number
  tipo_conteudo?: string
}

export interface MaterialModulo {
  id: string
  modulo_id: string
  nome_arquivo: string
  storage_key: string
  tamanho: number
  tipo_arquivo: string
  data_upload?: string
}

export interface UploadMaterial {
  nome_arquivo: string
  base64: string
}

export interface FiltrosCatalogo {
  categoria?: string
  instrutor?: string
}

// ========================
// HOOKS DE CURSOS
// ========================

/**
 * Hook para criar um novo curso
 */
export function useCriarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dadosCurso: CriarCurso) => {
      return await authPost('/courses/v1', dadosCurso)
    },
    onSuccess: () => {
      // Invalida cache do catálogo
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalogo'] })
    },
  })
}

/**
 * Hook para obter um curso específico por código
 */
export function useCurso(codigo: string, enabled: boolean = true) {
  return useQuery<Curso>({
    queryKey: ['courses', 'curso', codigo],
    queryFn: async () => {
      return await authGet(`/courses/v1/${codigo}`)
    },
    enabled: enabled && !!codigo,
  })
}

/**
 * Hook para atualizar um curso
 */
export function useAtualizarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigo,
      dados,
    }: {
      codigo: string
      dados: AtualizarCurso
    }) => {
      return await authPatch(`/courses/v1/${codigo}`, dados)
    },
    onSuccess: (_, { codigo }) => {
      // Invalida cache do curso específico e catálogo
      queryClient.invalidateQueries({ queryKey: ['courses', 'curso', codigo] })
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalogo'] })
    },
  })
}

/**
 * Hook para duplicar um curso
 */
export function useDuplicarCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (codigo: string) => {
      return await authPost(`/courses/v1/${codigo}/duplicar`)
    },
    onSuccess: () => {
      // Invalida cache do catálogo
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalogo'] })
    },
  })
}

/**
 * Hook para alterar status ativo do curso
 */
export function useAlterarStatusCurso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigo,
      active,
    }: {
      codigo: string
      active: boolean
    }) => {
      return await authPatch(`/courses/v1/${codigo}/active`, { active })
    },
    onSuccess: (_, { codigo }) => {
      // Invalida cache do curso específico e catálogo
      queryClient.invalidateQueries({ queryKey: ['courses', 'curso', codigo] })
      queryClient.invalidateQueries({ queryKey: ['courses', 'catalogo'] })
    },
  })
}

/**
 * Hook para obter catálogo de cursos
 */
export function useCatalogoCursos(filtros?: FiltrosCatalogo) {
  const params = new URLSearchParams()
  if (filtros?.categoria) params.append('categoria', filtros.categoria)
  if (filtros?.instrutor) params.append('instrutor', filtros.instrutor)

  const queryString = params.toString()
  const url = `/courses/v1/catalogo${queryString ? `?${queryString}` : ''}`

  return useQuery<Curso[]>({
    queryKey: ['courses', 'catalogo', filtros],
    queryFn: async () => {
      return await authGet(url)
    },
  })
}

// ========================
// HOOKS DE CATEGORIAS
// ========================

/**
 * Hook para listar categorias
 */
export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['courses', 'categorias'],
    queryFn: async () => {
      return await authGet('/courses/v1/categories')
    },
  })
}

/**
 * Hook para criar categoria
 */
export function useCriarCategoria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      categoria: Omit<Categoria, 'codigo'> & { codigo: string }
    ) => {
      return await authPost('/courses/v1/categories', categoria)
    },
    onSuccess: () => {
      // Invalida cache das categorias
      queryClient.invalidateQueries({ queryKey: ['courses', 'categorias'] })
    },
  })
}

// ========================
// HOOKS DE MÓDULOS
// ========================

/**
 * Hook para listar módulos de um curso
 */
export function useModulosCurso(codigoCurso: string, enabled: boolean = true) {
  return useQuery<Modulo[]>({
    queryKey: ['courses', 'modulos', codigoCurso],
    queryFn: async () => {
      return await authGet(`/courses/v1/${codigoCurso}/modulos`)
    },
    enabled: enabled && !!codigoCurso,
  })
}

/**
 * Hook para adicionar módulo a um curso
 */
export function useAdicionarModulo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigoCurso,
      dadosModulo,
    }: {
      codigoCurso: string
      dadosModulo: CriarModulo
    }) => {
      return await authPost(`/courses/v1/${codigoCurso}/modulos`, dadosModulo)
    },
    onSuccess: (_, { codigoCurso }) => {
      // Invalida cache dos módulos do curso
      queryClient.invalidateQueries({
        queryKey: ['courses', 'modulos', codigoCurso],
      })
    },
  })
}

/**
 * Hook para atualizar módulo
 */
export function useAtualizarModulo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigoCurso,
      moduloId,
      dados,
    }: {
      codigoCurso: string
      moduloId: string
      dados: AtualizarModulo
    }) => {
      return await authPatch(
        `/courses/v1/${codigoCurso}/modulos/${moduloId}`,
        dados
      )
    },
    onSuccess: (_, { codigoCurso }) => {
      // Invalida cache dos módulos do curso
      queryClient.invalidateQueries({
        queryKey: ['courses', 'modulos', codigoCurso],
      })
    },
  })
}

// ========================
// HOOKS DE MATERIAIS
// ========================

/**
 * Hook para listar materiais de um módulo
 */
export function useMateriaisModulo(moduloId: string, enabled: boolean = true) {
  return useQuery<MaterialModulo[]>({
    queryKey: ['courses', 'materiais', moduloId],
    queryFn: async () => {
      return await authGet(`/courses/v1/modulos/${moduloId}/materiais`)
    },
    enabled: enabled && !!moduloId,
  })
}

/**
 * Hook para fazer upload de material para um módulo
 */
export function useUploadMaterial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      moduloId,
      material,
    }: {
      moduloId: string
      material: UploadMaterial
    }) => {
      return await authPost(
        `/courses/v1/modulos/${moduloId}/materiais`,
        material
      )
    },
    onSuccess: (_, { moduloId }) => {
      // Invalida cache dos materiais do módulo
      queryClient.invalidateQueries({
        queryKey: ['courses', 'materiais', moduloId],
      })
    },
  })
}

// ========================
// HOOKS COMPOSTOS/UTILITÁRIOS
// ========================

/**
 * Hook que combina dados do curso com seus módulos
 */
export function useCursoCompleto(codigo: string, enabled: boolean = true) {
  const curso = useCurso(codigo, enabled)
  const modulos = useModulosCurso(codigo, enabled && curso.isSuccess)

  return {
    curso: curso.data,
    modulos: modulos.data || [],
    isLoading: curso.isLoading || modulos.isLoading,
    isError: curso.isError || modulos.isError,
    error: curso.error || modulos.error,
    refetch: () => {
      curso.refetch()
      modulos.refetch()
    },
  }
}

/**
 * Hook para obter estatísticas de curso (para instrutores/admins)
 */
export function useEstatisticasCurso(codigo: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['courses', 'estatisticas', codigo],
    queryFn: async () => {
      // Placeholder - endpoint não definido na API atual
      // return await authGet(`/courses/v1/${codigo}/estatisticas`)
      return {
        total_inscritos: 0,
        concluidos: 0,
        em_andamento: 0,
        taxa_conclusao: 0,
        avaliacao_media: 0,
      }
    },
    enabled: enabled && !!codigo,
  })
}

/**
 * Hook para converter arquivo para Base64 (utilitário para upload)
 */
export function useConvertFileToBase64() {
  return {
    convertFile: (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remove o prefixo "data:tipo/subtipo;base64," para obter apenas o Base64
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
  }
}

/**
 * Hook para validações de curso
 */
export function useValidacoesCurso() {
  return {
    validarCodigo: (codigo: string): boolean => {
      return /^[A-Za-z0-9_-]+$/.test(codigo) && codigo.length >= 3
    },
    validarTitulo: (titulo: string): boolean => {
      return titulo.trim().length >= 5
    },
    validarDuracao: (duracao: number): boolean => {
      return duracao > 0 && duracao <= 1000
    },
    validarXP: (xp: number): boolean => {
      return xp > 0 && xp <= 10000
    },
  }
}
