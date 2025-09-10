import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Não tentar novamente se for erro de autenticação
        if (error?.response?.status === 401) {
          return false
        }
        return failureCount < 2
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
})
