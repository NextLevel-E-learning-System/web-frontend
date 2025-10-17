import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material'
import { MenuBookSharp, TimelineOutlined } from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/employee/EmployeeHeader'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard } from '@/api/users'
import QuickActionCard from '@/components/common/QuickActionCard'
import { VideogameAsset } from '@mui/icons-material'

// Função para calcular nível baseado no XP total
// Iniciante: 0-999, Intermediário: 1000-2999, Avançado: 3000+
function calcularNivel(xpTotal: number): number {
  if (xpTotal < 1000) return 1 // Iniciante
  if (xpTotal < 3000) return 2 // Intermediário
  return 3 // Avançado
}

// Função para calcular XP necessário para o próximo nível
function calcularXpProximoNivel(xpTotal: number): number {
  if (xpTotal < 1000) return 1000 // Próximo nível em 1000 XP
  if (xpTotal < 3000) return 3000 // Próximo nível em 3000 XP
  return 3000 // Já está no nível máximo
}

// Função para calcular progresso até o próximo nível (0-100%)
function calcularProgressoNivel(xpTotal: number): number {
  if (xpTotal < 1000) {
    // Iniciante: 0-999 XP
    return (xpTotal / 1000) * 100
  }
  if (xpTotal < 3000) {
    // Intermediário: 1000-2999 XP
    return ((xpTotal - 1000) / 2000) * 100
  }
  // Avançado: 3000+ XP (máximo)
  return 100
}

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

  // Calcular dados de progressão baseados no XP
  const xpTotal = usuario.xp_total || 0
  const nivelAtual = calcularNivel(xpTotal)
  const xpProximoNivel = calcularXpProximoNivel(xpTotal)
  const progressoNivel = calcularProgressoNivel(xpTotal)

  return (
    <DashboardLayout items={navigationItems}>
      <EmployeeHeader
        dashboardData={{
          xp_atual: xpTotal,
          nivel_atual: nivelAtual,
          progresso_nivel: progressoNivel,
          ranking_departamento: 0,
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
