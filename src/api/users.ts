import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authGet, authPost, authPut, authPatch, authDelete } from './http';
import { API_ENDPOINTS } from './config';

// Types alinhados com o schema do banco de dados
export interface Departamento {
  codigo: string;
  nome: string;
  descricao?: string | null;
  gestor_funcionario_id?: string | null;
  ativo: boolean;
  inactivated_at?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface DepartamentoCreate {
  codigo: string;
  nome: string;
  descricao?: string | null;
  gestor_funcionario_id?: string | null;
}

export interface DepartamentoUpdate {
  nome?: string;
  descricao?: string | null;
  gestor_funcionario_id?: string | null;
}

export interface Cargo {
  codigo: string;  // PRIMARY KEY no schema
  nome: string;
  criado_em: string;
  atualizado_em: string;
}

export interface CargoCreate {
  codigo: string;  // Requer codigo como PK
  nome: string;
}

export interface CargoUpdate {
  nome?: string;
}

// Schema do banco: funcionarios referencia cargo_nome, não cargo_id
export interface Funcionario {
  id: string;
  auth_user_id?: string;
  cpf?: string;
  nome: string;
  email: string;
  departamento_id?: string | null;  // references departamentos(codigo)
  cargo_nome?: string | null;       // references cargos(nome) - não cargo_id!
  xp_total: number;
  nivel: string;
  ativo: boolean;
  inactivated_at?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface FuncionarioRegister {
  cpf?: string;
  nome: string;
  email: string;
  departamento_id?: string | null;
  cargo_nome?: string | null;      // Corrigido para cargo_nome
}

export interface UpdateRoleInput {
  role: 'ALUNO' | 'INSTRUTOR' | 'ADMIN' | 'GERENTE';
}

export interface ResetPasswordInput {
  email: string;
}

export interface ResetPasswordResponse {
  sucesso: boolean;
}

// Hooks para Departamentos
export function useDepartamentos() {
  return useQuery<Departamento[]>({
    queryKey: ['users', 'departamentos'],
    queryFn: () => authGet<Departamento[]>(`${API_ENDPOINTS.USERS}/departamentos`)
  });
}

export function useCreateDepartamento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'departamentos', 'create'],
    mutationFn: (input: DepartamentoCreate) =>
      authPost<Departamento>(`${API_ENDPOINTS.USERS}/departamentos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] });
    }
  });
}

export function useUpdateDepartamento(codigo: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'departamentos', 'update', codigo],
    mutationFn: (input: DepartamentoUpdate) =>
      authPut<Departamento>(`${API_ENDPOINTS.USERS}/departamentos/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] });
    }
  });
}

export function useDeleteDepartamento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'departamentos', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.USERS}/departamentos/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'departamentos'] });
    }
  });
}

// Hooks para Cargos
export function useCargos() {
  return useQuery<Cargo[]>({
    queryKey: ['users', 'cargos'],
    queryFn: () => authGet<Cargo[]>(`${API_ENDPOINTS.USERS}/cargos`)
  });
}

export function useCreateCargo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'cargos', 'create'],
    mutationFn: (input: CargoCreate) =>
      authPost<Cargo>(`${API_ENDPOINTS.USERS}/cargos`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] });
    }
  });
}

export function useUpdateCargo(codigo: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'cargos', 'update', codigo],
    mutationFn: (input: CargoUpdate) =>
      authPut<Cargo>(`${API_ENDPOINTS.USERS}/cargos/${codigo}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] });
    }
  });
}

export function useDeleteCargo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'cargos', 'delete'],
    mutationFn: (codigo: string) =>
      authDelete(`${API_ENDPOINTS.USERS}/cargos/${codigo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'cargos'] });
    }
  });
}

// Hooks para Funcionários
export function useRegisterFuncionario() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'register'],
    mutationFn: (input: FuncionarioRegister) =>
      authPost<Funcionario>(`${API_ENDPOINTS.USERS}/register`, input)
  });
}

export function useFuncionarios() {
  return useQuery<Funcionario[]>({
    queryKey: ['users', 'funcionarios'],
    queryFn: () => authGet<Funcionario[]>(`${API_ENDPOINTS.USERS}/funcionarios`)
  });
}

export function useUpdateFuncionarioRole(funcionarioId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'role', funcionarioId],
    mutationFn: (input: UpdateRoleInput) =>
      authPut<Funcionario>(`${API_ENDPOINTS.USERS}/${funcionarioId}/role`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'funcionarios'] });
    }
  });
}

export function useResetPassword() {
  return useMutation({
    mutationKey: ['users', 'funcionarios', 'reset-password'],
    mutationFn: (input: ResetPasswordInput) =>
      authPost<ResetPasswordResponse>(`${API_ENDPOINTS.USERS}/reset-password`, input)
  });
}
