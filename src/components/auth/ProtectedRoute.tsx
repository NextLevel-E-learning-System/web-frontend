import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDashboard } from '@/hooks/users'
import { getAccessToken } from '@/api/http'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export default function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const token = getAccessToken()
  const { data: dashboard, isLoading } = useDashboard()

  if (!token) return <Navigate to='/login' replace />
  if (isLoading) return fallback || null
  if (!dashboard || !dashboard.tipo_dashboard) return <Navigate to='/login' replace />
  if (!allowedRoles.includes(dashboard.tipo_dashboard)) {
    // Redireciona para o dashboard correto
    if (dashboard.tipo_dashboard === 'administrador') return <Navigate to='/admin' replace />
    if (dashboard.tipo_dashboard === 'instrutor') return <Navigate to='/instrutor' replace />
    return <Navigate to='/dashboard' replace />
  }
  return <>{children}</>
}
