import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { School, People, CheckCircle, Assignment } from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricCard from '@/components/common/StatCard'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard, type DashboardInstrutor } from '@/api/users'

export default function InstrutorDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardData, isLoading, error } = useDashboard()

  // Type guard para garantir que é um dashboard de instrutor
  const instrutorData =
    dashboardData?.dashboard?.tipo_dashboard === 'instrutor'
      ? (dashboardData.dashboard as DashboardInstrutor)
      : null

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

  if (error || !instrutorData) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>
          Erro ao carregar dados do dashboard. Tente novamente.
        </Alert>
      </DashboardLayout>
    )
  }

  const { metricas, cursos } = instrutorData || { metricas: {}, cursos: [] }

  return (
    <DashboardLayout items={navigationItems}>
      <Box
        sx={{
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Métricas Principais */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<School />}
              value={metricas.total_cursos?.toString() || '0'}
              label='Total de Cursos'
              trendLabel='Cursos criados'
              trendDirection='neutral'
              iconColor='#1976d2'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<People />}
              value={metricas.total_alunos?.toString() || '0'}
              label='Total de Alunos'
              trendLabel='Alunos inscritos'
              trendDirection='up'
              iconColor='#0288d1'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<CheckCircle />}
              value={`${metricas.taxa_conclusao_geral?.toFixed(1) || '0'}%`}
              label='Taxa de Conclusão'
              trendLabel='Performance geral'
              trendDirection={
                (metricas.taxa_conclusao_geral || 0) >= 75
                  ? 'up'
                  : (metricas.taxa_conclusao_geral || 0) >= 50
                    ? 'neutral'
                    : 'down'
              }
              iconColor='#2e7d32'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<Assignment />}
              value={metricas.pendentes_correcao?.toString() || '0'}
              label='Avaliações Pendentes'
              trendLabel='Pendentes de correção'
              trendDirection={
                (metricas.pendentes_correcao || 0) === 0
                  ? 'up'
                  : (metricas.pendentes_correcao || 0) <= 5
                    ? 'neutral'
                    : 'down'
              }
              iconColor='#ed6c02'
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Lista de Cursos */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <CardContent>
                <Typography fontWeight={700} gutterBottom variant='h6'>
                  Meus Cursos ({cursos.length})
                </Typography>
                {cursos.length > 0 ? (
                  <List>
                    {cursos.map((curso, index) => (
                      <ListItem
                        key={curso.codigo}
                        divider={index < cursos.length - 1}
                      >
                        <ListItemText
                          primary={
                            <Box
                              display='flex'
                              alignItems='center'
                              gap={1}
                              sx={{ flexWrap: 'wrap' }}
                            >
                              <Typography fontWeight={600}>
                                {curso.titulo}
                              </Typography>
                              <Chip
                                label={curso.status}
                                size='small'
                                color={
                                  curso.status === 'Ativo'
                                    ? 'success'
                                    : 'default'
                                }
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {curso.inscritos} inscritos • {curso.concluidos}{' '}
                                concluídos • {curso.taxa_conclusao.toFixed(1)}%
                                taxa de conclusão
                              </Typography>
                              {curso.avaliacao_media && (
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  Avaliação média:{' '}
                                  {curso.avaliacao_media.toFixed(1)}/5
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    color='text.secondary'
                    sx={{ textAlign: 'center', py: 3 }}
                  >
                    Nenhum curso criado ainda.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
