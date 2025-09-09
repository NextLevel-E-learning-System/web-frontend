import { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Typography,
  Grid,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SchoolIcon from '@mui/icons-material/School'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GradeIcon from '@mui/icons-material/Grade'
import SettingsIcon from '@mui/icons-material/Settings'
import BookIcon from '@mui/icons-material/Book'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import GraduationCapIcon from '@mui/icons-material/School'
import { useDashboard } from '@/hooks/users'

const iconMap: Record<string, JSX.Element> = {
  book: <BookIcon />,
  'graduation-cap': <GraduationCapIcon />,
  trophy: <EmojiEventsIcon />,
  user: <AccountCircleIcon />,
  star: <WorkspacePremiumIcon />,
}

const courses = [
  { id: 1, title: 'Project Management Fundamentals', progress: 70 },
  { id: 2, title: 'Data Analytics Basics', progress: 45 },
  { id: 3, title: 'Leadership Skills Workshop', progress: 20 },
]

const activities = [
  { id: 1, text: "Concluído 'Módulo 3' do curso PM", time: 'Hoje' },
  { id: 2, text: "Ganhou 'Learner' badge", time: 'Ontem' },
  { id: 3, text: 'Participou do webinar de IA em Marketing', time: '2 dias' },
]

export default function EmployeeDashboard() {
  const [tab, setTab] = useState(0)
  const { data: dashboard, isLoading } = useDashboard()
  const items: NavItem[] = dashboard?.menu_operacoes?.map((op: any) => ({
    label: op.nome,
    icon: iconMap[op.icone] || <DashboardIcon />,
    href: op.url,
  })) ?? []

  return (
    <DashboardLayout title='Página Inicial' items={items}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar sx={{ width: 96, height: 96 }}>JD</Avatar>
                <Typography variant='h6' fontWeight={700}>
                  Jane Doe
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Marketing Team
                </Typography>
                <Box
                  sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}
                >
                  <CircularProgress
                    variant='determinate'
                    value={75}
                    size={90}
                    thickness={5}
                    color='primary'
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant='subtitle1' fontWeight={700}>
                      75%
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  color='warning'
                  variant='outlined'
                  icon={<StarIcon />}
                  label='Próxima badge: Innovator'
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ overflow: 'hidden' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant='fullWidth'
              sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
            >
              <Tab label='Em andamento' />
              <Tab label='Concluídos' />
              <Tab label='Disponíveis' />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <List>
                  {courses.map(c => (
                    <ListItem
                      key={c.id}
                      sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      <Typography fontWeight={700}>{c.title}</Typography>
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
                              width: `${c.progress}%`,
                              height: 8,
                              bgcolor: 'primary.main',
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          {c.progress}%
                        </Typography>
                        <Button size='small' variant='outlined'>
                          Continuar
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
              {tab === 1 && (
                <Typography color='text.secondary'>
                  Você ainda não concluiu cursos.
                </Typography>
              )}
              {tab === 2 && (
                <Typography color='text.secondary'>
                  Novos cursos serão exibidos aqui.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Typography fontWeight={700} gutterBottom>
                Atividades Recentes
              </Typography>
              <List dense>
                {activities.map(a => (
                  <ListItem key={a.id}>
                    <ListItemText primary={a.text} secondary={a.time} />
                  </ListItem>
                ))}
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
