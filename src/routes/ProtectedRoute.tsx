import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import {  useDashboardCompleto } from '@/hooks/users'

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
  const tipoDashboard = dashboard?.tipo_dashboard

  // Se não conseguiu carregar dashboard, redirecionar para login
  if (!dashboard || !tipoDashboard) {
    return <Navigate to='/login' replace />
  }

  // Se não há roles específicos definidos, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Mapear tipo_dashboard para role do sistema
  const userRole = tipoDashboard?.toUpperCase() // 'aluno' -> 'ALUNO', etc.

  // Verificar se o usuário tem uma das roles permitidas
  const hasPermission = allowedRoles.some(role => role === userRole)

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
