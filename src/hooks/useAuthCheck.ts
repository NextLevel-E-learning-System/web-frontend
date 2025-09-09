import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAccessToken, setAccessToken, clearAccessToken } from '@/api/http'
import { apiGet } from '@/api/http'

interface AuthCheckResult {
  isLoggedIn: boolean
  isLoading: boolean
  user: any | null
}

// Hook para verificar se usuário está logado ao iniciar app
export function useAuthCheck(): AuthCheckResult {
  const [isLoading, setIsLoading] = useState(true)

  // Verificar token e buscar dados do usuário
  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'check'],
    queryFn: async () => {
      const token = getAccessToken()
      if (!token) {
        throw new Error('no_token')
      }

      // Tentar buscar dados do usuário
      // Se token expirou, o interceptor fará refresh automático
      return await apiGet('/users/v1/me')
    },
    enabled: !!getAccessToken(), // Só executa se tiver token
    retry: (failureCount, error: any) => {
      // Se erro for de autenticação, não tentar novamente
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  useEffect(() => {
    const token = getAccessToken()

    if (!token) {
      // Sem token = não logado
      setIsLoading(false)
      return
    }

    // Se tem token, aguardar verificação da query
    if (!isUserLoading) {
      if (error) {
        // Se deu erro (mesmo após refresh), limpar token
        console.log('[AuthCheck] Token inválido, limpando sessão')
        clearAccessToken()
      }
      setIsLoading(false)
    }
  }, [isUserLoading, error])

  return {
    isLoggedIn: !!user && !!getAccessToken(),
    isLoading,
    user,
  }
}
