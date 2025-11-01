import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material'
import { MenuBookSharp, TimelineOutlined } from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/employee/EmployeeHeader'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard } from '@/api/users'
import QuickActionCard from '@/components/common/QuickActionCard'
import { VideogameAsset } from '@mui/icons-material'

function obterProximoNivel(nivelAtual: string): string {
  if (nivelAtual === 'Iniciante') return 'Intermediário'
  if (nivelAtual === 'Intermediário') return 'Avançado'
  return 'Avançado'
}

// Iniciante: 0-999, Intermediário: 1000-2999, Avançado: 3000+
function calcularXpProximoNivel(xpTotal: number): number {
  if (xpTotal < 1000) return 1000
  if (xpTotal < 3000) return 3000
  return 3000
}

function calcularProgressoNivel(xpTotal: number): number {
  if (xpTotal < 1000) {
    return (xpTotal / 1000) * 100
  }
  if (xpTotal < 3000) {
    return ((xpTotal - 1000) / 2000) * 100
  }
  return 100
}

export default function EmployeeDashboard() {
  const { data: dashboardResponse, isLoading, error } = useDashboard()
  const { navigationItems } = useDashboardLayout()

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

  const xpTotal = usuario.xp_total || 0
  const nivelAtual = usuario.nivel || 'Iniciante'
  const proximoNivel = obterProximoNivel(nivelAtual)
  const xpProximoNivel = calcularXpProximoNivel(xpTotal)
  const progressoNivel = calcularProgressoNivel(xpTotal)

  return (
    <DashboardLayout items={navigationItems}>
      <EmployeeHeader
        dashboardData={{
          xp_atual: xpTotal,
          nivel_atual: nivelAtual,
          proximo_nivel: proximoNivel,
          progresso_nivel: progressoNivel,
          xp_proximo_nivel: xpProximoNivel,
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
