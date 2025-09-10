import React from 'react'
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

interface UserProgress {
  nivel_atual: number
  xp_atual: number
  xp_proximo_nivel: number
  progresso_nivel: number
  proximo_badge?: string
  badges_conquistados?: any[]
}

interface UserProfile {
  nome: string
  departamento_id: string
  nivel: string
}

interface EmployeeHeaderProps {
  perfil: UserProfile
  dashboardData: UserProgress
}

export default function EmployeeHeader({ perfil, dashboardData }: EmployeeHeaderProps) {
  const nivelAtual = dashboardData?.nivel_atual || 1
  const xpAtual = dashboardData?.xp_atual || 0
  const xp_proximo_nivel = dashboardData?.xp_proximo_nivel || 1000
  const progresso_nivel = dashboardData?.progresso_nivel || 0
  const badges = dashboardData?.badges_conquistados || []

  // Calcular quantos XP faltam para o próximo nível
  const xpFaltante = xp_proximo_nivel - xpAtual

  return (
    <Card sx={{ 
      width: '100%', 
      mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Avatar e Info do Usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              {(() => {
                const nomes = perfil?.nome?.split(' ') || []
                const primeiroNome = nomes[0]?.[0] || ''
                const ultimoNome = nomes[nomes.length - 1]?.[0] || ''
                return (primeiroNome + ultimoNome).toUpperCase()
              })()}
            </Avatar>
            
            <Box>
              <Typography variant='h4' fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                Olá, {perfil?.nome?.split(' ')[0] || 'Usuário'}!
              </Typography>
              <Typography variant='h6' sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                Nível {nivelAtual} - {perfil?.nivel}
              </Typography>
              <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Departamento: {perfil?.departamento_id}
              </Typography>
            </Box>
          </Box>

          {/* Progresso XP */}
          <Box sx={{ flex: 1, mx: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                Progresso XP
              </Typography>
              <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {xpAtual} / {xp_proximo_nivel} XP
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progresso_nivel} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#4caf50',
                  borderRadius: 4
                }
              }} 
            />
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, display: 'block' }}>
              Faltam {xpFaltante} XP para o próximo nível
            </Typography>
          </Box>

          {/* Badges e Conquistas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrophyIcon sx={{ color: '#ffd700' }} />
                <Typography variant='h6' fontWeight={700} sx={{ color: 'white' }}>
                  {badges.length}
                </Typography>
              </Box>
              <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Badges
              </Typography>
            </Box>

            {dashboardData?.proximo_badge && (
              <Chip
                icon={<WorkspacePremiumIcon />}
                label={`Próximo: ${dashboardData.proximo_badge}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '& .MuiChip-icon': { color: '#ffd700' }
                }}
              />
            )}

            {/* Ícones de ação */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <FlameIcon />
              </IconButton>
              <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <BellIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Badges conquistados (se houver) */}
        {badges.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 600 }}>
              Últimas Conquistas:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {badges.slice(0, 4).map((badge, index) => (
                <Chip
                  key={index}
                  label={`🏆 ${badge.nome || badge}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              ))}
              {badges.length > 4 && (
                <Chip
                  label={`+${badges.length - 4} mais`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}