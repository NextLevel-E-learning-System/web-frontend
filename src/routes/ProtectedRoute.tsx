import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useDashboardCompleto } from '@/api/users'

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
  const { dashboard, isLoading, perfil } = useDashboardCompleto()

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

  // Se não conseguiu carregar dados, redirecionar para login
  if (!dashboard || !perfil) {
    return <Navigate to='/login' replace />
  }

  // Se não há roles específicos definidos, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Pegar role diretamente dos dados do usuário (vem do JWT)
  const userRole = perfil.roles?.[0] || 'ALUNO'

  // Verificar se o usuário tem uma das roles permitidas
  const hasPermission = allowedRoles.includes(userRole)

  if (!hasPermission) {
    // Redirecionar para dashboard apropriado baseado na role do usuário
    switch (userRole) {
      case 'ALUNO':
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
  return <>{children}</>
}
