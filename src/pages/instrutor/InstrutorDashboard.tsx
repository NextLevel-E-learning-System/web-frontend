import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Table,
  Paper,
  TableHead,
} from '@mui/material'
import { School, People, CheckCircle, Assignment } from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricCard from '@/components/common/StatCard'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard, type DashboardInstrutor } from '@/api/users'

export default function InstrutorDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardData, isLoading, error } = useDashboard()

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
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Meus Cursos ({cursos.length})
              </Typography>
              {cursos.length > 0 ? (
                <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Curso</TableCell>
                        <TableCell align='right'>Inscrições</TableCell>
                        <TableCell align='right'>Taxa Conclusão</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cursos.map((curso, index) => (
                        <TableRow key={curso.codigo || index} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={500}>
                              {curso.titulo}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {curso.codigo}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2'>
                              {curso.inscritos}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Chip
                              label={`${curso.taxa_conclusao || 0}%`}
                              size='small'
                              color={
                                (curso.taxa_conclusao || 0) > 0.7
                                  ? 'success'
                                  : (curso.taxa_conclusao || 0) > 0.4
                                    ? 'warning'
                                    : 'error'
                              }
                              variant='filled'
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  color='text.secondary'
                  align='center'
                  sx={{ py: 3 }}
                >
                  Nenhum curso encontrado
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
