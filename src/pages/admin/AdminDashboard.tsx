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
} from '@mui/material'
import { People, School, Assignment, CheckCircle } from '@mui/icons-material'
import DashboardWrapper from '@/components/layout/DashboardWrapper'
import StatCard from '@/components/admin/StatCard'
import DepartmentBarChart from '@/components/admin/DepartmentBarChart'
import DepartmentPieChart from '@/components/admin/DepartmentPieChart'
import { DashboardAdmin, DashboardGerente } from '@/api/users'

export default function AdminDashboard() {
  return (
    <DashboardWrapper allowedTypes={['administrador', 'gerente']}>
      {dashboard => {
        // Type guards para diferentes tipos de dashboard
        const adminData =
          dashboard?.tipo_dashboard === 'administrador'
            ? (dashboard as DashboardAdmin)
            : null
        const gerenteData =
          dashboard?.tipo_dashboard === 'gerente'
            ? (dashboard as DashboardGerente)
            : null

        // Dados para ADMIN ou GERENTE (ambos usam o mesmo dashboard agora)
        if (adminData) {
          const {
            metricas_gerais,
            engajamento_departamentos,
            cursos_populares,
          } = adminData
          const departamentoRestrito = (adminData as any)._departamento_restrito

          return (
            <Box
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Alert para GERENTE indicando departamento restrito */}
              {departamentoRestrito && (
                <Alert severity='info' sx={{ mb: 3 }}>
                  Visualizando dados do departamento:{' '}
                  {departamentoRestrito.departamento_nome}
                </Alert>
              )}

              {/* Métricas Principais - ADMIN/GERENTE */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Total de Funcionários'
                    value={metricas_gerais.total_funcionarios}
                    icon={<People />}
                    positive={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Funcionários Ativos'
                    value={metricas_gerais.funcionarios_ativos}
                    icon={<CheckCircle />}
                    positive={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Alunos Ativos'
                    value={metricas_gerais.alunos_ativos}
                    icon={<School />}
                    positive={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Taxa de Conclusão'
                    value={`${(metricas_gerais.taxa_conclusao_media || 0).toFixed(1)}%`}
                    icon={<Assignment />}
                    positive={false}
                  />
                </Grid>
              </Grid>

              {/* Gráficos */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
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
                      Alunos Ativos por Departamento
                    </Typography>
                    <DepartmentBarChart
                      data={engajamento_departamentos.map(
                        d => d.funcionarios_ativos
                      )}
                      labels={engajamento_departamentos.map(d => d.codigo)}
                    />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
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
                      XP Médio por Departamento
                    </Typography>
                    <DepartmentPieChart
                      data={engajamento_departamentos.map(d => d.xp_medio)}
                      labels={engajamento_departamentos.map(d => d.codigo)}
                      departmentNames={engajamento_departamentos.map(
                        d => d.nome
                      )}
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
                      borderRadius: 3,
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
                      Engajamento por Departamento
                    </Typography>
                    <TableContainer sx={{ maxWidth: '100%', overflow: 'auto' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Departamento</TableCell>
                            <TableCell align='right'>
                              Total Funcionários
                            </TableCell>
                            <TableCell align='right'>Alunos Ativos</TableCell>
                            <TableCell align='right'>XP Médio</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {engajamento_departamentos.map(dept => (
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

              {/* Cursos Populares */}
              <Grid container spacing={3}>
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
                    <Typography
                      variant='h6'
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Cursos Populares
                    </Typography>
                    {cursos_populares.length > 0 ? (
                      <TableContainer
                        sx={{ maxWidth: '100%', overflow: 'auto' }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Curso</TableCell>
                              <TableCell align='right'>Inscrições</TableCell>
                              <TableCell align='right'>
                                Taxa Conclusão
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cursos_populares.map(
                              (curso: any, index: number) => (
                                <TableRow key={curso.codigo || index} hover>
                                  <TableCell>
                                    <Typography
                                      variant='body2'
                                      fontWeight={500}
                                    >
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
            </Box>
          )
        }

        // Dados para GERENTE
        if (gerenteData) {
          const { departamento, top_performers, cursos_departamento } =
            gerenteData

          return (
            <Box
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Alert severity='info' sx={{ mb: 3 }}>
                Visualizando dados do departamento: {departamento.nome}
              </Alert>

              {/* Métricas do Departamento - GERENTE */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Total Funcionários'
                    value={departamento.total_funcionarios}
                    icon={<People />}
                    positive={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Funcionários Ativos'
                    value={departamento.funcionarios_ativos}
                    icon={<CheckCircle />}
                    positive={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='Taxa Conclusão Cursos'
                    value={`${departamento.taxa_conclusao_cursos.toFixed(1)}%`}
                    icon={<Assignment />}
                    positive={false}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <StatCard
                    title='XP Médio'
                    value={`${departamento.xp_medio_funcionarios.toFixed(0)} XP`}
                    icon={<School />}
                    positive={true}
                  />
                </Grid>
              </Grid>

              {/* Top Performers e Cursos do Departamento */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
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
                      Top Performers
                    </Typography>
                    {top_performers.length > 0 ? (
                      <TableContainer
                        sx={{ maxWidth: '100%', overflow: 'auto' }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Funcionário</TableCell>
                              <TableCell align='right'>XP Total</TableCell>
                              <TableCell align='right'>Posição</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {top_performers.map(
                              (funcionario: any, index: number) => (
                                <TableRow key={funcionario.id || index} hover>
                                  <TableCell>
                                    <Typography
                                      variant='body2'
                                      fontWeight={500}
                                    >
                                      {funcionario.nome}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align='right'>
                                    <Typography variant='body2' color='primary'>
                                      {funcionario.xp_total || 0} XP
                                    </Typography>
                                  </TableCell>
                                  <TableCell align='right'>
                                    <Chip
                                      label={`#${index + 1}`}
                                      size='small'
                                      color={
                                        index === 0
                                          ? 'error'
                                          : index === 1
                                            ? 'warning'
                                            : 'success'
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
                        Nenhum dado disponível
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
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
                      Cursos do Departamento
                    </Typography>
                    {cursos_departamento.length > 0 ? (
                      <TableContainer
                        sx={{ maxWidth: '100%', overflow: 'auto' }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Curso</TableCell>
                              <TableCell align='right'>Inscrições</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cursos_departamento.map(
                              (curso: any, index: number) => (
                                <TableRow key={curso.codigo || index} hover>
                                  <TableCell>
                                    <Typography
                                      variant='body2'
                                      fontWeight={500}
                                    >
                                      {curso.titulo ||
                                        curso.nome ||
                                        'Curso sem título'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align='right'>
                                    <Typography variant='body2'>
                                      {curso.inscricoes ||
                                        curso.total_inscricoes ||
                                        0}
                                    </Typography>
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
            </Box>
          )
        }

        return null
      }}
    </DashboardWrapper>
  )
}
