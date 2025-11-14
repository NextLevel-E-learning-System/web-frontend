// Configuração base da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// URLs específicas para cada microserviço
export const API_ENDPOINTS = {
  AUTH: '/auth/v1',
  USERS: '/users/v1',
  NOTIFICATIONS: '/notifications/v1',
  COURSES: '/courses/v1',
  ASSESSMENTS: '/assessments/v1',
  PROGRESS: '/progress/v1',
  GAMIFICATION: '/gamification/v1',
} as const
