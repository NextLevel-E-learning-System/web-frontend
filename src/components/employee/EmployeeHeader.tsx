import React, { useMemo } from 'react'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Typography,
  Badge,
  IconButton,
} from '@mui/material'
import {
  WorkspacePremium as WorkspacePremiumIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FlameIcon,
  NotificationsOutlined as BellIcon,
} from '@mui/icons-material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useMeuPerfil } from '@/api/users'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

interface EmployeeHeaderProps {
  dashboardData: {
    tipo_dashboard?: string
    xp_atual: number
    nivel_atual: number
    progresso_nivel: number
    ranking_departamento?: number
    xp_proximo_nivel?: number
    badges_conquistados?: any[]
    cursos_concluidos?: number
  }
}

export default function EmployeeHeader({ dashboardData }: EmployeeHeaderProps) {
  const nivelAtual = dashboardData?.nivel_atual || 1
  const xpAtual = dashboardData?.xp_atual || 0
  const xpProximoNivel =
    dashboardData?.xp_proximo_nivel || (nivelAtual + 1) * 1000
  const progressoNivel = dashboardData?.progresso_nivel || 0
  const badges = dashboardData?.badges_conquistados || []
  const cursosConcluido = dashboardData?.cursos_concluidos || 0
  const { data: perfil } = useMeuPerfil()

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalFireDepartmentIcon sx={{ color: '#F97316' }} />
            <Typography fontWeight={600}>{cursosConcluido}</Typography>
          </Box>
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
              Progresso para o Nível {nivelAtual + 1}
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
            Faltam {xpFaltante} XP para o próximo nível
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
          <Chip variant='outlined' label={`${badges.length} Badges`} />
        </Box>
      </Box>

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        {badges.slice(0, 3).map((badge: any, i: number) => (
          <Chip
            key={i}
            variant='outlined'
            size='small'
            label={`🏆 ${badge.nome || badge}`}
          />
        ))}
        {badges.length > 3 && (
          <Chip
            variant='outlined'
            size='small'
            label={`+${badges.length - 3} mais`}
          />
        )}
        {badges.length === 0 && (
          <Typography variant='caption' color='text.secondary'>
            Nenhum badge conquistado ainda
          </Typography>
        )}
      </Box>
    </Card>
  )
}
