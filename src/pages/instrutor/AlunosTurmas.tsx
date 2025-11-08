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
  Grid,
} from '@mui/material'
import {
  Person as PersonIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  CheckCircle,
  Schedule,
  Cancel,
  People,
  IncompleteCircle,
  Percent,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import DataTable, { type Column } from '@/components/common/DataTable'
import { useNavigation } from '@/hooks/useNavigation'
import { useCourseEnrollments } from '@/api/progress'
import { useCourseCatalog, useCourses } from '@/api/courses'
import MetricCard from '@/components/common/StatCard'

export default function AlunosTurmas() {
  const { navigationItems, perfil } = useNavigation()

  // Verificar se é ADMIN ou INSTRUTOR
  const isAdmin = perfil?.role === 'ADMIN'
  const isInstrutor = perfil?.role === 'INSTRUTOR'

  // Hook para buscar cursos do instrutor (filtrando por instrutor_id)
  const { data: instructorCoursesData } = useCourses(
    isInstrutor ? { instrutor: perfil?.id, ativo: true } : {}
  )

  // Hook para buscar todos os cursos (ADMIN)
  const { data: allCoursesData } = useCourseCatalog({ ativo: true })

  const cursosDisponiveis = useMemo(() => {
    if (isInstrutor && instructorCoursesData) {
      // INSTRUTOR vê apenas seus cursos vindos do endpoint específico
      return instructorCoursesData.items.map(course => ({
        codigo: course.codigo,
        titulo: course.titulo,
      }))
    } else if (isAdmin && allCoursesData) {
      // ADMIN vê todos os cursos
      return allCoursesData.map(course => ({
        codigo: course.codigo,
        titulo: course.titulo,
      }))
    }
    return []
  }, [isInstrutor, isAdmin, instructorCoursesData, allCoursesData])

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
        id: 'funcionario_departamento',
        label: 'Departamento',
        render: (value: string) => (
          <Typography variant='body2'>{value}</Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
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
        align: 'center',
        render: (value: number) => (
          <Box sx={{ width: '100%' }}>
            <Typography variant='body2' fontWeight={500}>
              {value || 0}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={value || 0}
              color={
                value >= 100 ? 'success' : value >= 50 ? 'warning' : 'error'
              }
              sx={{ mt: 0.5 }}
            />
          </Box>
        ),
      },
      {
        id: 'modulos_concluidos',
        label: 'Módulos',
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
        align: 'center',
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

          {!cursoSelecionado ? null : loadingEnrollments ? (
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
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                      icon={<People color='info' />}
                      value={turmasStats.total}
                      label='Total de Inscrições'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                      icon={<CheckCircle color='success' />}
                      value={turmasStats.concluidos}
                      label='Conclusões'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                      icon={<IncompleteCircle color='warning' />}
                      value={turmasStats.emAndamento}
                      label='Em Andamento'
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                      icon={<Percent color='info' />}
                      value={`${turmasStats.mediaProgresso}%`}
                      label='Progresso Médio'
                    />
                  </Grid>
                </Grid>
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
            </>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  )
}
