import { useState } from 'react'
import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material'
import {
  MenuBook,
  WorkspacePremium,
  StarRate,
  MenuBookSharp,
  TimelineOutlined,
} from '@mui/icons-material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/employee/EmployeeHeader'
import { DashboardAluno } from '@/api/users'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import StatsCard from '@/components/common/StatCard'
import CourseProgressCard from '@/components/employee/CourseProgressCard'
import QuickActionCard from '@/components/common/QuickActionCard'
import { VideogameAsset } from '@mui/icons-material'

export default function EmployeeDashboard() {
  const [tab, setTab] = useState(0)
  const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()

  // Type guard para garantir que é um dashboard de aluno
  const alunoData =
    dashboard?.tipo_dashboard === 'aluno' ? (dashboard as DashboardAluno) : null

  console.log('Aluno data:', alunoData)

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
          Erro ao carregar dados do dashboard. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

  const {
    progressao,
    cursos,
    ranking,
    atividades_recentes = [],
  } = alunoData || {
    progressao: {},
    cursos: { em_andamento: [], concluidos: [], recomendados: [] },
    ranking: {},
    atividades_recentes: [],
  }

  return (
    <DashboardLayout items={navigationItems}>
      <EmployeeHeader
        dashboardData={{
          tipo_dashboard: alunoData?.tipo_dashboard || 'aluno',
          xp_atual: progressao?.xp_atual || 0,
          nivel_atual:
            typeof progressao?.nivel_atual === 'number'
              ? progressao.nivel_atual
              : 1,
          progresso_nivel: progressao?.progresso_nivel || 0,
          ranking_departamento: ranking?.posicao_departamento || 0,
          xp_proximo_nivel: progressao?.xp_proximo_nivel || 100,
          badges_conquistados: progressao?.badges_conquistados || [],
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
            to='/gamificacao'
            button='Ver ranking'
            icon={<VideogameAsset color='primary' />}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 4,
          mb: 2,
        }}
      >
        <Typography variant='h6' fontWeight={800}>
          Continue Learning
        </Typography>
        <Typography
          variant='body2'
          color='primary.main'
          sx={{ cursor: 'pointer' }}
        >
          View all courses
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseProgressCard
            title='React Fundamentals'
            description='Master the basics of React and build modern web applications.'
            progress={75}
            timeLeft='3h left'
            gradientFrom='#6366f1'
            gradientTo='#06b6d4'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseProgressCard
            title='Node.js Backend'
            description='Build scalable backend applications with Node.js and Express.'
            progress={45}
            timeLeft='8h left'
            gradientFrom='#22c55e'
            gradientTo='#0ea5e9'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseProgressCard
            title='UI/UX Design'
            description='Design principles and create beautiful user interfaces.'
            progress={20}
            timeLeft='12h left'
            gradientFrom='#f97316'
            gradientTo='#ef4444'
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}
