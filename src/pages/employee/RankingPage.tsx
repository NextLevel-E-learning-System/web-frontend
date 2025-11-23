import {
  Box,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Tabs,
  Tab
} from '@mui/material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useGlobalRanking, useMonthlyRanking } from '@/api/gamification'
import LeaderboardTop from '@/components/common/LeaderboardTop'
import RankingTable, { type RankItem } from '@/components/common/RankingTable'
import { useState, useMemo } from 'react'

export default function RankingPage() {
  const [tab, setTab] = useState(0)
  const { navigationItems } = useDashboardLayout()

  // Buscar rankings da API
  const {
    data: globalRankingData,
    isLoading: globalLoading,
    error: globalError
  } = useGlobalRanking()
  const {
    data: monthlyRankingData,
    isLoading: monthlyLoading,
    error: monthlyError
  } = useMonthlyRanking()

  const isLoading = tab === 0 ? globalLoading : monthlyLoading
  const error = tab === 0 ? globalError : monthlyError

  // Transformar dados da API para o formato do componente
  const globalRanking = useMemo(() => {
    if (!globalRankingData) return []
    return globalRankingData.map((entry, index) => ({
      rank: entry.posicao || index + 1,
      name: entry.nome,
      points: entry.xp,
      change: 0, // TODO: calcular mudança de posição comparando com ranking anterior
      avatarColor: getAvatarColor(index)
    }))
  }, [globalRankingData])

  const monthlyRanking = useMemo(() => {
    if (!monthlyRankingData) return []
    return monthlyRankingData.map((entry, index) => ({
      rank: entry.posicao || index + 1,
      name: entry.nome,
      points: entry.xpMes,
      change: 0, // TODO: calcular mudança de posição comparando com mês anterior
      avatarColor: getAvatarColor(index)
    }))
  }, [monthlyRankingData])

  const ranking = tab === 0 ? globalRanking : monthlyRanking
  const top3: [RankItem, RankItem, RankItem] = [
    ranking[0] || {
      rank: 1,
      name: '-',
      points: 0,
      change: 0,
      avatarColor: '#60a5fa'
    },
    ranking[1] || {
      rank: 2,
      name: '-',
      points: 0,
      change: 0,
      avatarColor: '#f472b6'
    },
    ranking[2] || {
      rank: 3,
      name: '-',
      points: 0,
      change: 0,
      avatarColor: '#34d399'
    }
  ]

  function getAvatarColor(index: number): string {
    const colors = [
      '#60a5fa',
      '#f472b6',
      '#34d399',
      '#a78bfa',
      '#fb923c',
      '#38bdf8',
      '#86efac',
      '#fca5a5',
      '#fde68a',
      '#93c5fd'
    ]
    return colors[index % colors.length]
  }

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

  if (error) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>Erro ao carregar dados. Tente novamente.</Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Box>
            <Typography variant='h5' fontWeight={800}>
              Ranking de Gamificação
            </Typography>
            <Typography color='text.secondary'>
              Veja o ranking dos funcionários por pontuação total (geral) e do
              mês atual (mensal).
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_e, val) => setTab(val)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label='Ranking Geral' />
          <Tab label='Ranking Mensal' />
        </Tabs>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <LeaderboardTop top3={top3} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <RankingTable rows={ranking} />
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
