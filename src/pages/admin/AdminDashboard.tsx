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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { People, School, Person, ExpandMore, Category, MenuBook } from '@mui/icons-material'
import DepartmentBarChart from '@/components/admin/DepartmentBarChart'
import DepartmentPieChart from '@/components/admin/DepartmentPieChart'
import { useDashboard, type DashboardAdmin } from '@/api/users'
import MetricCard from '@/components/common/StatCard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import useDashboardLayout from '@/hooks/useDashboardLayout'
import { useState } from 'react'

export default function AdminDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardResponse, isLoading } = useDashboard()
  const [expandedDept, setExpandedDept] = useState<string | false>(false)

  // Extrair dashboard dos dados da resposta
  const dashboard = dashboardResponse?.dashboard

  // Type guard para dashboard de admin
  const adminData =
    dashboard?.tipo_dashboard === 'administrador'
      ? (dashboard as DashboardAdmin)
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

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDept(isExpanded ? panel : false)
  }

  return (
    <DashboardLayout items={navigationItems}>
      {/* Renderizar dashboard de ADMIN */}
      {adminData && (
        <Box
          sx={{
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Métricas Principais - ADMIN */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                label='Funcionários Ativos'
                value={
                  adminData?.metricas_gerais?.funcionarios_ativos?.toString() ||
                  '0'
                }
                icon={<People color='info' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                label='Total de Cursos'
                value={
                  adminData?.metricas_gerais?.total_cursos?.toString() || '0'
                }
                icon={<School color='info' />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MetricCard
                label='Total de Instrutores'
                value={
                  adminData?.metricas_gerais?.total_instrutores?.toString() || '0'
                }
                icon={<Person color='success' />}
              />
            </Grid>
          </Grid>

          {/* Tabela Resumo: Departamentos com Categorias, Funcionários e Cursos */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto'
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Visão Geral
                </Typography>
                <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Departamento</TableCell>
                        <TableCell align='center'>Categorias</TableCell>
                        <TableCell align='center'>Funcionários</TableCell>
                        <TableCell align='center'>Cursos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(adminData?.metricas_departamento || []).map(
                        dept => (
                          <TableRow key={dept.departamento_codigo} hover>
                            <TableCell>
                              <Typography variant='body2' fontWeight={500}>
                                {dept.departamento_nome}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {dept.departamento_codigo}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Category fontSize='small' color='action' />
                                <Typography variant='body2'>{dept.total_categorias}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <People fontSize='small' color='success' />
                                <Typography variant='body2'>{dept.funcionarios_ativos}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <MenuBook fontSize='small' color='primary' />
                                <Typography variant='body2'>{dept.total_cursos}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Detalhamento: Categorias e Cursos por Departamento */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto'
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Categorias e Cursos por Departamento
                </Typography>
                {(adminData?.metricas_departamento || []).map(dept => (
                  <Accordion
                    key={dept.departamento_codigo}
                    expanded={expandedDept === dept.departamento_codigo}
                    onChange={handleAccordionChange(dept.departamento_codigo)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {dept.departamento_nome}
                        </Typography>
                        <Chip label={`${dept.total_categorias} categorias`} size='small' />
                        <Chip label={`${dept.total_cursos} cursos`} size='small' color='primary' />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {dept.categorias.map(cat => (
                        <Box key={cat.categoria_id} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Category color='action' />
                            <Typography variant='subtitle2' fontWeight={600}>
                              {cat.categoria_nome}
                            </Typography>
                            <Chip label={`${cat.total_cursos} cursos`} size='small' variant='outlined' />
                          </Box>

                          {cat.cursos.length > 0 ? (
                            <TableContainer>
                              <Table size='small'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Curso</TableCell>
                                    <TableCell align='center'>Instrutor</TableCell>
                                    <TableCell align='center'>Inscrições</TableCell>
                                    <TableCell align='center'>Conclusões</TableCell>
                                    <TableCell align='center'>Taxa</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cat.cursos.map(curso => (
                                    <TableRow key={curso.codigo} hover>
                                      <TableCell>
                                        <Typography variant='body2' fontWeight={500}>
                                          {curso.titulo}
                                        </Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                          {curso.codigo}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align='center'>
                                        <Typography variant='body2'>
                                          {curso.instrutor_nome || '-'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align='center'>
                                        <Chip
                                          label={curso.total_inscricoes}
                                          size='small'
                                          variant='outlined'
                                        />
                                      </TableCell>
                                      <TableCell align='center'>
                                        <Chip
                                          label={curso.total_conclusoes}
                                          size='small'
                                          variant='outlined'
                                          color='success'
                                        />
                                      </TableCell>
                                      <TableCell align='center'>
                                        <Chip
                                          label={`${curso.taxa_conclusao.toFixed(1)}%`}
                                          size='small'
                                          color={
                                            curso.taxa_conclusao >= 70
                                              ? 'success'
                                              : curso.taxa_conclusao >= 40
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
                            <Typography variant='body2' color='text.secondary' sx={{ ml: 4, fontStyle: 'italic' }}>
                              Nenhum curso nesta categoria
                            </Typography>
                          )}
                        </Box>
                      ))}

                      {dept.categorias.length === 0 && (
                        <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                          Nenhuma categoria neste departamento
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto'
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Funcionários por Departamento
                </Typography>
                <DepartmentBarChart
                  data={
                    (adminData?.metricas_departamento || []).map(
                      d => d.funcionarios_ativos
                    ) || []
                  }
                  labels={
                    (adminData?.metricas_departamento || []).map(
                      d => d.departamento_codigo
                    ) || []
                  }
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto'
                }}
              >
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Cursos por Departamento
                </Typography>
                <DepartmentPieChart
                  data={
                    (adminData?.metricas_departamento || []).map(
                      d => d.total_cursos
                    ) || []
                  }
                  labels={
                    (adminData?.metricas_departamento || []).map(
                      d => d.departamento_codigo
                    ) || []
                  }
                  departmentNames={
                    (adminData?.metricas_departamento || []).map(
                      d => d.departamento_nome
                    ) || []
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Fallback se não houver dados */}
      {!adminData && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color='text.secondary'>
            Nenhum dado de dashboard disponível
          </Typography>
        </Box>
      )}
    </DashboardLayout>
  )
}
