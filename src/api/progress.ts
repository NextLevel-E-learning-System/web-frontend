import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from './http'
import { API_ENDPOINTS } from './config'

// Types
export interface Enrollment {
  id: string
  funcionario_id: string
  curso_id: string
  data_inscricao: string
  data_inicio?: string
  data_conclusao?: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  progresso_percentual: number
}

export interface CreateEnrollmentInput {
  funcionario_id: string
  curso_id: string
}

export interface UpdateProgressInput {
  progresso_percentual: number
}

export interface CompleteModuleResponse {
  enrollmentId: string
  moduleId: string
  courseId: string
  userId: string
  progressPercent: number
  completedCourse: boolean
}

export interface UserEnrollment {
  id: string
  funcionario_id: string
  curso_id: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  progresso_percentual: number
  data_inscricao: string
  data_inicio?: string
  data_conclusao?: string
  criado_em: string
  atualizado_em: string
}

export interface UserEnrollmentsResponse {
  items: UserEnrollment[]
  total: number
  mensagem: string
}

export interface ModuleProgress {
  id: string
  inscricao_id: string
  modulo_id: string
  data_inicio?: string
  data_conclusao?: string
  tempo_gasto?: number
  criado_em: string
  atualizado_em: string
}

// Hooks para Inscrições - REMOVIDO: useEnrollment individual
// Use useUserEnrollments para buscar inscrições de um usuário

export function useCreateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'enrollment', 'create'],
    mutationFn: (input: CreateEnrollmentInput) =>
      authPost<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes`, input),
    onSuccess: (_, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })
      queryClient.invalidateQueries({
        queryKey: ['progress', 'user', _variables.funcionario_id],
      })
    },
  })
}

// Hooks para Progresso do Usuário
export function useUserEnrollments(
  userId: string,
  options?: {
    refetchOnMount?: boolean | 'always'
  }
) {
  return useQuery<UserEnrollmentsResponse>({
    queryKey: ['progress', 'user', userId],
    queryFn: () =>
      authGet<UserEnrollmentsResponse>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/usuario/${userId}`
      ),
    enabled: !!userId,
    refetchOnMount: options?.refetchOnMount,
  })
}

export function useUpdateProgress(enrollmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'update', enrollmentId],
    mutationFn: (input: UpdateProgressInput) =>
      authPatch<Enrollment>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/progresso`,
        input
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', enrollmentId],
      })
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })
      // Invalidate user enrollments as well
      const enrollment = queryClient.getQueryData([
        'progress',
        'enrollment',
        enrollmentId,
      ]) as Enrollment | undefined
      if (enrollment) {
        queryClient.invalidateQueries({
          queryKey: ['progress', 'user', enrollment.funcionario_id],
        })
      }
    },
  })
}

// Hook para iniciar módulo
export function useStartModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'start-module'],
    mutationFn: ({
      enrollmentId,
      moduleId,
    }: {
      enrollmentId: string
      moduleId: string
    }) =>
      authPost<{ progresso_modulo: ModuleProgress; mensagem: string }>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/modulos/${moduleId}/iniciar`,
        {}
      ),
    onSuccess: (_, variables) => {
      // Invalidar módulos da inscrição
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', variables.enrollmentId, 'modules'],
      })

      queryClient.invalidateQueries({
        queryKey: ['progress', 'user'],
      })
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })

      // Invalidar dashboard do usuário para garantir dados sempre atualizados
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })
    },
  })
}

// Hook para concluir módulo (novo endpoint)
export function useCompleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'complete-module'],
    mutationFn: ({
      enrollmentId,
      moduleId,
    }: {
      enrollmentId: string
      moduleId: string
    }) =>
      authPatch<{
        resultado: {
          inscricao_id: string
          modulo_id: string
          progresso_percentual: number
          curso_concluido: boolean
          funcionario_id: string
          curso_id: string
        }
        mensagem: string
      }>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/modulos/${moduleId}/concluir`,
        {}
      ),
    onSuccess: (data, variables) => {
      // Invalidar módulos da inscrição
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', variables.enrollmentId, 'modules'],
      })

      // Invalidar inscrições do usuário (atualiza progresso no header)
      queryClient.invalidateQueries({
        queryKey: ['progress', 'user', data.resultado.funcionario_id],
      })

      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })

      // Invalidar dashboard do usuário para atualizar XP e nível
      queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })

      // If course was completed, invalidate gamification data
      if (data.resultado.curso_concluido) {
        queryClient.invalidateQueries({ queryKey: ['gamification'] })
      }
    },
  })
}

// Hook para listar todas as inscrições (admin/instrutor)
export interface EnrollmentsFilters {
  status?: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  curso_id?: string
  funcionario_id?: string
  page?: number
  limit?: number
}

// Novo: Interface para inscrição com dados do aluno
export interface CourseEnrollment {
  id: string
  funcionario_id: string
  funcionario_nome: string
  funcionario_email: string
  departamento?: string
  progresso_percentual: number
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  data_inscricao: string
  data_conclusao?: string
  modulos_concluidos: number
  total_modulos: number
  nota_final?: number | null
}

export interface CourseEnrollmentsApiResponse {
  success: boolean
  data: Array<{
    id: string
    funcionario: {
      id: string
      nome: string
      email: string
    }
    progresso: number
    status: string
    data_inscricao: string
    data_conclusao?: string
    modulos_completos: number
    total_modulos: number
    nota_media?: number | null
  }>
  total: number
  mensagem: string
}

// Novo: Hook para buscar inscrições de um curso específico (para instrutor)
export function useCourseEnrollments(cursoId: string, enabled = true) {
  return useQuery<CourseEnrollment[]>({
    queryKey: ['progress', 'course', cursoId, 'enrollments'],
    queryFn: async () => {
      const response = await authGet<CourseEnrollmentsApiResponse>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes?curso_id=${cursoId}`
      )

      // Transformar dados da API para o formato esperado pelo componente
      return response.data.map(enrollment => ({
        id: enrollment.id,
        funcionario_id: enrollment.funcionario.id,
        funcionario_nome: enrollment.funcionario.nome,
        funcionario_email: enrollment.funcionario.email,
        departamento: undefined, // TODO: Adicionar departamento na API
        progresso_percentual: enrollment.progresso,
        status: enrollment.status as 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO',
        data_inscricao: enrollment.data_inscricao,
        data_conclusao: enrollment.data_conclusao,
        modulos_concluidos: enrollment.modulos_completos,
        total_modulos: enrollment.total_modulos,
        nota_final: enrollment.nota_media,
      }))
    },
    enabled: enabled && !!cursoId,
  })
}

export function useAllEnrollments(filters: EnrollmentsFilters = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  const queryString = searchParams.toString()
  const url = `${API_ENDPOINTS.PROGRESS}/inscricoes${queryString ? `?${queryString}` : ''}`

  return useQuery<Enrollment[]>({
    queryKey: ['progress', 'enrollments', filters],
    queryFn: () => authGet<Enrollment[]>(url),
  })
}

// Hook para cancelar inscrição
export function useCancelEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'cancel'],
    mutationFn: (enrollmentId: string) =>
      authPatch<Enrollment>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}`,
        {
          status: 'CANCELADO',
        }
      ),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['progress', 'user', data.funcionario_id],
      })
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })
    },
  })
}

// Hook para reativar inscrição
export function useReactivateEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'reactivate'],
    mutationFn: (enrollmentId: string) =>
      authPatch<Enrollment>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}`,
        {
          status: 'EM_ANDAMENTO',
        }
      ),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['progress', 'user', data.funcionario_id],
      })
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] })
    },
  })
}

// Hook para buscar progresso dos módulos de uma inscrição
export function useEnrollmentModuleProgress(enrollmentId: string) {
  return useQuery<ModuleProgress[]>({
    queryKey: ['progress', 'enrollment', enrollmentId, 'modules'],
    queryFn: () =>
      authGet<ModuleProgress[]>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/modulos`
      ),
    enabled: !!enrollmentId,
  })
}

// Utility functions para filtragem no frontend
export const filterEnrollmentsByStatus = (
  enrollments: UserEnrollment[],
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
) => {
  return enrollments.filter(enrollment => enrollment.status === status)
}

export const getEnrollmentStats = (enrollments: UserEnrollment[]) => {
  const emAndamento = filterEnrollmentsByStatus(enrollments, 'EM_ANDAMENTO')
  const concluidos = filterEnrollmentsByStatus(enrollments, 'CONCLUIDO')
  const cancelados = filterEnrollmentsByStatus(enrollments, 'CANCELADO')

  return {
    total: enrollments.length,
    emAndamento: emAndamento.length,
    concluidos: concluidos.length,
    cancelados: cancelados.length,
    cursosEmAndamento: emAndamento,
    cursosConcluidos: concluidos,
    cursosCancelados: cancelados,
  }
}

// Types para Certificados
export interface Certificate {
  id: number
  funcionario_id: string
  curso_id: string
  codigo_certificado: string
  data_emissao: string
  hash_validacao: string
  storage_key?: string | null
}

export interface UserCertificatesResponse {
  items: Certificate[]
  mensagem: string
}

export interface IssueCertificateResponse {
  certificado: Certificate
  mensagem: string
}

export interface CertificatePdfResponse {
  downloadUrl: string
  key: string
  codigo: string
  mensagem: string
}

// Hook para buscar certificados do usuário
export function useUserCertificates(userId: string) {
  return useQuery<UserCertificatesResponse>({
    queryKey: ['progress', 'certificates', 'user', userId],
    queryFn: () =>
      authGet<UserCertificatesResponse>(
        `${API_ENDPOINTS.PROGRESS}/certificates/user/${userId}`
      ),
    enabled: !!userId,
  })
}

// Hook para emitir/recuperar certificado de uma inscrição
export function useIssueCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['progress', 'certificate', 'issue'],
    mutationFn: (enrollmentId: string) =>
      authPost<IssueCertificateResponse>(
        `${API_ENDPOINTS.PROGRESS}/certificates/enrollment/${enrollmentId}`,
        {}
      ),
    onSuccess: (_, enrollmentId) => {
      // Invalidar certificados do usuário
      queryClient.invalidateQueries({
        queryKey: ['progress', 'certificates'],
      })
      // Invalidar inscrição específica
      queryClient.invalidateQueries({
        queryKey: ['progress', 'enrollment', enrollmentId],
      })
    },
  })
}

// Hook para gerar/baixar PDF do certificado
export function useGenerateCertificatePdf() {
  return useMutation({
    mutationKey: ['progress', 'certificate', 'pdf'],
    mutationFn: (enrollmentId: string) =>
      authGet<CertificatePdfResponse>(
        `${API_ENDPOINTS.PROGRESS}/certificates/enrollment/${enrollmentId}/pdf`
      ),
  })
}
