import { ReactNode } from 'react'
import { Box, CircularProgress, Alert } from '@mui/material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'

interface DashboardWrapperProps {
  children: (data: any) => ReactNode
  customTitle?: string
  allowedTypes?: string[] // Tipos de dashboard permitidos
}

export default function DashboardWrapper({
  children,
  customTitle,
  allowedTypes,
}: DashboardWrapperProps) {
  const { title, navigationItems } = useDashboardLayout()
  const { dashboard, isLoading, error } = useDashboardCompleto()

  return (
    <DashboardLayout title={customTitle || title} items={navigationItems}>
      {isLoading ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      ) : error || !dashboard ? (
        <Alert severity='error'>
          Erro ao carregar dados do dashboard. Tente novamente.
          {error && <div>Erro: {error.toString()}</div>}
          <div>Dashboard type: {dashboard?.tipo_dashboard}</div>
        </Alert>
      ) : allowedTypes && !allowedTypes.includes(dashboard.tipo_dashboard) ? (
        <Alert severity='warning'>
          Dashboard não disponível para seu tipo de usuário.
        </Alert>
      ) : (
        children(dashboard)
      )}
    </DashboardLayout>
  )
}
