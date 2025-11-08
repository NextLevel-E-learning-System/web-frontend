import {
  Box,
  Button,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
  LinearProgress,
  Stack,
  Avatar,
} from '@mui/material'
import {
  Person as PersonIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import DataTable, { type Column } from '@/components/common/DataTable'
import { useNavigation } from '@/hooks/useNavigation'
import { useDashboard, type DashboardInstrutor } from '@/api/users'
import { useCourseEnrollments } from '@/api/progress'
import { useCourseCatalog } from '@/api/courses'

export default function AlunosTurmas() {
  const { navigationItems, perfil } = useNavigation()
  const { data: dashboardData } = useDashboard()

  // Verificar se é ADMIN ou INSTRUTOR
  const isAdmin = perfil?.role === 'ADMIN'
  const isInstrutor = perfil?.role === 'INSTRUTOR'

  const instrutorData =
    dashboardData?.dashboard?.tipo_dashboard === 'instrutor'
      ? (dashboardData.dashboard as DashboardInstrutor)
      : null

  const { data: allCoursesData } = useCourseCatalog({ ativo: true })

  const cursosDisponiveis = useMemo(() => {
    if (isInstrutor) {
      // INSTRUTOR vê apenas seus cursos
      return instrutorData?.cursos || []
    } else if (isAdmin && allCoursesData) {
      // ADMIN vê todos os cursos
      return allCoursesData.map(course => ({
        codigo: course.codigo,
        titulo: course.titulo,
        inscritos: course.total_inscritos || 0,
        concluidos: course.total_conclusoes || 0,
        taxa_conclusao: course.taxa_conclusao || 0,
        avaliacao_media: course.avaliacao_media || null,
        status: course.ativo,
        pendentes_correcao: 0,
      }))
    }
    return []
  }, [isInstrutor, isAdmin, instrutorData?.cursos, allCoursesData])

  // Estados para aba de turmas
  const [cursoSelecionado, setCursoSelecionado] = useState<string>('')
  const [turmasTab, setTurmasTab] = useState<'all' | 'active' | 'disabled'>(
    'all'
  )

  // API para turmas
  const {
    data: enrollmentsData,
    isLoading: loadingEnrollments,
    error: enrollmentsError,
  } = useCourseEnrollments(cursoSelecionado)

  const enrollments = useMemo(() => enrollmentsData || [], [enrollmentsData])

  const getStatusColor = (
    status: string
  ): 'success' | 'primary' | 'default' => {
    switch (status) {
      case 'CONCLUIDO':
        return 'success'
      case 'EM_ANDAMENTO':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return <CheckCircle fontSize='small' />
      case 'EM_ANDAMENTO':
        return <Schedule fontSize='small' />
      default:
        return <Cancel fontSize='small' />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'Concluído'
      case 'EM_ANDAMENTO':
        return 'Em Andamento'
      case 'NAO_INICIADO':
        return 'Não Iniciado'
      case 'CANCELADO':
        return 'Cancelado'
      default:
        return status
    }
  }

  const handleExportPDF = () => {
    // Implementar exportação PDF
    console.log('Exportar PDF')
  }

  const handleExportExcel = () => {
    // Implementar exportação Excel
    console.log('Exportar Excel')
  }

  // Filtros
  const filteredEnrollments = useMemo(() => {
    if (!enrollments.length) return []
    if (turmasTab === 'all') return enrollments
    if (turmasTab === 'active')
      return enrollments.filter(e => e.status !== 'CONCLUIDO')
    return enrollments.filter(e => e.status === 'CONCLUIDO')
  }, [enrollments, turmasTab])

  // Estatísticas das turmas
  const turmasStats = useMemo(() => {
    const total = enrollments.length
    const concluidos = enrollments.filter(e => e.status === 'CONCLUIDO').length
    const emAndamento = enrollments.filter(
      e => e.status === 'EM_ANDAMENTO'
    ).length
    const mediaProgresso =
      total > 0
        ? enrollments.reduce(
            (acc, e) => acc + (e.progresso_percentual || 0),
            0
          ) / total
        : 0

    return { total, concluidos, emAndamento, mediaProgresso }
  }, [enrollments])

  // Colunas da tabela de turmas
  const turmasColumns: Column[] = useMemo(
    () => [
      {
        id: 'funcionario_nome',
        label: 'Funcionário',
        minWidth: 250,
        render: (value: string, row: (typeof enrollments)[0]) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <PersonIcon fontSize='small' />
            </Avatar>
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {value}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.funcionario_email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'departamento',
        label: 'Departamento',
        minWidth: 150,
        render: (value: string) => (
          <Typography variant='body2'>{value || '—'}</Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 140,
        render: (value: string) => (
          <Chip
            icon={getStatusIcon(value)}
            label={getStatusLabel(value)}
            color={getStatusColor(value)}
            size='small'
            variant='outlined'
          />
        ),
      },
      {
        id: 'progresso_percentual',
        label: 'Progresso',
        minWidth: 180,
        render: (value: number) => (
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                {value || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={value || 0}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  bgcolor:
                    value >= 100
                      ? 'success.main'
                      : value >= 50
                        ? 'primary.main'
                        : 'warning.main',
                },
              }}
            />
          </Box>
        ),
      },
      {
        id: 'modulos_concluidos',
        label: 'Módulos',
        minWidth: 100,
        align: 'center' as const,
        render: (value: number, row: (typeof enrollments)[0]) => (
          <Typography variant='body2' fontWeight={500}>
            {value || 0}/{row.total_modulos || 0}
          </Typography>
        ),
      },
      {
        id: 'data_inscricao',
        label: 'Data de Inscrição',
        minWidth: 130,
        render: (value: string) =>
          value ? (
            <Typography variant='body2'>
              {new Date(value).toLocaleDateString('pt-BR')}
            </Typography>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              —
            </Typography>
          ),
      },
    ],
    []
  )

  const cursoAtual = cursosDisponiveis.find(c => c.codigo === cursoSelecionado)

  return (
    <DashboardLayout items={navigationItems}>
      <Box>
        <Box>
          {/* Seletor de Curso */}
          <Paper sx={{ p: 3, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Selecione um Curso</InputLabel>
              <Select
                value={cursoSelecionado}
                onChange={e => setCursoSelecionado(e.target.value)}
                label='Selecione um Curso'
              >
                <MenuItem value=''>
                  <em>— Selecione um curso —</em>
                </MenuItem>
                {cursosDisponiveis.map(curso => (
                  <MenuItem key={curso.codigo} value={curso.codigo}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{curso.titulo}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {loadingEnrollments ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
            </Paper>
          ) : enrollmentsError ? (
            <Alert severity='error'>
              Erro ao carregar inscrições. Tente novamente.
            </Alert>
          ) : (
            <>
              {/* Estatísticas */}
              {enrollments.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant='h6' gutterBottom fontWeight={600}>
                    📊 Resumo do Curso: {cursoAtual?.titulo}
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ mt: 2 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Total de Funcionários
                      </Typography>
                      <Typography variant='h4' fontWeight={700} color='primary'>
                        {turmasStats.total}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Concluíram
                      </Typography>
                      <Typography
                        variant='h4'
                        fontWeight={700}
                        color='success.main'
                      >
                        {turmasStats.concluidos}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Em Andamento
                      </Typography>
                      <Typography
                        variant='h4'
                        fontWeight={700}
                        color='primary.main'
                      >
                        {turmasStats.emAndamento}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Progresso Médio
                      </Typography>
                      <Typography
                        variant='h4'
                        fontWeight={700}
                        color='info.main'
                      >
                        {turmasStats.mediaProgresso.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* Ações e Filtros */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <StatusFilterTabs
                  value={turmasTab}
                  onChange={setTurmasTab}
                  activeCount={
                    enrollments.filter(e => e.status !== 'CONCLUIDO').length
                  }
                  inactiveCount={
                    enrollments.filter(e => e.status === 'CONCLUIDO').length
                  }
                  activeLabel='Em Andamento'
                  inactiveLabel='Concluídos'
                />

                <Stack direction='row' spacing={1}>
                  <Button
                    startIcon={<ExcelIcon />}
                    variant='outlined'
                    size='small'
                    onClick={handleExportExcel}
                    disabled={!filteredEnrollments.length}
                  >
                    Excel
                  </Button>
                  <Button
                    startIcon={<PdfIcon />}
                    variant='outlined'
                    size='small'
                    onClick={handleExportPDF}
                    disabled={!filteredEnrollments.length}
                  >
                    PDF
                  </Button>
                </Stack>
              </Box>

              {/* Tabela de Funcionários da Turma */}
              <DataTable
                columns={turmasColumns}
                data={filteredEnrollments}
                getRowId={row => row.id}
              />

              {filteredEnrollments.length === 0 && !loadingEnrollments && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant='body1' color='text.secondary'>
                    {turmasTab === 'all'
                      ? 'Nenhum aluno inscrito neste curso'
                      : turmasTab === 'active'
                        ? 'Nenhum aluno em andamento'
                        : 'Nenhum aluno concluiu este curso'}
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  )
}
