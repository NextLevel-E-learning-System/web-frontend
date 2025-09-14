import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
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
  const { dashboard, isLoading } = useDashboardCompleto()
  const location = useLocation()

  // Mostrar loading enquanto carrega dados de auth OU dashboard
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

  
  // Role permitido, mostrar conteúdo
  return <>{children}</>
}
