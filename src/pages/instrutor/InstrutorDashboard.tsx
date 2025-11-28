import {
  Grid,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton
} from '@mui/material'
import {
  School,
  People,
  CheckCircle,
  Assignment,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Category,
  MenuBook
} from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MetricCard from '@/components/common/StatCard'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboard, type DashboardInstrutor } from '@/api/users'
import { useState } from 'react'

export default function InstrutorDashboard() {
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardData, isLoading, error } = useDashboard()
  const [expandedDept, setExpandedDept] = useState<string | false>(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

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

  const { metricas_gerais, metricas_departamento } = instrutorData || { metricas_gerais: {}, metricas_departamento: [] }

  return (
    <DashboardLayout items={navigationItems}>
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
                icon={<School color='info' />}
                value={metricas_gerais.total_cursos?.toString() || '0'}
                label='Total de Cursos'
              />
              <MetricCard
                icon={<People color='info' />}
                value={metricas_gerais.total_alunos?.toString() || '0'}
                label='Total de Alunos'
              />
              <MetricCard
                icon={<Assignment color='primary' />}
                value={metricas_gerais.total_inscricoes?.toString() || '0'}
                label='Total de Inscrições'
              />
              <MetricCard
                icon={<CheckCircle color='success' />}
                value={`${metricas_gerais.taxa_conclusao_geral?.toFixed(1) || '0'}%`}
                label='Taxa de Conclusão'
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
                Visão Geral dos Meus Cursos
              </Typography>
              <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Departamento</TableCell>
                      <TableCell align='center'>Categorias</TableCell>
                      <TableCell align='center'>Cursos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(metricas_departamento || []).map(dept => (
                      <TableRow key={dept.departamento_codigo} hover>
                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
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
                      </TableRow>
                    ))}
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
                Meus Cursos por Departamento e Categoria
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
                    {(metricas_departamento || []).map(dept => (
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
                                                            {curso.descricao && (
                                                              <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                                                                {curso.descricao.length > 100 ? `${curso.descricao.substring(0, 100)}...` : curso.descricao}
                                                              </Typography>
                                                            )}
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
      </Box>
    </DashboardLayout>
  )
}
