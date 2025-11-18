import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authGet, authPost, authPatch } from './http'
import { API_ENDPOINTS } from './config'

type Enrollment = {
  id: string
  funcionario_id: string
  curso_id: string
  data_inscricao: string
  data_inicio?: string
  data_conclusao?: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  progresso_percentual: number
}

type CreateEnrollmentInput = {
  funcionario_id: string
  curso_id: string
}

type ModuleProgress = {
  id: string
  inscricao_id: string
  modulo_id: string
  data_inicio?: string
  data_conclusao?: string
  tempo_gasto?: number
  criado_em: string
  atualizado_em: string
}

export type UserEnrollment = {
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

type UserEnrollmentsResponse = {
  items: UserEnrollment[]
  total: number
  mensagem: string
}

type ModuleStartResponse = {
  progresso_modulo: ModuleProgress
  mensagem: string
}

type ModuleCompletionResult = {
  inscricao_id: string
  modulo_id: string
  progresso_percentual: number
  curso_concluido: boolean
  funcionario_id: string
  curso_id: string
}

type ModuleCompletionResponse = {
  resultado: ModuleCompletionResult
  mensagem: string
}

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
      authPost<ModuleStartResponse>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/modulos/${moduleId}/iniciar`,
        {}
      ),
    onSuccess: (data, variables) => {
      // Atualização otimista: atualizar cache diretamente sem refetch
      queryClient.setQueryData<ModuloComProgresso[]>(
        ['progress', 'modulos-progresso', variables.enrollmentId],
        (old = []) => {
          return old.map(modulo =>
            modulo.modulo_id === variables.moduleId
              ? {
                  ...modulo,
                  data_inicio: data.progresso_modulo.criado_em,
                  liberado: true,
                }
              : modulo
          )
        }
      )

      // Invalidar apenas dados críticos (sem refetch imediato)
      queryClient.invalidateQueries({
        queryKey: ['progress', 'modulos-progresso', variables.enrollmentId],
        refetchType: 'none', // Não refaz a query imediatamente
      })

      // Invalidar dashboard em background
      queryClient.invalidateQueries({
        queryKey: ['users', 'dashboard'],
        refetchType: 'none',
      })
    },
  })
}

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
      authPatch<ModuleCompletionResponse>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/modulos/${moduleId}/concluir`,
        {}
      ),
    onSuccess: (data, variables) => {
      // Atualização otimista: atualizar cache diretamente
      queryClient.setQueryData<ModuloComProgresso[]>(
        ['progress', 'modulos-progresso', variables.enrollmentId],
        (old = []) => {
          return old.map(modulo =>
            modulo.modulo_id === variables.moduleId
              ? {
                  ...modulo,
                  concluido: true,
                  data_conclusao: new Date().toISOString(),
                }
              : modulo
          )
        }
      )

      // Invalidar módulos da inscrição (refetch em background)
      queryClient.invalidateQueries({
        queryKey: ['progress', 'modulos-progresso', variables.enrollmentId],
        refetchType: 'none',
      })

      // Invalidar inscrições do usuário para atualizar progresso
      queryClient.invalidateQueries({
        queryKey: ['progress', 'user', data.resultado.funcionario_id],
      })

      // Invalidar dashboard em background
      queryClient.invalidateQueries({
        queryKey: ['users', 'dashboard'],
        refetchType: 'none',
      })

      // If course was completed, invalidate gamification data
      if (data.resultado.curso_concluido) {
        queryClient.invalidateQueries({
          queryKey: ['gamification'],
          refetchType: 'none',
        })
      }
    },
  })
}

export type CourseEnrollment = {
  id: string
  funcionario: {
    id: string
    nome: string
    email: string
    departamento: string
  }
  progresso: number
  status: string
  data_inscricao: string
  data_conclusao?: string
  modulos_completos: number
  total_modulos: number
  nota_media?: number | null
}

type CourseEnrollmentsResponse = {
  success: boolean
  data: CourseEnrollment[]
  total: number
  mensagem: string
}

export function useCourseEnrollments(cursoId: string, enabled = true) {
  return useQuery<CourseEnrollmentsResponse>({
    queryKey: ['progress', 'course', cursoId, 'enrollments'],
    queryFn: () =>
      authGet<CourseEnrollmentsResponse>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes?curso_id=${cursoId}`
      ),
    enabled: enabled && !!cursoId,
  })
}

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

export type Certificate = {
  id: number
  funcionario_id: string
  curso_id: string
  codigo_certificado: string
  data_emissao: string
  hash_validacao: string
  storage_key?: string | null
}

type UserCertificatesResponse = {
  items: Certificate[]
  mensagem: string
}

type IssueCertificateResponse = {
  certificado: Certificate
  mensagem: string
}

type CertificatePdfResponse = {
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

export function useGenerateCertificatePdf() {
  return useMutation({
    mutationKey: ['progress', 'certificate', 'pdf'],
    mutationFn: (enrollmentId: string) =>
      authGet<CertificatePdfResponse>(
        `${API_ENDPOINTS.PROGRESS}/certificates/enrollment/${enrollmentId}/pdf`
      ),
  })
}

export type ModuloComProgresso = {
  modulo_id: string
  titulo: string
  ordem: number
  tipo_conteudo: string
  obrigatorio: boolean
  xp_modulo: number
  concluido: boolean
  liberado: boolean
  data_inicio?: string
  data_conclusao?: string
  tempo_gasto?: number
  tem_avaliacao: boolean
  total_materiais: number
}

export function useModulosComProgresso(inscricaoId: string) {
  return useQuery<ModuloComProgresso[]>({
    queryKey: ['progress', 'modulos-progresso', inscricaoId],
    queryFn: async () => {
      const response = await authGet<{ items: ModuloComProgresso[] }>(
        `${API_ENDPOINTS.PROGRESS}/inscricoes/${inscricaoId}/modulos-progresso`
      )
      return response.items || []
    },
    enabled: !!inscricaoId,
  })
}
