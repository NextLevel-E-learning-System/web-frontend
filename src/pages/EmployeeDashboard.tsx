import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  Grid,
} from '@mui/material'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/EmployeeHeader/EmployeeHeader'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SettingsIcon from '@mui/icons-material/Settings'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BookIcon from '@mui/icons-material/Book'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import GraduationCapIcon from '@mui/icons-material/School'
import { useDashboardCompleto } from '@/hooks/users'

export default function EmployeeDashboard() {
  const [tab, setTab] = useState(0)
  const { dashboard, perfil, isLoading } = useDashboardCompleto()

  const items: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/dashboard/funcionario',
    },
    {
      label: 'Catálogo de Cursos',
      icon: <AssignmentIcon />,
      href: '/catalogo',
    },
    { label: 'Meus Cursos', icon: <BookIcon />, href: '/meus-cursos' },
    { label: 'Conquistas', icon: <EmojiEventsIcon />, href: '/conquistas' },
    {
      label: 'Ranking',
      icon: <WorkspacePremiumIcon />,
      href: '/ranking',
    },
    {
      label: 'Certificados',
      icon: <GraduationCapIcon />,
      href: '/certificados',
    },
    { label: 'Configurações', icon: <SettingsIcon />, href: '/configuracoes' },
  ]

  // Extrair dados do dashboard (suporta estrutura com dashboard_data)
  const dashboardData = dashboard?.dashboard_data
  const cursosEmAndamento = dashboardData?.cursos_em_andamento || []
  const cursosConcluidos = dashboardData?.cursos_concluidos || []
  const timeline = dashboardData?.timeline || []

  return (
    <DashboardLayout title='Página Inicial' items={items}>
      <EmployeeHeader perfil={perfil} dashboardData={dashboardData} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ overflow: 'hidden' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant='fullWidth'
              sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
            >
              <Tab label='Em andamento' />
              <Tab label='Concluídos' />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <List>
                  {cursosEmAndamento.length > 0 ? (
                    cursosEmAndamento.map((c: any) => (
                      <ListItem
                        key={c.id}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography fontWeight={700}>
                          {c.titulo || c.title || c.nome}
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              bgcolor: 'grey.200',
                              borderRadius: 5,
                            }}
                          >
                            <Box
                              sx={{
                                width: `${c.progress || c.progresso || 0}%`,
                                height: 8,
                                bgcolor: 'primary.main',
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            {c.progress || c.progresso || 0}%
                          </Typography>
                          <Button size='small' variant='outlined'>
                            Continuar
                          </Button>
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Typography
                      color='text.secondary'
                      sx={{ p: 2, textAlign: 'center' }}
                    >
                      Nenhum curso em andamento
                    </Typography>
                  )}
                </List>
              )}
              {tab === 1 && (
                <List>
                  {cursosConcluidos.length > 0 ? (
                    cursosConcluidos.map((c: any) => (
                      <ListItem key={c.id}>
                        <ListItemText
                          primary={c.titulo || c.title || c.nome}
                          secondary={`Concluído em ${c.data_conclusao || 'Data não disponível'}`}
                        />
                        <Chip label='Concluído' color='success' size='small' />
                      </ListItem>
                    ))
                  ) : (
                    <Typography
                      color='text.secondary'
                      sx={{ p: 2, textAlign: 'center' }}
                    >
                      Você ainda não concluiu cursos.
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Typography fontWeight={700} gutterBottom>
                Atividades Recentes
              </Typography>
              <List dense>
                {timeline.length > 0 ? (
                  timeline.map((a: any) => (
                    <ListItem key={a.id}>
                      <ListItemText
                        primary={a.text || a.descricao}
                        secondary={a.time || a.data || 'Recente'}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    color='text.secondary'
                    sx={{ p: 1, textAlign: 'center' }}
                  >
                    Nenhuma atividade recente
                  </Typography>
                )}
              </List>
              <Divider sx={{ my: 1.5 }} />
              <Typography fontWeight={700} gutterBottom>
                Alertas
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary='Avaliação pendente: Módulo 2'
                    secondary='Prazo: hoje'
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}
