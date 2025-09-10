import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useDashboard, useDashboardCompleto } from '@/hooks/users'

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
  const { dashboard, isLoading } = useDashboardCompleto()
  const location = useLocation()

  // Mostrar loading enquanto carrega dados de auth OU dashboard
  if (authLoading || isLoading) {
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

  // Se não estiver logado, redirecionar para login
  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // Extrair tipo_dashboard da estrutura da resposta
  const tipoDashboard = dashboard?.dashboard_data?.tipo_dashboard

  // Se não conseguiu carregar dashboard, redirecionar para login
  if (!dashboard || !tipoDashboard) {
    return <Navigate to='/login' replace />
  }

    // Se não há roles específicos definidos, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Verificar se o role do usuário está permitido
  if (!allowedRoles.includes(tipoDashboard)) {
    // Redirecionar para o dashboard correto baseado no role
    switch (tipoDashboard) {
      case 'administrador':
        return <Navigate to='/dashboard/admin' replace />
      case 'instrutor':
        return <Navigate to='/dashboard/instrutor' replace />
      case 'funcionario':
      default:
        return <Navigate to='/dashboard/funcionario' replace />
    }
  }

  // Role permitido, mostrar conteúdo
  return <>{children}</>
}
