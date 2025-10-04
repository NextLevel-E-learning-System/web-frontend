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
import DashboardLayout from '@/components/layout/DashboardLayout'
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
            <Card>
              <CardContent>
                <Typography variant='h4' fontWeight={700} color='primary'>
                  {metricas.total_cursos}
                </Typography>
                <Typography color='text.secondary'>Total de Cursos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant='h4' fontWeight={700} color='info.main'>
                  {metricas.total_alunos}
                </Typography>
                <Typography color='text.secondary'>Total de Alunos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant='h4' fontWeight={700} color='success.main'>
                  {metricas.taxa_conclusao_geral.toFixed(1)}%
                </Typography>
                <Typography color='text.secondary'>
                  Taxa de Conclusão
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant='h4' fontWeight={700} color='warning.main'>
                  {metricas.pendentes_correcao}
                </Typography>
                <Typography color='text.secondary'>
                  Avaliações Pendentes
                </Typography>
              </CardContent>
            </Card>
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
