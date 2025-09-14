import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authGet, authPost, authPatch, authPut } from './http';
import { API_ENDPOINTS } from './config';

// Types alinhados com schema do banco
export interface Category {
  codigo: string;   // PRIMARY KEY no schema
  nome: string;
  descricao?: string;
  departamento_codigo?: string;  // REFERENCES departamentos(codigo)
  cor_hex?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface CreateCategoryInput {
  codigo: string;
  nome: string;
  descricao?: string;
  departamento_codigo?: string;
  cor_hex?: string;
}

export interface Course {
  codigo: string;   // PRIMARY KEY no schema
  titulo: string;
  descricao?: string;
  categoria_id?: string;        // REFERENCES categorias(codigo)
  instrutor_id?: string;        // REFERENCES instrutores(funcionario_id)
  duracao_estimada?: number;
  xp_oferecido?: number;
  nivel_dificuldade?: string;
  ativo: boolean;
  pre_requisitos?: string[];
  criado_em: string;
  atualizado_em: string;
}

export interface CreateCourseInput {
  codigo: string;
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  instrutor_id?: string;
  duracao_estimada?: number;
  xp_oferecido?: number;
  nivel_dificuldade?: string;
  pre_requisitos?: string[];
}

export interface UpdateCourseInput {
  titulo?: string;
  descricao?: string;
  categoria_id?: string;
  duracao_estimada?: number;
  xp_oferecido?: number;
  nivel_dificuldade?: string;
}

export interface Module {
  id: string;
  titulo: string;
  conteudo?: string;
  ordem: number;
  obrigatorio: boolean;
  xp: number;
  tipo_conteudo?: string;
}

export interface CreateModuleInput {
  titulo: string;
  conteudo?: string;
  ordem?: number;
  obrigatorio?: boolean;
  xp?: number;
  tipo_conteudo?: string;
}

export interface UpdateModuleInput {
  titulo?: string;
  conteudo?: string;
  ordem?: number;
  obrigatorio?: boolean;
  xp?: number;
  tipo_conteudo?: string;
}

export interface Material {
  id: string;
  nome_arquivo: string;
  storage_key: string;
  tamanho: number;
  tipo_arquivo: string;
  url_download: string;
}

export interface UploadMaterialInput {
  nome_arquivo: string;
  base64: string;
}

export interface UploadMaterialResponse {
  created: boolean;
  storage_key: string;
  tamanho: number;
  tipo_arquivo: string;
}

export interface CatalogFilters {
  categoria?: string;
  instrutor?: string;
  nivel?: string;
  duracaoMax?: number;
}

// Hooks para Categorias
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['courses', 'categories'],
    queryFn: () => authGet<Category[]>(`${API_ENDPOINTS.COURSES}/categories`)
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'categories', 'create'],
    mutationFn: (input: CreateCategoryInput) =>
      authPost<Category>(`${API_ENDPOINTS.COURSES}/categories`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'categories'] });
    }
  });
}

// Hooks para Cursos
export function useCourse(codigo: string) {
  return useQuery<Course>({
    queryKey: ['courses', 'detail', codigo],
    queryFn: () => authGet<Course>(`${API_ENDPOINTS.COURSES}/${codigo}`),
    enabled: !!codigo
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'create'],
    mutationFn: (input: CreateCourseInput) =>
      authPost<Course>(`${API_ENDPOINTS.COURSES}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

export function useUpdateCourse(codigo: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'update', codigo],
    mutationFn: (input: UpdateCourseInput) =>
      authPatch<Course>(`${API_ENDPOINTS.COURSES}/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', codigo] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'duplicate'],
    mutationFn: (codigo: string) =>
      authPost<Course>(`${API_ENDPOINTS.COURSES}/${codigo}/duplicar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

export function useToggleCourseStatus(codigo: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'toggle-status', codigo],
    mutationFn: (active: boolean) =>
      authPatch(`${API_ENDPOINTS.COURSES}/${codigo}/active`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', codigo] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

// Hooks para Módulos
export function useCourseModules(codigo: string) {
  return useQuery<Module[]>({
    queryKey: ['courses', 'modules', codigo],
    queryFn: () => authGet<Module[]>(`${API_ENDPOINTS.COURSES}/${codigo}/modulos`),
    enabled: !!codigo
  });
}

export function useCreateModule(codigo: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'modules', 'create', codigo],
    mutationFn: (input: CreateModuleInput) =>
      authPost<Module>(`${API_ENDPOINTS.COURSES}/${codigo}/modulos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'modules', codigo] });
    }
  });
}

export function useUpdateModule(codigo: string, moduloId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'modules', 'update', codigo, moduloId],
    mutationFn: (input: UpdateModuleInput) =>
      authPatch<Module>(`${API_ENDPOINTS.COURSES}/${codigo}/modulos/${moduloId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'modules', codigo] });
    }
  });
}

// Hooks para Materiais
export function useModuleMaterials(moduloId: string) {
  return useQuery<Material[]>({
    queryKey: ['courses', 'materials', moduloId],
    queryFn: () => authGet<Material[]>(`${API_ENDPOINTS.COURSES}/modulos/${moduloId}/materiais`),
    enabled: !!moduloId
  });
}

export function useUploadMaterial(moduloId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'materials', 'upload', moduloId],
    mutationFn: (input: UploadMaterialInput) =>
      authPost<UploadMaterialResponse>(`${API_ENDPOINTS.COURSES}/modulos/${moduloId}/materiais`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'materials', moduloId] });
    }
  });
}

// Hooks para Catálogo
export function useCourseCatalog(filters: CatalogFilters = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  const url = `${API_ENDPOINTS.COURSES}/catalogo${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<Course[]>({
    queryKey: ['courses', 'catalog', filters],
    queryFn: () => authGet<Course[]>(url)
  });
}

// Hooks para Instrutor
export interface InstructorCoursesFilters {
  status?: 'ATIVOS' | 'INATIVOS';
}

export function useInstructorCourses(filters: InstructorCoursesFilters = {}) {
  const searchParams = new URLSearchParams();
  
  if (filters.status) {
    searchParams.append('status', filters.status);
  }
  
  const queryString = searchParams.toString();
  const url = `${API_ENDPOINTS.COURSES}/me${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<Course[]>({
    queryKey: ['courses', 'instructor', filters],
    queryFn: () => authGet<Course[]>(url)
  });
}

export interface ReactivateCoursesInput {
  codigos?: string[];
}

export function useReactivateCourses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['courses', 'reactivate'],
    mutationFn: (input: ReactivateCoursesInput = {}) =>
      authPatch(`${API_ENDPOINTS.COURSES}/me/reativar`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });
}

// Helper para conversão de arquivo para Base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove o prefixo data:*/*;base64, se existir
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
