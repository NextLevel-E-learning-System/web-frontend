import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

// Mapa de redirecionamento por role
const ROLE_REDIRECTS: Record<string, string> = {
  FUNCIONARIO: '/dashboard/funcionario',
  INSTRUTOR: '/dashboard/instrutor',
  ADMIN: '/dashboard/admin',
  GERENTE: '/dashboard/admin',
}

const getRedirectByRole = (role: string) =>
  ROLE_REDIRECTS[role] || '/dashboard/funcionario'

export function ProtectedRoute({
  children,
  allowedRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      fallback || (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='center'
          minHeight='100vh'
        >
          <CircularProgress size={48} />
        </Box>
      )
    )
  }

  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Não autenticado, redirecionando para login')
    return <Navigate to='/login' replace />
  }

  // Sem restrição de roles, permitir acesso
  if (allowedRoles.length === 0) {
    return <>{children}</>
  }

  // Verificar permissão
  const hasPermission = allowedRoles.includes(user.role)

  if (!hasPermission) {
    const redirect = getRedirectByRole(user.role)
    console.log(
      `[ProtectedRoute] ${user.role} sem permissão, redirecionando para ${redirect}`
    )
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}
