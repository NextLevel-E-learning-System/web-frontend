import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authGet, authPost, authPatch } from './http';
import { API_ENDPOINTS } from './config';

// Types
export interface Enrollment {
  id: string;
  funcionario_id: string;
  curso_id: string;
  data_inscricao: string;
  data_inicio?: string;
  data_conclusao?: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  progresso_percentual: number;
}

export interface CreateEnrollmentInput {
  funcionario_id: string;
  curso_id: string;
}

export interface UpdateProgressInput {
  progresso_percentual: number;
}

export interface CompleteModuleResponse {
  enrollmentId: string;
  moduleId: string;
  courseId: string;
  userId: string;
  progressPercent: number;
  completedCourse: boolean;
}

export interface UserEnrollment {
  id: string;
  curso_id: string;
  status: string;
  progresso_percentual: number;
  data_inscricao: string;
}

// Hooks para Inscrições
export function useEnrollment(id: string) {
  return useQuery<Enrollment>({
    queryKey: ['progress', 'enrollment', id],
    queryFn: () => authGet<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes/${id}`),
    enabled: !!id
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['progress', 'enrollment', 'create'],
    mutationFn: (input: CreateEnrollmentInput) =>
      authPost<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'user', variables.funcionario_id] });
    }
  });
}

// Hooks para Progresso do Usuário
export function useUserEnrollments(userId: string) {
  return useQuery<UserEnrollment[]>({
    queryKey: ['progress', 'user', userId],
    queryFn: () => authGet<UserEnrollment[]>(`${API_ENDPOINTS.PROGRESS}/inscricoes/usuario/${userId}`),
    enabled: !!userId
  });
}

export function useUpdateProgress(enrollmentId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['progress', 'update', enrollmentId],
    mutationFn: (input: UpdateProgressInput) =>
      authPatch<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/progresso`, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollment', enrollmentId] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] });
      // Invalidate user enrollments as well
      const enrollment = queryClient.getQueryData(['progress', 'enrollment', enrollmentId]) as Enrollment | undefined;
      if (enrollment) {
        queryClient.invalidateQueries({ queryKey: ['progress', 'user', enrollment.funcionario_id] });
      }
    }
  });
}

export function useCompleteModule(enrollmentId: string, moduleId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['progress', 'complete-module', enrollmentId, moduleId],
    mutationFn: () =>
      authPost<CompleteModuleResponse>(`${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}/progresso`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollment', enrollmentId] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'user', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] });
      
      // If course was completed, invalidate gamification data
      if (data.completedCourse) {
        queryClient.invalidateQueries({ queryKey: ['gamification'] });
      }
    }
  });
}

// Hook para listar todas as inscrições (admin/instrutor)
export interface EnrollmentsFilters {
  status?: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  curso_id?: string;
  funcionario_id?: string;
  page?: number;
  limit?: number;
}

export function useAllEnrollments(filters: EnrollmentsFilters = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  const url = `${API_ENDPOINTS.PROGRESS}/inscricoes${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<Enrollment[]>({
    queryKey: ['progress', 'enrollments', filters],
    queryFn: () => authGet<Enrollment[]>(url)
  });
}

// Hook para cancelar inscrição
export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['progress', 'cancel'],
    mutationFn: (enrollmentId: string) =>
      authPatch<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}`, { 
        status: 'CANCELADO' 
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'user', data.funcionario_id] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] });
    }
  });
}

// Hook para reativar inscrição
export function useReactivateEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['progress', 'reactivate'],
    mutationFn: (enrollmentId: string) =>
      authPatch<Enrollment>(`${API_ENDPOINTS.PROGRESS}/inscricoes/${enrollmentId}`, { 
        status: 'EM_ANDAMENTO' 
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'user', data.funcionario_id] });
      queryClient.invalidateQueries({ queryKey: ['progress', 'enrollments'] });
    }
  });
}
