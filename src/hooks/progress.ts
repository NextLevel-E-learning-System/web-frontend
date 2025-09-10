import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// ========================
// INTERFACES DO PROGRESSO
// ========================

export interface Inscricao {
  id: string
  funcionario_id: string
  curso_id: string
  curso_titulo?: string
  curso_categoria?: string
  status: 'INSCRITO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  progresso_percentual: number
  data_inscricao: string
  data_inicio?: string
  data_conclusao?: string
  nota_final?: number
  tempo_gasto?: number
  modulos_concluidos?: number
  total_modulos?: number
}

export interface CriarInscricao {
  funcionario_id: string
  curso_id: string
}

export interface AtualizarProgresso {
  progresso_percentual: number
}

export interface ConcluirModulo {
  moduloId: string
}

export interface Certificado {
  id: string
  inscricao_id: string
  usuario_id: string
  curso_id: string
  curso_titulo: string
  codigo_validacao: string
  hash_validacao: string
  data_emissao: string
  data_validade?: string
  pdf_url?: string
  ativo: boolean
}

export interface ValidarCertificado {
  codigo: string
  hash: string
}

export interface ResultadoValidacao {
  valido: boolean
  certificado?: Certificado
  motivo?: string
}

export interface Trilha {
  id: string
  codigo: string
  nome: string
  descricao?: string
  cursos_ids: string[]
  ordem_cursos?: number[]
  pre_requisitos?: string[]
  ativo: boolean
}

export interface ProgressoTrilha {
  trilha_id: string
  usuario_id: string
  progresso_percentual: number
  cursos_concluidos: number
  total_cursos: number
  data_inicio?: string
  data_conclusao?: string
}

// ========================
// HOOKS DE INSCRIÇÕES
// ========================

/**
 * Hook para criar uma nova inscrição
 */
export function useCriarInscricao() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (dadosInscricao: CriarInscricao) => {
      return await authPost('/progress/v1/inscricoes', dadosInscricao)
    },
    onSuccess: (_, { funcionario_id }) => {
      // Invalida cache das inscrições do usuário
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricoes', funcionario_id] })
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricoes'] })
    },
  })
}

/**
 * Hook para obter uma inscrição específica
 */
export function useInscricao(id: string, enabled: boolean = true) {
  return useQuery<Inscricao>({
    queryKey: ['progress', 'inscricao', id],
    queryFn: async () => {
      return await authGet(`/progress/v1/inscricoes/${id}`)
    },
    enabled: enabled && !!id,
  })
}

/**
 * Hook para listar inscrições de um usuário
 */
export function useInscricoesUsuario(userId: string, enabled: boolean = true) {
  return useQuery<Inscricao[]>({
    queryKey: ['progress', 'inscricoes', userId],
    queryFn: async () => {
      return await authGet(`/progress/v1/inscricoes/usuario/${userId}`)
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook para atualizar progresso de uma inscrição
 */
export function useAtualizarProgresso() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, progresso }: { id: string; progresso: AtualizarProgresso }) => {
      return await authPatch(`/progress/v1/inscricoes/${id}/progresso`, progresso)
    },
    onSuccess: (_, { id }) => {
      // Invalida cache da inscrição específica
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricao', id] })
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricoes'] })
    },
  })
}

/**
 * Hook para concluir módulo de um curso
 */
export function useConcluirModulo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ inscricaoId, moduloId }: { inscricaoId: string; moduloId: string }) => {
      return await authPost(`/progress/v1/inscricoes/${inscricaoId}/modulos/${moduloId}/concluir`)
    },
    onSuccess: (_, { inscricaoId }) => {
      // Invalida cache da inscrição e progresso
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricao', inscricaoId] })
      queryClient.invalidateQueries({ queryKey: ['progress', 'inscricoes'] })
      // Também invalida dashboard pois pode afetar XP
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })
    },
  })
}

// ========================
// HOOKS DE CERTIFICADOS
// ========================

/**
 * Hook para listar certificados de um usuário
 */
export function useCertificadosUsuario(userId: string, enabled: boolean = true) {
  return useQuery<Certificado[]>({
    queryKey: ['progress', 'certificados', userId],
    queryFn: async () => {
      return await authGet(`/progress/v1/certificates/user/${userId}`)
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook para emitir ou recuperar certificado
 */
export function useEmitirCertificado() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      return await authPost(`/progress/v1/certificates/enrollment/${enrollmentId}`)
    },
    onSuccess: (data: any) => {
      // Invalida cache dos certificados do usuário
      if (data?.usuario_id) {
        queryClient.invalidateQueries({ queryKey: ['progress', 'certificados', data.usuario_id] })
      }
      queryClient.invalidateQueries({ queryKey: ['progress', 'certificados'] })
    },
  })
}

/**
 * Hook para obter link PDF do certificado
 */
export function usePdfCertificado(enrollmentId: string, enabled: boolean = true) {
  return useQuery<{ pdf_url: string; certificado: Certificado }>({
    queryKey: ['progress', 'certificado-pdf', enrollmentId],
    queryFn: async () => {
      return await authGet(`/progress/v1/certificates/enrollment/${enrollmentId}/pdf`)
    },
    enabled: enabled && !!enrollmentId,
  })
}

/**
 * Hook para validar certificado
 */
export function useValidarCertificado() {
  return useMutation({
    mutationFn: async ({ codigo, hash }: ValidarCertificado) => {
      return await authGet(`/progress/v1/certificates/validate/${codigo}?hash=${hash}`)
    },
  })
}

// ========================
// HOOKS DE TRILHAS
// ========================

/**
 * Hook para listar trilhas disponíveis
 */
export function useTrilhas() {
  return useQuery<Trilha[]>({
    queryKey: ['progress', 'trilhas'],
    queryFn: async () => {
      return await authGet('/progress/v1/tracks')
    },
  })
}

/**
 * Hook para progresso do usuário em trilhas
 */
export function useProgressoTrilhasUsuario(userId: string, enabled: boolean = true) {
  return useQuery<ProgressoTrilha[]>({
    queryKey: ['progress', 'trilhas-usuario', userId],
    queryFn: async () => {
      return await authGet(`/progress/v1/tracks/user/${userId}`)
    },
    enabled: enabled && !!userId,
  })
}

// ========================
// HOOKS COMPOSTOS/UTILITÁRIOS
// ========================

/**
 * Hook que combina inscrições com certificados do usuário
 */
export function useProgressoCompleto(userId: string, enabled: boolean = true) {
  const inscricoes = useInscricoesUsuario(userId, enabled)
  const certificados = useCertificadosUsuario(userId, enabled)
  const trilhas = useProgressoTrilhasUsuario(userId, enabled)
  
  return {
    inscricoes: inscricoes.data || [],
    certificados: certificados.data || [],
    trilhas: trilhas.data || [],
    isLoading: inscricoes.isLoading || certificados.isLoading || trilhas.isLoading,
    isError: inscricoes.isError || certificados.isError || trilhas.isError,
    error: inscricoes.error || certificados.error || trilhas.error,
    refetch: () => {
      inscricoes.refetch()
      certificados.refetch()
      trilhas.refetch()
    },
  }
}

/**
 * Hook para estatísticas de progresso do usuário
 */
export function useEstatisticasProgresso(userId: string, enabled: boolean = true) {
  const { inscricoes, certificados } = useProgressoCompleto(userId, enabled)
  
  const stats = React.useMemo(() => {
    const total = inscricoes.length
    const concluidos = inscricoes.filter(i => i.status === 'CONCLUIDO').length
    const emAndamento = inscricoes.filter(i => i.status === 'EM_ANDAMENTO').length
    const totalCertificados = certificados.length
    const taxaConclusao = total > 0 ? (concluidos / total) * 100 : 0
    
    return {
      total_inscricoes: total,
      cursos_concluidos: concluidos,
      cursos_em_andamento: emAndamento,
      total_certificados: totalCertificados,
      taxa_conclusao: taxaConclusao,
    }
  }, [inscricoes, certificados])
  
  return stats
}

/**
 * Hook para verificar se usuário pode se inscrever em curso
 */
export function useVerificarInscricao(userId: string, cursoId: string) {
  const { inscricoes } = useProgressoCompleto(userId)
  
  const podeInscrever = React.useMemo(() => {
    const inscricaoExistente = inscricoes.find(i => 
      i.curso_id === cursoId && 
      ['INSCRITO', 'EM_ANDAMENTO', 'CONCLUIDO'].includes(i.status)
    )
    
    return {
      pode_inscrever: !inscricaoExistente,
      motivo: inscricaoExistente ? 
        `Usuário já está ${inscricaoExistente.status.toLowerCase()} neste curso` : 
        null,
      inscricao_existente: inscricaoExistente
    }
  }, [inscricoes, cursoId])
  
  return podeInscrever
}

/**
 * Hook para validações de progresso
 */
export function useValidacoesProgresso() {
  return {
    validarProgresso: (progresso: number): boolean => {
      return progresso >= 0 && progresso <= 100
    },
    validarCodigoCertificado: (codigo: string): boolean => {
      return /^[A-Z0-9]{8,12}$/.test(codigo)
    },
    validarHashCertificado: (hash: string): boolean => {
      return /^[a-f0-9]{32,64}$/.test(hash)
    }
  }
}

// Importar React para useMemo
import React from 'react'
