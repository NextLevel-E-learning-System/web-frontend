import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material'
import { MenuBookSharp, TimelineOutlined } from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/employee/EmployeeHeader'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard } from '@/api/users'
import QuickActionCard from '@/components/common/QuickActionCard'
import { VideogameAsset } from '@mui/icons-material'

export default function EmployeeDashboard() {
  const { data: dashboardResponse, isLoading, error } = useDashboard()
  const { navigationItems } = useDashboardLayout()

  // Para ALUNO, apenas temos dados do usuário
  const usuario = dashboardResponse?.usuario

  if (isLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (error || !usuario) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>
          Erro ao carregar dados do dashboard. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <EmployeeHeader
        dashboardData={{
          xp_atual: usuario.xp_total || 0,
          nivel_atual: 1, // Pode ser calculado baseado no XP
          progresso_nivel: 0,
          ranking_departamento: 0,
          xp_proximo_nivel: 100,
          badges_conquistados: [],
        }}
      />

      <Typography variant='h6' fontWeight={800} sx={{ mt: 4, mb: 2 }}>
        Ações Rápidas
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickActionCard
            title='Explorar Cursos'
            description='Descubra novos cursos e desenvolva suas habilidades com conteúdos selecionados.'
            to='/cursos'
            button='Ver Cursos'
            icon={<MenuBookSharp color='primary' />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickActionCard
            title='Meu Progresso'
            description='Acompanhe sua evolução e veja quanto falta para concluir cada curso.'
            to='/meu-progresso'
            button='Ver Progresso'
            icon={<TimelineOutlined color='success' />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickActionCard
            title='Gamificação'
            description='Rankings totais de participação e pontuação'
            to='/ranking'
            button='Ver ranking'
            icon={<VideogameAsset color='primary' />}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}
