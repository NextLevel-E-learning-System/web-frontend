import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from '@/api/http'

// ========================
// INTERFACES DAS AVALIAÇÕES
// ========================

export interface Avaliacao {
  id?: string
  codigo: string
  curso_id: string
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
  data_criacao?: string
  ativo?: boolean
  total_questoes?: number
}

export interface CriarAvaliacao {
  codigo: string
  curso_id: string
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
}

export interface Questao {
  id: string
  avaliacao_codigo: string
  enunciado: string
  tipo: 'MULTIPLA_ESCOLHA' | 'VERDADEIRO_FALSO' | 'DISSERTATIVA'
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso?: number
  ordem?: number
}

export interface CriarQuestao {
  enunciado: string
  tipo: 'MULTIPLA_ESCOLHA' | 'VERDADEIRO_FALSO' | 'DISSERTATIVA'
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso?: number
}

export interface Alternativa {
  id: string
  questao_id: string
  texto: string
  correta: boolean
  ordem?: number
}

export interface CriarAlternativa {
  texto: string
  correta: boolean
}

export interface TentativaAvaliacao {
  id: string
  avaliacao_codigo: string
  usuario_id: string
  numero_tentativa: number
  data_inicio: string
  data_fim?: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PENDENTE_REVISAO' | 'REVISADA'
  nota_final?: number
  aprovado?: boolean
  tempo_gasto?: number
}

export interface IniciarTentativa {
  userId?: string
}

export interface RespostaUsuario {
  questao_id: string
  resposta: string
}

export interface SubmeterRespostas {
  userId: string
  attemptId: string
  respostas: RespostaUsuario[]
}

export interface RespostaDissertativa {
  id: string
  tentativa_id: string
  questao_id: string
  resposta_texto: string
  pontuacao?: number
  corrigida: boolean
}

export interface RevisaoTentativa {
  notaMinima?: number
  scores: {
    respostaId: string
    pontuacao: number
  }[]
}

// ========================
// HOOKS DE AVALIAÇÕES
// ========================

/**
 * Hook para criar uma nova avaliação
 */
export function useCriarAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dadosAvaliacao: CriarAvaliacao) => {
      return await authPost('/assessments/v1', dadosAvaliacao)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

/**
 * Hook para obter uma avaliação específica por código
 */
export function useAvaliacao(codigo: string, enabled: boolean = true) {
  return useQuery<Avaliacao>({
    queryKey: ['assessments', 'avaliacao', codigo],
    queryFn: async () => {
      return await authGet(`/assessments/v1/${codigo}`)
    },
    enabled: enabled && !!codigo,
  })
}

/**
 * Hook para submeter respostas de uma avaliação
 */
export function useSubmeterRespostas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigo,
      respostas,
    }: {
      codigo: string
      respostas: SubmeterRespostas
    }) => {
      return await authPost(`/assessments/v1/${codigo}`, respostas)
    },
    onSuccess: (_, { codigo }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'tentativas', codigo],
      })
    },
  })
}

// ========================
// HOOKS DE QUESTÕES
// ========================

/**
 * Hook para listar questões de uma avaliação
 */
export function useQuestoesAvaliacao(codigo: string, enabled: boolean = true) {
  return useQuery<Questao[]>({
    queryKey: ['assessments', 'questoes', codigo],
    queryFn: async () => {
      return await authGet(`/assessments/v1/${codigo}/questions`)
    },
    enabled: enabled && !!codigo,
  })
}

/**
 * Hook para adicionar questão a uma avaliação
 */
export function useAdicionarQuestao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigo,
      questao,
    }: {
      codigo: string
      questao: CriarQuestao
    }) => {
      return await authPost(`/assessments/v1/${codigo}/questions`, questao)
    },
    onSuccess: (_, { codigo }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'questoes', codigo],
      })
    },
  })
}

// ========================
// HOOKS DE ALTERNATIVAS
// ========================

/**
 * Hook para listar alternativas de uma questão
 */
export function useAlternativasQuestao(
  questaoId: string,
  enabled: boolean = true
) {
  return useQuery<Alternativa[]>({
    queryKey: ['assessments', 'alternativas', questaoId],
    queryFn: async () => {
      return await authGet(
        `/assessments/v1/questions/${questaoId}/alternatives`
      )
    },
    enabled: enabled && !!questaoId,
  })
}

/**
 * Hook para adicionar alternativa a uma questão
 */
export function useAdicionarAlternativa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questaoId,
      alternativa,
    }: {
      questaoId: string
      alternativa: CriarAlternativa
    }) => {
      return await authPost(
        `/assessments/v1/questions/${questaoId}/alternatives`,
        alternativa
      )
    },
    onSuccess: (_, { questaoId }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'alternativas', questaoId],
      })
    },
  })
}

// ========================
// HOOKS DE TENTATIVAS
// ========================

/**
 * Hook para iniciar uma tentativa de avaliação
 */
export function useIniciarTentativa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      codigo,
      dados,
    }: {
      codigo: string
      dados?: IniciarTentativa
    }) => {
      return await authPost(
        `/assessments/v1/${codigo}/attempts/start`,
        dados || {}
      )
    },
    onSuccess: (_, { codigo }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'tentativas', codigo],
      })
    },
  })
}

/**
 * Hook para obter respostas dissertativas pendentes de revisão
 */
export function useRespostasDissertativas(
  attemptId: string,
  enabled: boolean = true
) {
  return useQuery<RespostaDissertativa[]>({
    queryKey: ['assessments', 'dissertativas', attemptId],
    queryFn: async () => {
      return await authGet(`/assessments/v1/attempts/${attemptId}/dissertative`)
    },
    enabled: enabled && !!attemptId,
  })
}

/**
 * Hook para revisar tentativa com questões dissertativas
 */
export function useRevisarTentativa() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      attemptId,
      revisao,
    }: {
      attemptId: string
      revisao: RevisaoTentativa
    }) => {
      return await authPatch(
        `/assessments/v1/attempts/${attemptId}/review`,
        revisao
      )
    },
    onSuccess: (_, { attemptId }) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'dissertativas', attemptId],
      })
      queryClient.invalidateQueries({ queryKey: ['assessments', 'tentativas'] })
    },
  })
}

// ========================
// HOOKS COMPOSTOS/UTILITÁRIOS
// ========================

/**
 * Hook que combina dados da avaliação com suas questões
 */
export function useAvaliacaoCompleta(codigo: string, enabled: boolean = true) {
  const avaliacao = useAvaliacao(codigo, enabled)
  const questoes = useQuestoesAvaliacao(codigo, enabled && avaliacao.isSuccess)

  return {
    avaliacao: avaliacao.data,
    questoes: questoes.data || [],
    isLoading: avaliacao.isLoading || questoes.isLoading,
    isError: avaliacao.isError || questoes.isError,
    error: avaliacao.error || questoes.error,
    refetch: () => {
      avaliacao.refetch()
      questoes.refetch()
    },
  }
}

/**
 * Hook para questão completa com alternativas
 */
export function useQuestaoCompleta(questaoId: string, enabled: boolean = true) {
  const alternativas = useAlternativasQuestao(questaoId, enabled)

  return {
    alternativas: alternativas.data || [],
    isLoading: alternativas.isLoading,
    isError: alternativas.isError,
    error: alternativas.error,
    refetch: alternativas.refetch,
  }
}

/**
 * Hook para validações de avaliação
 */
export function useValidacoesAvaliacao() {
  return {
    validarCodigo: (codigo: string): boolean => {
      return /^[A-Za-z0-9_-]+$/.test(codigo) && codigo.length >= 3
    },
    validarTitulo: (titulo: string): boolean => {
      return titulo.trim().length >= 5
    },
    validarTempoLimite: (tempo: number): boolean => {
      return tempo > 0 && tempo <= 600 // máximo 10 horas
    },
    validarTentativas: (tentativas: number): boolean => {
      return tentativas > 0 && tentativas <= 10
    },
    validarNotaMinima: (nota: number): boolean => {
      return nota >= 0 && nota <= 100
    },
    validarEnunciado: (enunciado: string): boolean => {
      return enunciado.trim().length >= 10
    },
    validarAlternativa: (texto: string): boolean => {
      return texto.trim().length >= 2
    },
  }
}
