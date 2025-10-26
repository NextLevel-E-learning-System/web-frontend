import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch, authPut, authDelete } from './http'
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

// Hooks para Avaliações
export function useAssessment(codigo: string) {
  return useQuery<Assessment>({
    queryKey: ['assessments', 'detail', codigo],
    queryFn: () =>
      authGet<Assessment>(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}`),
    enabled: !!codigo,
  })
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

export function useSubmitAssessmentOld(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'submit', codigo],
    mutationFn: (input: SubmitAnswersInput) =>
      authPost<SubmissionResult>(
        `${API_ENDPOINTS.ASSESSMENTS}/${codigo}`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'attempts'] })
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

// Hooks para Alternativas
export function useQuestionAlternatives(questaoId: string) {
  return useQuery<Alternative[]>({
    queryKey: ['assessments', 'alternatives', questaoId],
    queryFn: () =>
      authGet<Alternative[]>(
        `${API_ENDPOINTS.ASSESSMENTS}/questions/${questaoId}/alternatives`
      ),
    enabled: !!questaoId,
  })
}

export function useCreateAlternative(questaoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'alternatives', 'create', questaoId],
    mutationFn: (input: CreateAlternativeInput) =>
      authPost<Alternative>(
        `${API_ENDPOINTS.ASSESSMENTS}/questions/${questaoId}/alternatives`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'alternatives', questaoId],
      })
    },
  })
}

// Hooks para Tentativas
export function useStartAttempt(codigo: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'attempts', 'start', codigo],
    mutationFn: (input: StartAttemptInput) =>
      authPost<Attempt>(
        `${API_ENDPOINTS.ASSESSMENTS}/${codigo}/attempts/start`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', 'attempts'] })
    },
  })
}

// Hooks para Revisão de Questões Dissertativas
export function useDissertativeResponses(attemptId: string) {
  return useQuery<DissertativeResponse[]>({
    queryKey: ['assessments', 'dissertative', attemptId],
    queryFn: () =>
      authGet<DissertativeResponse[]>(
        `${API_ENDPOINTS.ASSESSMENTS}/attempts/${attemptId}/dissertative`
      ),
    enabled: !!attemptId,
  })
}

export function useReviewAttempt(attemptId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assessments', 'review', attemptId],
    mutationFn: (input: ReviewInput) =>
      authPatch(
        `${API_ENDPOINTS.ASSESSMENTS}/attempts/${attemptId}/review`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'dissertative', attemptId],
      })
      queryClient.invalidateQueries({ queryKey: ['assessments', 'attempts'] })
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

// Buscar questões da avaliação (sem resposta correta) - para preview
export function useAssessmentQuestionsForStudent(
  avaliacaoCodigo: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['assessments', avaliacaoCodigo, 'questions-preview'],
    queryFn: async () => {
      const response = await authGet<{
        success: boolean
        data: QuestionForStudent[]
      }>(
        `${API_ENDPOINTS.ASSESSMENTS}/${avaliacaoCodigo}/questions/for-student`
      )
      return response.data
    },
    enabled: enabled && !!avaliacaoCodigo,
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
export function useActiveAttempt(
  avaliacaoCodigo: string,
  enabled = true
) {
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
    resposta_funcionario: string
  }>
}

export interface SubmitAssessmentResponse {
  tentativa_id: string
  status: 'FINALIZADA' | 'PENDENTE_REVISAO' | 'APROVADO' | 'REPROVADO'
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
