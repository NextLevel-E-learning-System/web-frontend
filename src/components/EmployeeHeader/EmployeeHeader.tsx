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
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { PerfilUsuario, DashboardData } from '@/hooks/users'

interface EmployeeHeaderProps {
  perfil: PerfilUsuario
  dashboardData: DashboardData
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
      <Card sx={{ p: 3, mb: 3, bgcolor: "rgba(255,255,255,.8)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.2)", boxShadow: "0 10px 30px rgba(2,6,23,.06)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: "linear-gradient(90deg,#1E88E5,#7E57C2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
               Olá, {perfil?.nome?.split(' ')[0]}!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}> Nível {nivelAtual} - {perfil?.nivel}</Typography>
          </Box>
          
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>Progresso</Typography>
              <Typography variant="body2" color="text.secondary">{xpAtual} XP</Typography>
            </Box>
            <LinearProgress variant="determinate" value={xpAtual} sx={{ height: 8, borderRadius: 999 }} />
          <Typography variant='caption'color="text.secondary" sx={{   mt: 0.5, display: 'block' }}>
              Faltam {xpFaltante} XP para o próximo nível
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmojiEventsIcon sx={{ color: "#F59E0B" }} />
            <Chip variant="outlined" label={`${badges.length} Badges`} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {badges.slice(0, 3).map((badge, i) => (
            <Chip key={i} variant="outlined" size="small" label={`🏆 ${badge}`} />
          ))}
          {badges.length > 3 && (
            <Chip variant="outlined" size="small" label={`+${badges.length - 3} more`} />
          )}
        </Box>
      </Card>
  )
}