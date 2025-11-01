import { useMemo } from 'react'
import { Box, Card, Chip, LinearProgress, Typography } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useDashboardCompleto } from '@/api/users'
import { useMyGamificationProfile } from '@/api/gamification'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

interface EmployeeHeaderProps {
  dashboardData: {
    xp_atual: number
    nivel_atual: string
    proximo_nivel?: string
    progresso_nivel: number
    ranking_departamento?: number
    xp_proximo_nivel?: number
    badges_conquistados?: any[]
    cursos_concluidos?: number
  }
}

export default function EmployeeHeader({ dashboardData }: EmployeeHeaderProps) {
  const nivelAtual = dashboardData?.nivel_atual || 'Iniciante'
  const xpAtual = dashboardData?.xp_atual || 0
  const xpProximoNivel = dashboardData?.xp_proximo_nivel || 1000
  const progressoNivel = dashboardData?.progresso_nivel || 0
  const { perfil } = useDashboardCompleto()

  // Buscar badges do gamification service
  const { data: gamificationProfile } = useMyGamificationProfile()
  const badges = gamificationProfile?.badges || []

  // Calcular quantos XP faltam para o próximo nível
  const xpFaltante = xpProximoNivel - xpAtual

  const name = useMemo(() => {
    if (!perfil?.nome) return ''
    const partes = perfil.nome.trim().split(' ')
    return `${partes[0]}`.toUpperCase()
  }, [perfil?.nome])

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        bgcolor: 'rgba(255,255,255,.8)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,.2)',
        boxShadow: '0 10px 30px rgba(2,6,23,.06)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg,#1E88E5,#7E57C2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Olá {name}!
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 0.5 }}>
            Nível {nivelAtual}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationDropdown />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant='body2' fontWeight={600}>
              Progresso
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {xpAtual} XP
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={progressoNivel}
            sx={{ height: 8, borderRadius: 999 }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 0.5, display: 'block' }}
          >
            Faltam {xpFaltante}xp para o próximo nível
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
          <Chip variant='outlined' label={`${badges.length} Badges`} />
        </Box>
      </Box>
    </Card>
  )
}
