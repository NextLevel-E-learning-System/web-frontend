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
      console.log('[AuthCheck] Verificando token:', !!token)
      if (!token) {
        throw new Error('no_token')
      }

      // Tentar buscar dados do usuário
      // Se token expirou, o interceptor fará refresh automático
      const userData = await apiGet('/users/v1/me')
      console.log('[AuthCheck] Usuário logado:', userData)
      return userData
    },
    enabled: !!getAccessToken(), // Só executa se tiver token
    retry: (failureCount, error: any) => {
      // Se erro for de autenticação, não tentar novamente
      if (error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 0, // Sempre revalidar
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    // Se não tem token, marcar como não logado
    if (!getAccessToken()) {
      setIsLoading(false)
      return
    }

    // Se tem token e a query terminou (com sucesso ou erro)
    if (!isUserLoading) {
      if (error) {
        console.log('[AuthCheck] Token inválido, limpando sessão')
        clearAccessToken()
      }
      setIsLoading(false)
    }
  }, [isUserLoading, error])

  const isLoggedIn = !!user && !!getAccessToken()
  
  console.log('[AuthCheck] Estado final:', { 
    isLoggedIn, 
    isLoading, 
    hasUser: !!user, 
    hasToken: !!getAccessToken(),
    isUserLoading 
  })

  return {
    isLoggedIn,
    isLoading,
    user,
  }
}
