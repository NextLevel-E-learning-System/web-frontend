import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material'
import { People, School, CheckCircle } from '@mui/icons-material'
import DepartmentBarChart from '@/components/admin/DepartmentBarChart'
import DepartmentPieChart from '@/components/admin/DepartmentPieChart'
import {
  useDashboard,
  type DashboardAdmin,
  type DashboardGerente,
} from '@/api/users'
import MetricCard from '@/components/common/StatCard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import useDashboardLayout from '@/hooks/useDashboardLayout'

export default function AdminDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardResponse, isLoading } = useDashboard()

  // Extrair dashboard dos dados da resposta
  const dashboard = dashboardResponse?.dashboard

  // Type guards para diferentes tipos de dashboard
  const adminData =
    dashboard?.tipo_dashboard === 'administrador'
      ? (dashboard as DashboardAdmin)
      : null
  const gerenteData =
    dashboard?.tipo_dashboard === 'gerente'
      ? (dashboard as DashboardGerente)
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

  return (
    <DashboardLayout items={navigationItems}>
      {/* Renderizar dashboard de ADMIN ou GERENTE */}
      {(adminData || gerenteData) && (
        <Box
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Métricas Principais - ADMIN/GERENTE */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label='Funcionários Ativos'
                value={
                  (
                    adminData?.metricas_gerais || gerenteData?.metricas_gerais
                  )?.funcionarios_ativos?.toString() || '0'
                }
                icon={<People color='info' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<School color='info' />}
                value={
                  (
                    adminData?.metricas_gerais || gerenteData?.metricas_gerais
                  )?.alunos_ativos?.toString() || '0'
                }
                label='Total de Funcionários'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                value={
                  (
                    adminData?.metricas_gerais || gerenteData?.metricas_gerais
                  )?.total_cursos?.toString() || '0'
                }
                icon={<School color='info' />}
                label='Total de Cursos'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label='Taxa de Conclusão'
                value={`${(adminData?.metricas_gerais || gerenteData?.metricas_gerais)?.taxa_conclusao_media || 0}%`}
                icon={<CheckCircle color='success' />}
              />
            </Grid>
          </Grid>
          {/* Alert para Gerente */}
          {gerenteData && (
            <Alert severity='info' sx={{ mb: 3 }}>
              Visualizando dados filtrados do seu departamento
            </Alert>
          )}

          {/* Gráficos */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Funcionários Ativos por Departamento
                </Typography>
                <DepartmentBarChart
                  data={
                    (
                      adminData?.engajamento_departamentos ||
                      gerenteData?.engajamento_departamentos ||
                      []
                    ).map(d => d.funcionarios_ativos) || []
                  }
                  labels={
                    (
                      adminData?.engajamento_departamentos ||
                      gerenteData?.engajamento_departamentos ||
                      []
                    ).map(d => d.codigo) || []
                  }
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  XP Médio por Departamento
                </Typography>
                <DepartmentPieChart
                  data={
                    (
                      adminData?.engajamento_departamentos ||
                      gerenteData?.engajamento_departamentos ||
                      []
                    ).map(d => d.xp_medio) || []
                  }
                  labels={
                    (
                      adminData?.engajamento_departamentos ||
                      gerenteData?.engajamento_departamentos ||
                      []
                    ).map(d => d.codigo) || []
                  }
                  departmentNames={
                    (
                      adminData?.engajamento_departamentos ||
                      gerenteData?.engajamento_departamentos ||
                      []
                    ).map(d => d.nome) || []
                  }
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Tabela de Engajamento por Departamento */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Engajamento por Departamento
                </Typography>
                <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Departamento</TableCell>
                        <TableCell align='right'>Total Funcionários</TableCell>
                        <TableCell align='right'>Funcionários Ativos</TableCell>
                        <TableCell align='right'>XP Médio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(
                        adminData?.engajamento_departamentos ||
                        gerenteData?.engajamento_departamentos ||
                        []
                      ).map(dept => (
                        <TableRow key={dept.codigo} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={500}>
                              {dept.nome}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {dept.codigo}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2'>
                              {dept.total_funcionarios}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Chip
                              label={dept.funcionarios_ativos.toString()}
                              size='small'
                              color={
                                dept.funcionarios_ativos > 0
                                  ? 'success'
                                  : 'default'
                              }
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' color='primary'>
                              {dept.xp_medio} XP
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Cursos Populares - Apenas para ADMIN */}
          {adminData?.cursos_populares && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    maxWidth: '100%',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Cursos Populares
                  </Typography>
                  {adminData.cursos_populares.length > 0 ? (
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
                          {adminData.cursos_populares.map(
                            (curso: any, index: number) => (
                              <TableRow key={curso.codigo || index} hover>
                                <TableCell>
                                  <Typography variant='body2' fontWeight={500}>
                                    {curso.titulo ||
                                      curso.nome ||
                                      'Curso sem título'}
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
                                    {curso.inscricoes ||
                                      curso.total_inscricoes ||
                                      0}
                                  </Typography>
                                </TableCell>
                                <TableCell align='right'>
                                  <Chip
                                    label={`${((curso.taxa_conclusao || 0) * 100).toFixed(1)}%`}
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
                            )
                          )}
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
          )}
        </Box>
      )}

      {/* Fallback se não houver dados */}
      {!adminData && !gerenteData && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color='text.secondary'>
            Nenhum dado de dashboard disponível
          </Typography>
        </Box>
      )}
    </DashboardLayout>
  )
}
