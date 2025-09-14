import { createApiUrl, authenticatedRequest, authenticatedFetch } from './config';

// Tipos para Auth Service
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInHours: number;
}

export interface LogoutResponse {
  sucesso: boolean;
}

// Auth Service API - /auth/v1/*
export const authApi = {
  // POST /auth/v1/login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(createApiUrl('/auth/v1/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error('Credenciais inválidas');
    }
    
    return response.json();
  },

  // POST /auth/v1/logout
  logout: async (): Promise<LogoutResponse> => {
    const response = await authenticatedRequest(
      createApiUrl('/auth/v1/logout'),
      'POST'
    );
    
    if (!response.ok) {
      throw new Error('Erro ao fazer logout');
    }
    
    return response.json();
  },

  // POST /auth/v1/refresh
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await fetch(createApiUrl('/auth/v1/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    
    return response.json();
  }
};
