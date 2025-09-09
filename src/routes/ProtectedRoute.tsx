import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useDashboard } from '@/hooks/users'

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
  const { isLoggedIn, isLoading: authLoading } = useAuthCheck()
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard()
  const location = useLocation()

  // Se não estiver logado, redirecionar para login
  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Mostrar loading enquanto carrega dados
  if (authLoading || dashboardLoading) {
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
          <Typography variant='body1' color='text.secondary'>
            Carregando dashboard...
          </Typography>
        </Box>
      )
    )
  }

  // Se não conseguiu carregar dashboard, redirecionar para login
  if (!dashboard || !dashboard.tipo_dashboard) {
    return <Navigate to='/login' replace />
  }

  // Se não há roles específicos definidos, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Verificar se o role do usuário está permitido
  if (!allowedRoles.includes(dashboard.tipo_dashboard)) {
    // Redirecionar para o dashboard correto baseado no role
    switch (dashboard.tipo_dashboard) {
      case 'administrador':
        return <Navigate to='/dashboard/admin' replace />
      case 'instrutor':
        return <Navigate to='/dashboard/instrutor' replace />
      case 'funcionario':
      default:
        return <Navigate to='/dashboard' replace />
    }
  }

  // Role permitido, mostrar conteúdo
  return <>{children}</>
}
