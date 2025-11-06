import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

// Componente avançado com validação de roles
export function ProtectedRoute({
  children,
  allowedRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    return (
      fallback || (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='100vh'
          gap={2}
        >
          <CircularProgress size={48} />
        </Box>
      )
    )
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    console.log(
      '[ProtectedRoute] Usuário não autenticado, redirecionando para login'
    )
    return <Navigate to='/login' replace />
  }

  // Se não há roles específicos definidos, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Pegar role do usuário autenticado
  const userRole = user.role

  // Verificar se o usuário tem uma das roles permitidas
  const hasPermission = allowedRoles.includes(userRole)

  if (!hasPermission) {
    console.log(
      `[ProtectedRoute] Usuário ${userRole} não tem permissão para acessar. Roles permitidas:`,
      allowedRoles
    )

    // Redirecionar para dashboard apropriado baseado na role do usuário
    switch (userRole) {
      case 'FUNCIONARIO':
        return <Navigate to='/dashboard/funcionario' replace />
      case 'INSTRUTOR':
        return <Navigate to='/dashboard/instrutor' replace />
      case 'ADMIN':
      case 'GERENTE':
        return <Navigate to='/dashboard/admin' replace />
      default:
        return <Navigate to='/login' replace />
    }
  }

  // Role permitido, mostrar conteúdo
  console.log(`[ProtectedRoute] Acesso permitido para ${userRole}`)
  return <>{children}</>
}
