 
import {
  Box,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import{   MenuBook, WorkspacePremium, StarRate }from '@mui/icons-material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
 import DashboardLayout from '@/components/layout/DashboardLayout'
import { DashboardAluno } from '@/api/users'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import StatsCard from '@/components/common/StatCard'

export default function RankingPage() {
   const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()

  // Type guard para garantir que é um dashboard de aluno
  const alunoData =
    dashboard?.tipo_dashboard === 'aluno' ? (dashboard as DashboardAluno) : null
 

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

  if (error || !alunoData) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>
          Erro ao carregar dados. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

 

  return (
    <DashboardLayout items={navigationItems}>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatsCard
            label='Courses Enrolled'
            value='12'
            icon={<MenuBook />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatsCard
            label='Completed'
            value='8'
            icon={<WorkspacePremium />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatsCard
            label='Learning Time'
            value='42h'
            icon={<AccessTimeIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatsCard
            label='Average Rating'
            value='4.8'
            icon={<StarRate />}
          />
        </Grid>
      </Grid>

    </DashboardLayout>
  )
}
