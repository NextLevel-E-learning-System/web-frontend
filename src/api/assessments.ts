import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPut, authDelete } from './http'
import { API_ENDPOINTS } from './config'

// Types alinhados com schema do banco
export interface Assessment {
  codigo: string // PRIMARY KEY no schema
  curso_id: string // REFERENCES cursos(codigo)
  modulo_id?: string // REFERENCIA opcional ao módulo
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface CreateAssessmentInput {
  codigo: string
  curso_id: string
  modulo_id?: string
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
}

export interface UpdateAssessmentInput {
  titulo?: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
  ativo?: boolean
  modulo_id?: string
}

export interface Question {
  id: string
  avaliacao_id: string // REFERENCES avaliacoes(codigo)
  tipo: string // Campo como vem do backend (corrigido)
  enunciado: string
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso: number
  criado_em: string
}

export interface CreateQuestionInput {
  avaliacao_id: string
  tipo: string // Corrigido para corresponder ao backend
  enunciado: string
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso?: number
}

export interface UpdateQuestionInput {
  tipo?: string // Corrigido para corresponder ao backend
  enunciado?: string
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso?: number
}

export interface Alternative {
  id: string
  texto: string
  correta: boolean
}

export interface CreateAlternativeInput {
  texto: string
  correta: boolean
}

export interface Attempt {
  id: string
  funcionario_id: string // REFERENCES funcionarios(id)
  avaliacao_id: string // REFERENCES avaliacoes(codigo)
  data_inicio: string
  data_fim?: string
  nota_obtida?: number
  status: string // 'EM_ANDAMENTO' | 'CONCLUIDA' | 'EXPIRADA'
  criado_em: string
}

export interface StartAttemptInput {
  avaliacao_id: string
}

export interface Answer {
  id: string
  tentativa_id: string // REFERENCES tentativas(id)
  questao_id: string // REFERENCES questoes(id)
  resposta_funcionario?: string
  pontuacao?: number
  criado_em: string
}

export interface SubmitAnswersInput {
  tentativa_id: string
  respostas: Array<{
    questao_id: string
    resposta: string
  }>
}

export interface SubmissionResult {
  nota: number
  passou: boolean
  respostas_corretas: number
  total_questoes: number
  tempo_gasto?: number
}

export interface DissertativeResponse {
  id: string
  questao_id: string
  resposta: string
  questao: {
    enunciado: string
    peso: number
  }
}

export interface ReviewInput {
  notaMinima?: number
  scores: Array<{
    respostaId: string
    pontuacao: number
  }>
}

export function useCreateAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'create'],
    mutationFn: (input: CreateAssessmentInput) =>
      authPost<Assessment>(`${API_ENDPOINTS.ASSESSMENTS}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

// Listar avaliações (pode filtrar por curso)
export function useAssessments(
  filters: { curso_id?: string; modulo_id?: string } = {}
) {
  const searchParams = new URLSearchParams()
  if (filters.curso_id) searchParams.append('curso_id', filters.curso_id)
  if (filters.modulo_id) searchParams.append('modulo_id', filters.modulo_id)
  const query = searchParams.toString()
  const url = `${API_ENDPOINTS.ASSESSMENTS}${query ? `?${query}` : ''}`

  return useQuery<Assessment[]>({
    queryKey: ['assessments', 'list', filters],
    queryFn: () =>
      authGet<{ avaliacoes?: Assessment[] } | Assessment[]>(url).then(res => {
        const list = Array.isArray(res) ? res : res.avaliacoes || []
        if (filters.modulo_id) {
          return list.filter(a => a.modulo_id === filters.modulo_id)
        }
        return list
      }),
  })
}

// Atualizar avaliação (PUT total ou parcial conforme backend aceitar)
export function useUpdateAssessment(codigo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['assessments', 'update', codigo],
    mutationFn: (input: UpdateAssessmentInput) =>
      authPut<Assessment>(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'detail', codigo],
      })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

// Inativar avaliação (DELETE - soft delete esperado)
export function useDeleteAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['assessments', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
    },
  })
}

// Hooks para Questões
export function useAssessmentQuestions(
  codigo: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery<Question[]>({
    queryKey: ['assessments', 'questions', codigo],
    queryFn: () =>
      authGet<Question[]>(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}/questions`),
    enabled: !!codigo && (options.enabled ?? true),
  })
}

export function useCreateQuestion(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'questions', 'create', codigo],
    mutationFn: (input: CreateQuestionInput) =>
      authPost<Question>(
        `${API_ENDPOINTS.ASSESSMENTS}/${codigo}/questions`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'questions', codigo],
      })
    },
  })
}

export function useUpdateQuestion(codigo: string, id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['assessments', 'questions', 'update', codigo, id],
    mutationFn: (input: UpdateQuestionInput) =>
      authPut<Question>(
        `${API_ENDPOINTS.ASSESSMENTS}/${codigo}/questions/${id}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'questions', codigo],
      })
    },
  })
}

export function useDeleteQuestion(codigo: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['assessments', 'questions', 'delete', codigo],
    mutationFn: (id: string) =>
      authDelete(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'questions', codigo],
      })
    },
  })
}

// ===== NOVOS HOOKS PARA FLUXO DO ALUNO =====

// Buscar avaliação de um módulo para o aluno
export interface AssessmentForStudent {
  codigo: string
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
  modulo_id: string
}

export function useModuleAssessment(moduloId: string, enabled = true) {
  return useQuery({
    queryKey: ['assessments', 'module', moduloId],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        data: AssessmentForStudent
      }>(`${API_ENDPOINTS.ASSESSMENTS}/module/${moduloId}/for-student`)
      return response.data
    },
    enabled: enabled && !!moduloId,
  })
}

// Iniciar avaliação com todos os dados (sem resposta correta)
export interface QuestionForStudent {
  id: string
  enunciado: string
  tipo: 'MULTIPLA_ESCOLHA' | 'VERDADEIRO_FALSO' | 'DISSERTATIVA'
  opcoes_resposta: string[]
  peso: number
}

export interface StartAssessmentResponse {
  tentativa: {
    id: string
    avaliacao_id: string
    funcionario_id: string
    data_inicio: string
    status: string
    tempo_limite?: number
    tentativas_permitidas?: number
  }
  avaliacao: {
    codigo: string
    titulo: string
    tempo_limite?: number
    tentativas_permitidas?: number
    nota_minima?: number
  }
  questoes: QuestionForStudent[]
  tentativas_anteriores: number
}

export function useStartAssessment() {
  return useMutation({
    mutationKey: ['assessments', 'start'],
    mutationFn: async (avaliacaoCodigo: string) => {
      const response = await authPost<{
        success: boolean
        message: string
        data: StartAssessmentResponse
      }>(`${API_ENDPOINTS.ASSESSMENTS}/${avaliacaoCodigo}/start-complete`, {})
      return response.data // Retorna apenas os dados, não o wrapper
    },
  })
}

// Buscar tentativa ativa (em andamento)
export function useActiveAttempt(avaliacaoCodigo: string, enabled = true) {
  return useQuery({
    queryKey: ['assessments', avaliacaoCodigo, 'active-attempt'],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        message: string
        data: StartAssessmentResponse | null
      }>(`${API_ENDPOINTS.ASSESSMENTS}/${avaliacaoCodigo}/active-attempt`)
      return response.data // Retorna os dados ou null
    },
    enabled: enabled && !!avaliacaoCodigo,
  })
}

// Submeter avaliação completa
export interface SubmitAssessmentInput {
  tentativa_id: string
  respostas: Array<{
    questao_id: string
    resposta_funcionario: string | null
  }>
}

export interface SubmitAssessmentResponse {
  tentativa_id: string
  status: 'AGUARDANDO_CORRECAO' | 'APROVADO' | 'REPROVADO'
  nota_obtida?: number | null
  nota_minima?: number | null
  tem_dissertativas: boolean
  questoes_dissertativas_pendentes?: number
  respostas_salvas: number
  mensagem: string
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'submit'],
    mutationFn: async (input: SubmitAssessmentInput) => {
      const response = await authPost<{
        success: boolean
        message: string
        data: SubmitAssessmentResponse
      }>(`${API_ENDPOINTS.ASSESSMENTS}/submit-complete`, input)
      return response.data // Retorna apenas os dados
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}

// Buscar histórico de tentativas do usuário
export interface AttemptHistory {
  id: string
  avaliacao_id: string
  funcionario_id: string
  data_inicio: string
  data_fim: string | null
  status: 'EM_ANDAMENTO' | 'AGUARDANDO_CORRECAO' | 'APROVADO' | 'REPROVADO'
  nota_obtida: number | null
  criado_em: string
}

export function useUserAttempts(avaliacaoCodigo: string, enabled = true) {
  return useQuery({
    queryKey: ['assessments', avaliacaoCodigo, 'user-attempts'],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        data: AttemptHistory[]
      }>(`${API_ENDPOINTS.ASSESSMENTS}/${avaliacaoCodigo}/my-attempts`)
      return response.data
    },
    enabled: enabled && !!avaliacaoCodigo,
  })
}

// ===== HOOKS PARA CORREÇÃO DE AVALIAÇÕES (INSTRUTOR) =====

// Interface para revisões pendentes
export interface PendingReview {
  tentativa_id: string
  avaliacao_codigo: string
  avaliacao_titulo: string
  funcionario: {
    id: string
    nome: string
    email: string
  }
  data_submissao: string
  questoes_dissertativas: number
  status: 'AGUARDANDO_CORRECAO'
}

// Buscar fila de correções pendentes (por curso)
export function usePendingReviews(cursoCodigo: string, enabled = true) {
  return useQuery({
    queryKey: ['assessments', 'reviews', 'pending', cursoCodigo],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        data: PendingReview[]
      }>(`${API_ENDPOINTS.ASSESSMENTS}/reviews/pending?curso_id=${cursoCodigo}`)
      return response.data
    },
    enabled: enabled && !!cursoCodigo,
  })
}

// Interface para tentativa completa (para revisão)
export interface AttemptForReview {
  tentativa: {
    id: string
    avaliacao_id: string
    funcionario_id: string
    data_inicio: string
    data_fim: string
    status: string
    nota_obtida?: number | null
  }
  avaliacao: {
    codigo: string
    titulo: string
    nota_minima?: number
  }
  funcionario: {
    id: string
    nome: string
    email: string
  }
  questoes_dissertativas: Array<{
    questao_id: string
    resposta_id: string
    enunciado: string
    peso: number
    resposta_funcionario: string
    pontuacao_atual?: number | null
    feedback_atual?: string
  }>
  respostas_objetivas?: Array<{
    questao_id: string
    enunciado: string
    tipo: string
    peso: number
    resposta_funcionario: string
    resposta_correta: string
    pontuacao: number | null
    opcoes_resposta?: string[]
  }>
  nota_objetivas?: number
}

// Buscar tentativa completa para revisão
export function useAttemptForReview(tentativaId: string, enabled = true) {
  return useQuery({
    queryKey: ['assessments', 'attempts', tentativaId, 'review'],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        data: AttemptForReview
      }>(`${API_ENDPOINTS.ASSESSMENTS}/attempts/${tentativaId}/review-complete`)
      return response.data
    },
    enabled: enabled && !!tentativaId,
  })
}

// Interface para finalizar revisão
export interface FinalizeReviewInput {
  correcoes: Array<{
    resposta_id: string
    pontuacao: number | null
    feedback?: string
  }>
}

export interface FinalizeReviewResponse {
  tentativa_id: string
  status: 'APROVADO' | 'REPROVADO'
  nota_final: number
  nota_minima?: number
  passou: boolean
  mensagem: string
}

// Finalizar revisão com correções
export function useFinalizeReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'finalize-review'],
    mutationFn: async ({
      tentativaId,
      input,
    }: {
      tentativaId: string
      input: FinalizeReviewInput
    }) => {
      const response = await authPost<{
        success: boolean
        message: string
        data: FinalizeReviewResponse
      }>(
        `${API_ENDPOINTS.ASSESSMENTS}/attempts/${tentativaId}/finalize-review`,
        input
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['assessments', 'attempts'] })
    },
  })
}
