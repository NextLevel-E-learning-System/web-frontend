// Configuração base da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// URLs específicas para cada microserviço
export const API_ENDPOINTS = {
  AUTH: '/auth/v1',
  USERS: '/users/v1', 
  NOTIFICATIONS: '/notifications/v1',
  COURSES: '/courses/v1',
  ASSESSMENTS: '/assessments/v1',
  PROGRESS: '/progress/v1',
  GAMIFICATION: '/gamification/v1'
} as const;

// Helper para criar URLs das APIs
export const createApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};

// Headers padrão para requisições autenticadas
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper para requisições GET autenticadas
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
};

// Helper para requisições POST/PUT/PATCH autenticadas
export const authenticatedRequest = async (
  url: string, 
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  body?: unknown
) => {
  return authenticatedFetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) })
  });
};
