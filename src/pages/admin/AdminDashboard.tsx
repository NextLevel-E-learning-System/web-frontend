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
  Collapse,
  IconButton
} from '@mui/material'
import { People, School, Person, KeyboardArrowDown, KeyboardArrowRight, Category, MenuBook } from '@mui/icons-material'
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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

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

  const toggleDepartment = (deptCode: string) => {
    setExpandedDept(expandedDept === deptCode ? false : deptCode)
  }

  const toggleCategory = (deptCode: string, catId: string) => {
    const key = `${deptCode}_${catId}`
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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
          {/* Layout: Métricas + Tabela Resumo */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Coluna Esquerda: Métricas */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <MetricCard
                  label='Funcionários Ativos'
                  value={
                    adminData?.metricas_gerais?.funcionarios_ativos?.toString() ||
                    '0'
                  }
                  icon={<People color='info' />}
                />
                <MetricCard
                  label='Total de Instrutores'
                  value={
                    adminData?.metricas_gerais?.total_instrutores?.toString() || '0'
                  }
                  icon={<Person color='success' />}
                />
                <MetricCard
                  label='Total de Cursos'
                  value={
                    adminData?.metricas_gerais?.total_cursos?.toString() || '0'
                  }
                  icon={<School color='info' />}
                />
              </Box>
            </Grid>

            {/* Coluna Direita: Tabela Resumo */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  overflow: 'auto',
                  height: '100%'
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
                        <TableCell align='center'>Funcionários</TableCell>
                        <TableCell align='center'>Instrutores</TableCell>
                        <TableCell align='center'>Cursos</TableCell>
                        <TableCell align='center'>Categorias</TableCell>
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
                                <People fontSize='small' color='success' />
                                <Typography variant='body2'>{dept.funcionarios_ativos}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Person fontSize='small' sx={{ color: 'primary.main' }} />
                                <Typography variant='body2'>{dept.total_instrutores || 0}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <MenuBook fontSize='small' color='primary' />
                                <Typography variant='body2'>{dept.total_cursos}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align='center'>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Category fontSize='small' color='action' />
                                <Typography variant='body2'>{dept.total_categorias}</Typography>
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
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>

                        <TableCell>Departamento</TableCell>
                        <TableCell align='center'>Categorias</TableCell>
                        <TableCell align='center'>Cursos</TableCell>
                        <TableCell width={50}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(adminData?.metricas_departamento || []).map(dept => (
                        <>
                          {/* Linha do Departamento */}
                          <TableRow 
                            key={dept.departamento_codigo}
                            hover
                            sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
                            onClick={() => toggleDepartment(dept.departamento_codigo)}
                          >
                           
                            <TableCell>
                              <Typography variant='body2' fontWeight={600}>
                                {dept.departamento_nome}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
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
                                <MenuBook fontSize='small' color='primary' />
                                <Typography variant='body2'>{dept.total_cursos}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton size='small'>
                                {expandedDept === dept.departamento_codigo ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                              </IconButton>
                            </TableCell>
                          </TableRow>

                          {/* Expansão: Categorias */}
                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                              <Collapse in={expandedDept === dept.departamento_codigo} timeout='auto' unmountOnExit>
                                <Box sx={{ margin: 2 }}>
                                  <Table size='small'>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Categoria</TableCell>
                                        <TableCell align='center'>Cursos</TableCell>
                                        <TableCell width={50}></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {dept.categorias.map(cat => (
                                        <>
                                          {/* Linha da Categoria */}
                                          <TableRow
                                            key={cat.categoria_id}
                                            hover
                                            sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
                                            onClick={() => toggleCategory(dept.departamento_codigo, cat.categoria_id)}
                                          >
                                            <TableCell>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Category fontSize='small' color='action' />
                                                <Typography variant='body2' fontWeight={500}>
                                                  {cat.categoria_nome}
                                                </Typography>
                                              </Box>
                                            </TableCell>
                                            <TableCell align='center'>
                                              <Typography variant='body2'>{cat.total_cursos}</Typography>
                                            </TableCell>
                                            <TableCell>
                                              <IconButton size='small'>
                                                {expandedCategories[`${dept.departamento_codigo}_${cat.categoria_id}`] ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                              </IconButton>
                                            </TableCell>
                                          </TableRow>

                                          {/* Expansão: Cursos */}
                                          <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                              <Collapse in={expandedCategories[`${dept.departamento_codigo}_${cat.categoria_id}`]} timeout='auto' unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                  {cat.cursos.length > 0 ? (
                                                    <Table size='small'>
                                                      <TableHead>
                                                        <TableRow>
                                                          <TableCell>Curso</TableCell>
                                                          <TableCell align='center'>Instrutor</TableCell>
                                                          <TableCell align='center'>Inscrições</TableCell>
                                                          <TableCell align='center'>Conclusões</TableCell>
                                                          <TableCell align='center'>Taxa de Conclusão</TableCell>
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
                                                              <Typography variant='body2'>{curso.total_inscricoes}</Typography>
                                                            </TableCell>
                                                            <TableCell align='center'>
                                                              <Typography variant='body2'>{curso.total_conclusoes}</Typography>
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
                                                  ) : (
                                                    <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic', py: 1 }}>
                                                      Nenhum curso nesta categoria
                                                    </Typography>
                                                  )}
                                                </Box>
                                              </Collapse>
                                            </TableCell>
                                          </TableRow>
                                        </>
                                      ))}

                                      {dept.categorias.length === 0 && (
                                        <TableRow>
                                          <TableCell colSpan={3}>
                                            <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic', py: 1 }}>
                                              Nenhuma categoria neste departamento
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
