import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  useLogin as useLoginAPI, 
  useLogout as useLogoutAPI, 
  useRefreshToken as useRefreshTokenAPI 
} from '@/api/auth';
import { 
  useRegisterFuncionario, 
  useResetPassword as useResetPasswordAPI 
} from '@/api/users';
import { setAccessToken, clearAccessToken, isTokenPersistent } from '@/api/http';
import { showToast } from '@/utils/toast';

// Types
export interface LoginCredentials {
  email: string;
  senha: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  cpf?: string;
  nome: string;
  email: string;
  departamento_id?: string | null;
  cargo_nome?: string | null;
}

export interface ResetPasswordData {
  email: string;
}

// Hook para login
export function useLogin() {
  const navigate = useNavigate();
  const loginAPI = useLoginAPI();
  
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (credentials: LoginCredentials) => {
      const { rememberMe = true, ...loginData } = credentials;
      const result = await loginAPI.mutateAsync(loginData);
      
      // Armazenar token baseado na preferência do usuário
      setAccessToken(result.accessToken, rememberMe);
      
      return result;
    },
    onSuccess: () => {
      showToast.success('Login realizado com sucesso!');
      // Redirecionar baseado na role do usuário
      // TODO: Implementar redirecionamento baseado em role
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('[useLogin] Erro:', error);
      showToast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  });
}

// Hook para logout
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutAPI = useLogoutAPI();
  
  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      try {
        await logoutAPI.mutateAsync();
      } catch (error) {
        // Mesmo se der erro na API, limpar dados locais
        console.warn('[useLogout] Erro na API, mas limpando dados locais:', error);
      }
      
      // Limpar token e cache
      clearAccessToken();
      queryClient.clear();
    },
    onSuccess: () => {
      showToast.success('Logout realizado com sucesso!');
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('[useLogout] Erro:', error);
      // Mesmo com erro, fazer logout local
      clearAccessToken();
      queryClient.clear();
      navigate('/login');
    }
  });
}

// Hook para registro
export function useRegister() {
  const registerAPI = useRegisterFuncionario();
  
  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (data: RegisterData) => {
      return await registerAPI.mutateAsync(data);
    },
    onSuccess: () => {
      showToast.success('Conta criada com sucesso! Verifique seu email para obter a senha.');
    },
    onError: (error: any) => {
      console.error('[useRegister] Erro:', error);
      showToast.error('Erro ao criar conta. Tente novamente.');
    }
  });
}

// Hook para reset de senha
export function useResetPassword() {
  const resetAPI = useResetPasswordAPI();
  
  return useMutation({
    mutationKey: ['auth', 'reset-password'],
    mutationFn: async (data: ResetPasswordData) => {
      return await resetAPI.mutateAsync(data);
    },
    onSuccess: () => {
      showToast.success('Se o email existir, uma nova senha foi enviada.');
    },
    onError: (error: any) => {
      console.error('[useResetPassword] Erro:', error);
      showToast.error('Erro ao processar solicitação. Tente novamente.');
    }
  });
}

// Hook para refresh token
export function useRefreshToken() {
  const refreshAPI = useRefreshTokenAPI();
  
  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: async () => {
      const result = await refreshAPI.mutateAsync();
      
      // Manter preferência de persistência
      const persistent = isTokenPersistent();
      setAccessToken(result.accessToken, persistent);
      
      return result;
    },
    onError: (error: any) => {
      console.error('[useRefreshToken] Erro:', error);
      clearAccessToken();
    }
  });
}
