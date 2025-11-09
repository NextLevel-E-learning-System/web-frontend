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
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  School,
  People,
  CheckCircle,
  Assignment,
  Visibility,
  RateReview,
} from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricCard from '@/components/common/StatCard'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard, type DashboardInstrutor } from '@/api/users'
import { useNavigate } from 'react-router-dom'

export default function InstrutorDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardData, isLoading, error } = useDashboard()
  const navigate = useNavigate()

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

  const { metricas } = instrutorData || { metricas: {} }

  const handleViewCourse = (cursoCodigo: string, hasPendentes: boolean) => {
    if (hasPendentes) {
      // Se tem pendentes, vai direto para aba de correções
      navigate(`/gerenciar/cursos/${cursoCodigo}`, {
        state: { viewOnly: true, nextTab: 'reviews' },
      })
    } else {
      // Senão, vai para visualização normal
      navigate(`/gerenciar/cursos/${cursoCodigo}`, {
        state: { viewOnly: true },
      })
    }
  }

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
              icon={<School color='info' />}
              value={metricas.total_cursos?.toString() || '0'}
              label='Total de Cursos'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<People color='info' />}
              value={metricas.total_alunos?.toString() || '0'}
              label='Total de Funcionários'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<CheckCircle color='success' />}
              value={`${metricas.taxa_conclusao_geral?.toFixed(1) || '0'}%`}
              label='Taxa de Conclusão Geral'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              icon={<Assignment color='warning' />}
              value={metricas.pendentes_correcao?.toString() || '0'}
              label='Correções Pendentes'
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Lista de Cursos */}
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              {/*               {cursos.length > 0 ? (
                <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Curso</TableCell>
                        <TableCell align='center'>Inscritos</TableCell>
                        <TableCell align='center'>Concluidos</TableCell>
                        <TableCell align='center'>Taxa Conclusão</TableCell>
                        <TableCell align='center'>
                          Correções Pendentes
                        </TableCell>
                        <TableCell align='center'>Ações</TableCell>
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
                          <TableCell align='center'>
                            <Typography variant='body2'>
                              {curso.inscritos}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant='body2'>
                              {curso.concluidos}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
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
                          <TableCell align='center'>
                            <Typography variant='body2'>
                              {curso.pendentes_correcao}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Tooltip
                              title={
                                curso.pendentes_correcao > 0
                                  ? 'Ver correções pendentes'
                                  : 'Visualizar curso'
                              }
                            >
                              <IconButton
                                size='small'
                                color={
                                  curso.pendentes_correcao > 0
                                    ? 'warning'
                                    : 'primary'
                                }
                                onClick={() =>
                                  handleViewCourse(
                                    curso.codigo,
                                    curso.pendentes_correcao > 0
                                  )
                                }
                              >
                                {curso.pendentes_correcao > 0 ? (
                                  <RateReview />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </Tooltip>
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
              )} */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
