import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from './http'
import { API_ENDPOINTS } from './config'

// Types alinhados com schema do banco
export interface Assessment {
  codigo: string // PRIMARY KEY no schema
  curso_id: string // REFERENCES cursos(codigo)
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
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
}

export interface Question {
  id: string
  avaliacao_id: string // REFERENCES avaliacoes(codigo)
  tipo_questao: string
  enunciado: string
  opcoes_resposta?: string[]
  resposta_correta?: string
  peso: number
  criado_em: string
}

export interface CreateQuestionInput {
  avaliacao_id: string
  tipo_questao: string
  enunciado: string
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

export function useSubmitAssessment(codigo: string) {
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
export function useAssessmentQuestions(codigo: string) {
  return useQuery<Question[]>({
    queryKey: ['assessments', 'questions', codigo],
    queryFn: () =>
      authGet<Question[]>(`${API_ENDPOINTS.ASSESSMENTS}/${codigo}/questions`),
    enabled: !!codigo,
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
