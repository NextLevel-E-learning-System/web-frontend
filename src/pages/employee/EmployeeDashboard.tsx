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
  Alert,
  CircularProgress,
} from '@mui/material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EmployeeHeader from '@/components/employee/EmployeeHeader'
import { DashboardAluno } from '@/api/users'
import { useNavigation } from '@/hooks/useNavigation'
import { useDashboardCompleto } from '@/api/users'

export default function EmployeeDashboard() {
  const [tab, setTab] = useState(0)
  const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useNavigation()

  // Type guard para garantir que é um dashboard de aluno
  const alunoData = dashboard?.tipo_dashboard === 'aluno' ? (dashboard as DashboardAluno) : null

  if (isLoading) {
    return (
      <DashboardLayout title='Página Inicial' items={navigationItems}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (error || !alunoData) {
    return (
      <DashboardLayout title='Dashboard do Aluno' items={navigationItems}>
        <Alert severity="error">
          Erro ao carregar dados do dashboard. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

  const { progressao, cursos, ranking, atividades_recentes } = alunoData

  return (
    <DashboardLayout title='Dashboard do Aluno' items={navigationItems}>
      <EmployeeHeader 
        dashboardData={{
          tipo_dashboard: alunoData.tipo_dashboard,
          xp_atual: progressao.xp_atual,
          nivel_atual: progressao.nivel_atual,
          progresso_nivel: progressao.progresso_nivel,
          ranking_departamento: ranking.posicao_departamento,
          xp_proximo_nivel: progressao.xp_proximo_nivel,
          badges_conquistados: progressao.badges_conquistados
        }} 
      />
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
                  {cursos.em_andamento.length > 0 ? (
                    cursos.em_andamento.map((c: any, index: number) => (
                      <ListItem
                        key={c.id || index}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography fontWeight={700}>
                          {c.titulo || c.title || c.nome || 'Curso sem título'}
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
                                width: `${c.progress || c.progresso || c.progresso_percentual || 0}%`,
                                height: 8,
                                bgcolor: 'primary.main',
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            {c.progress || c.progresso || c.progresso_percentual || 0}%
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
                  {cursos.concluidos.length > 0 ? (
                    cursos.concluidos.map((c: any, index: number) => (
                      <ListItem key={c.id || index}>
                        <ListItemText
                          primary={c.titulo || c.title || c.nome || 'Curso sem título'}
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
                {atividades_recentes.length > 0 ? (
                  atividades_recentes.map((a: any, index: number) => (
                    <ListItem key={a.id || index}>
                      <ListItemText
                        primary={a.text || a.descricao || a.titulo || 'Atividade'}
                        secondary={a.time || a.data || a.data_criacao || 'Recente'}
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
                Cursos Recomendados
              </Typography>
              <List dense>
                {cursos.recomendados.slice(0, 3).map((c: any, index: number) => (
                  <ListItem key={c.id || index}>
                    <ListItemText
                      primary={c.titulo || c.title || c.nome || 'Curso recomendado'}
                      secondary={c.categoria || 'Recomendado para você'}
                    />
                  </ListItem>
                ))}
                {cursos.recomendados.length === 0 && (
                  <Typography
                    color='text.secondary'
                    sx={{ p: 1, textAlign: 'center' }}
                  >
                    Nenhuma recomendação disponível
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}
