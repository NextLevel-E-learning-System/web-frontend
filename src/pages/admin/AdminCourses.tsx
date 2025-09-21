import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  Avatar,
  LinearProgress,
  Rating,
  Paper,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  FilterAlt as FilterAltIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import CourseDetailsDialog from '@/components/admin/CourseDetailsDialog'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useCourseCatalog,
  useCategories,
  type Course as Curso,
} from '@/api/courses'
import { useListarDepartamentosAdmin, useFuncionarios } from '@/api/users'

interface CursoMetricas extends Curso {
  total_inscritos: number
  total_concluidos: number
  em_andamento: number
  taxa_conclusao: number
  avaliacao_media: number
  total_avaliacoes: number
  tempo_medio_conclusao: number // em dias
  status_visual: 'active' | 'inactive' | 'draft'
}

// Mock data para demonstração
const mockMetricas: CursoMetricas[] = [
  {
    codigo: 'MKT-002',
    total_inscritos: 0,
    total_concluidos: 0,
    em_andamento: 0,
    taxa_conclusao: 0,
    avaliacao_media: 0,
    total_avaliacoes: 0,
    tempo_medio_conclusao: 0,
    status_visual: 'active',
    titulo: '',
    ativo: false,
    criado_em: '',
    atualizado_em: '',
  },
]

interface Filtros {
  categoria: string
  instrutor: string
  status: string
  nivel: string
}

export default function AdminCourses() {
  const { navigationItems } = useNavigation()

  // Estados
  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('active')
  const [selectedCourse, setSelectedCourse] = useState<CursoMetricas | null>(
    null
  )
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: 'all',
    instrutor: 'all',
    status: 'all',
    nivel: 'all',
  })

  // Hooks de dados reais (quando disponíveis)
  const { data: cursosReais = [], isLoading: loadingCursos } =
    useCourseCatalog()
  const { data: categorias = [], isLoading: loadingCategorias } =
    useCategories()
  const { data: departamentos = [] } = useListarDepartamentosAdmin()
  const { data: usuarios = [] } = useFuncionarios()

  // Usar dados mock por enquanto
  const cursos = mockMetricas
  const instrutores = usuarios || []

  // Filtros aplicados
  const cursosAtivos = cursos.filter(c => c.ativo === true)
  const cursosInativos = cursos.filter(c => c.ativo === false)

  const filtered = cursos.filter(curso => {
    if (tab === 'active' && !curso.ativo) return false
    if (tab === 'disabled' && curso.ativo) return false

    return (
      (filtros.instrutor === 'all' ||
        curso.instrutor_id === filtros.instrutor) &&
      (filtros.nivel === 'all' || curso.nivel_dificuldade === filtros.nivel)
    )
  })

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalCursos = cursos.length
    const totalInscritos = cursos.reduce(
      (acc, curso) => acc + curso.total_inscritos,
      0
    )
    const totalConcluidos = cursos.reduce(
      (acc, curso) => acc + curso.total_concluidos,
      0
    )
    const taxaMediaConclusao =
      totalInscritos > 0 ? (totalConcluidos / totalInscritos) * 100 : 0
    const avaliacaoMedia =
      cursos.reduce((acc, curso) => acc + curso.avaliacao_media, 0) /
      totalCursos

    return {
      totalCursos,
      totalInscritos,
      totalConcluidos,
      taxaMediaConclusao,
      avaliacaoMedia,
    }
  }, [cursos])

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Básico':
        return 'success'
      case 'Intermediário':
        return 'warning'
      case 'Avançado':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusColor = (ativo: boolean) => {
    return ativo ? 'success' : 'default'
  }

  if (loadingCursos || loadingCategorias) {
    return (
      <DashboardLayout title='Cursos' items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title='Cursos' items={navigationItems}>
      <Box>
        {/* Filtros */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filtros.categoria}
                onChange={e =>
                  setFiltros({ ...filtros, categoria: e.target.value })
                }
                label='Categoria'
              >
                <MenuItem value='all'>
                  <em>Todas as Categorias</em>
                </MenuItem>
                {categorias.map(cat => (
                  <MenuItem key={cat.codigo} value={cat.nome}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Instrutor</InputLabel>
              <Select
                value={filtros.instrutor}
                onChange={e =>
                  setFiltros({ ...filtros, instrutor: e.target.value })
                }
                label='Instrutor'
              >
                <MenuItem value='all'>
                  <em>Todos os Instrutores</em>
                </MenuItem>
                {instrutores.map(instrutor => (
                  <MenuItem key={instrutor.id} value={instrutor.id}>
                    {instrutor.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Nível</InputLabel>
              <Select
                value={filtros.nivel}
                onChange={e =>
                  setFiltros({ ...filtros, nivel: e.target.value })
                }
                label='Nível'
              >
                <MenuItem value='all'>
                  <em>Todos os Níveis</em>
                </MenuItem>
                <MenuItem value='Básico'>Básico</MenuItem>
                <MenuItem value='Intermediário'>Intermediário</MenuItem>
                <MenuItem value='Avançado'>Avançado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Tabs de Status */}
        <StatusFilterTabs
          value={tab}
          onChange={setTab}
          activeCount={cursosAtivos.length}
          inactiveCount={cursosInativos.length}
          activeLabel='Cursos Ativos'
          inactiveLabel='Cursos Inativos'
        />

        {/* Tabela de Cursos */}
        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                {tab === 'active'
                  ? 'Cursos Ativos'
                  : tab === 'disabled'
                    ? 'Cursos Inativos'
                    : 'Todos os Cursos'}
              </Typography>
            }
            subheader={`${filtered.length} cursos encontrados`}
          />
          <CardContent>
            {filtered.length === 0 ? (
              <Alert severity='info'>
                {tab === 'all'
                  ? 'Nenhum curso encontrado com os filtros selecionados.'
                  : `Nenhum curso ${tab === 'active' ? 'ativo' : 'inativo'} encontrado.`}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Curso</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Instrutor</TableCell>
                    <TableCell>Nível</TableCell>
                    <TableCell align='center'>Inscritos</TableCell>
                    <TableCell align='center'>Taxa Conclusão</TableCell>
                    <TableCell align='center'>Avaliação</TableCell>
                    <TableCell align='center'>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(curso => (
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCourse(curso)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {curso.titulo}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              color: 'text.secondary',
                            }}
                          >
                            {curso.codigo}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <ScheduleIcon fontSize='small' color='action' />
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {curso.duracao_estimada}h
                            </Typography>
                            <TrendingUpIcon fontSize='small' color='action' />
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {curso.xp_oferecido} XP
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip variant='outlined' size='small' />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar
                            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                          ></Avatar>
                          <Typography variant='body2'></Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          label={curso.nivel_dificuldade}
                          color={
                            getNivelColor(
                              curso.nivel_dificuldade || 'Básico'
                            ) as any
                          }
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {curso.total_inscritos}
                          </Typography>
                          <Typography variant='caption' color='success.main'>
                            {curso.total_concluidos} concluídos
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Box sx={{ minWidth: 80 }}>
                          <Typography variant='body2' fontWeight={500}>
                            {curso.taxa_conclusao.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={curso.taxa_conclusao}
                            sx={{ mt: 0.5 }}
                            color={
                              curso.taxa_conclusao > 70
                                ? 'success'
                                : curso.taxa_conclusao > 40
                                  ? 'warning'
                                  : 'error'
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <Rating
                            value={curso.avaliacao_media}
                            readOnly
                            size='small'
                            precision={0.1}
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {curso.avaliacao_media.toFixed(1)} (
                            {curso.total_avaliacoes})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          size='small'
                          label={curso.ativo ? 'Ativo' : 'Inativo'}
                          color={getStatusColor(curso.ativo)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Detalhes do Curso */}
        <CourseDetailsDialog
          open={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          curso={selectedCourse as any}
        />
      </Box>
    </DashboardLayout>
  )
}
