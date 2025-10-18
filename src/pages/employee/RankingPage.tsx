import { Box, Grid, Alert, CircularProgress, Typography } from '@mui/material'
import { MenuBook, WorkspacePremium, StarRate } from '@mui/icons-material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import StatsCard from '@/components/common/StatCard'
import TimeRangeToggle, {
  type TimeRange,
} from '@/components/common/TimeRangeToggle'
import LeaderboardTop from '@/components/common/LeaderboardTop'
import RankingTable, { type RankItem } from '@/components/common/RankingTable'
import { useState } from 'react'

export default function RankingPage() {
  const geralTop: [RankItem, RankItem, RankItem] = [
    {
      rank: 1,
      name: 'Ana Silva',
      points: 12450,
      change: 3,
      avatarColor: '#60a5fa',
    },
    {
      rank: 2,
      name: 'Lucas Lima',
      points: 11890,
      change: 1,
      avatarColor: '#f472b6',
    },
    {
      rank: 3,
      name: 'Marcos Souza',
      points: 11210,
      change: -1,
      avatarColor: '#34d399',
    },
  ]

  const geralRows: RankItem[] = [
    ...geralTop,
    {
      rank: 4,
      name: 'Beatriz Rocha',
      points: 10800,
      change: 2,
      avatarColor: '#a78bfa',
    },
    {
      rank: 5,
      name: 'Pedro Alves',
      points: 10320,
      change: 0,
      avatarColor: '#fb923c',
    },
    {
      rank: 6,
      name: 'João Pedro',
      points: 9980,
      change: -2,
      avatarColor: '#38bdf8',
    },
    {
      rank: 7,
      name: 'Carla Dias',
      points: 9650,
      change: 1,
      avatarColor: '#86efac',
    },
    {
      rank: 8,
      name: 'Rafaela Nunes',
      points: 9340,
      change: 0,
      avatarColor: '#fca5a5',
    },
    {
      rank: 9,
      name: 'Felipe Santos',
      points: 9100,
      change: 4,
      avatarColor: '#fde68a',
    },
    {
      rank: 10,
      name: 'Gustavo Melo',
      points: 8890,
      change: -1,
      avatarColor: '#93c5fd',
    },
  ]

  const mensalTop: [RankItem, RankItem, RankItem] = [
    {
      rank: 1,
      name: 'Ana Silva',
      points: 2150,
      change: 1,
      avatarColor: '#60a5fa',
    },
    {
      rank: 2,
      name: 'Beatriz Rocha',
      points: 1980,
      change: 2,
      avatarColor: '#a78bfa',
    },
    {
      rank: 3,
      name: 'Pedro Alves',
      points: 1840,
      change: -1,
      avatarColor: '#fb923c',
    },
  ]

  const mensalRows: RankItem[] = [
    ...mensalTop,
    {
      rank: 4,
      name: 'Lucas Lima',
      points: 1710,
      change: -2,
      avatarColor: '#f472b6',
    },
    {
      rank: 5,
      name: 'Rafaela Nunes',
      points: 1620,
      change: 3,
      avatarColor: '#fca5a5',
    },
    {
      rank: 6,
      name: 'Marcos Souza',
      points: 1555,
      change: 0,
      avatarColor: '#34d399',
    },
    {
      rank: 7,
      name: 'Carla Dias',
      points: 1490,
      change: 2,
      avatarColor: '#86efac',
    },
    {
      rank: 8,
      name: 'Felipe Santos',
      points: 1410,
      change: -1,
      avatarColor: '#fde68a',
    },
    {
      rank: 9,
      name: 'Gustavo Melo',
      points: 1390,
      change: 0,
      avatarColor: '#93c5fd',
    },
    {
      rank: 10,
      name: 'João Pedro',
      points: 1325,
      change: 1,
      avatarColor: '#38bdf8',
    },
  ]
  const [tab, setTab] = useState(0)
  const top = tab === 0 ? geralTop : mensalTop
  const rows = tab === 0 ? geralRows : mensalRows
  const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()

  // Type guard para garantir que é um dashboard de aluno
  const alunoData =
    dashboard?.tipo_dashboard === 'aluno' ? (dashboard as any) : null

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
        <Alert severity='error'>Erro ao carregar dados. Tente novamente.</Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant='h5' fontWeight={800}>
              Ranking de Gamificação
            </Typography>
            <Typography color='text.secondary'>
              Veja o ranking dos alunos por pontuação total (geral) e do mês
              atual (mensal).
            </Typography>
          </Box>
          <TimeRangeToggle
            value={'all'}
            onChange={function (value: TimeRange): void {
              throw new Error('Function not implemented.')
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <LeaderboardTop top3={[top[0], top[1], top[2]]} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <RankingTable rows={rows} />
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
