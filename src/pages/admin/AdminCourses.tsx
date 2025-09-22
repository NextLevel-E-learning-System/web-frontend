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
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
  useMediaQuery,
  useTheme,
  CircularProgress,
  TableContainer,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FileCopy,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { VisibilityOff } from '@mui/icons-material'
import { Visibility } from '@mui/icons-material'
import { useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import CourseDetailsDialog from '@/components/admin/CourseDetailsDialog'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useCourses,
  useCategories,
  useCreateCourse,
  useUpdateCourse,
  useDuplicateCourse,
  useToggleCourseStatus,
  type Course as Curso,
  type CreateCourseInput,
  type UpdateCourseInput,
} from '@/api/courses'
import { useListarDepartamentosAdmin, useFuncionarios } from '@/api/users'

interface Filtros {
  q: string // busca por título/descrição
  categoria: string
  instrutor: string
  status: 'all' | 'active' | 'inactive'
  nivel: string
  departamento: string
}

export default function AdminCourses() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const { navigationItems } = useNavigation()

  // Estados
  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({
    q: '',
    categoria: 'all',
    instrutor: 'all',
    status: 'all',
    nivel: 'all',
    departamento: 'all',
  })

  // Estados para ações
  const [dialogCreateCourse, setDialogCreateCourse] = useState(false)
  const [dialogEditCourse, setDialogEditCourse] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<Curso | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCourseForMenu, setSelectedCourseForMenu] =
    useState<Curso | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // Form states
  const [newCourseData, setNewCourseData] = useState<CreateCourseInput>({
    codigo: '',
    titulo: '',
    descricao: '',
    categoria_id: '',
    instrutor_id: '',
    duracao_estimada: 0,
    xp_oferecido: 0,
    nivel_dificuldade: 'Básico',
    pre_requisitos: [],
  })

  // Hooks de dados
  const coursesFilters = useMemo(() => {
    const filters: any = {}
    if (filtros.q) filters.q = filtros.q
    if (filtros.categoria !== 'all') filters.categoria = filtros.categoria
    if (filtros.instrutor !== 'all') filters.instrutor = filtros.instrutor
    if (filtros.nivel !== 'all') filters.nivel = filtros.nivel
    if (filtros.departamento !== 'all')
      filters.departamento = filtros.departamento

    // Filtro por status baseado na tab
    if (tab === 'active') filters.ativo = true
    if (tab === 'disabled') filters.ativo = false

    return filters
  }, [filtros, tab])

  const { data: cursosResponse, isLoading: loadingCursos } =
    useCourses(coursesFilters)
  const { data: categorias = [], isLoading: loadingCategorias } =
    useCategories()
  const { data: funcionarios = [] } = useFuncionarios()

  // Mutations
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse(courseToEdit?.codigo || '')
  const duplicateCourseMutation = useDuplicateCourse()
  const toggleStatusMutation = useToggleCourseStatus(
    selectedCourseForMenu?.codigo || ''
  )

  const cursos = cursosResponse?.items || []

  // Filtros aplicados
  const cursosAtivos = cursos.filter(c => c.ativo === true)
  const cursosInativos = cursos.filter(c => c.ativo === false)

  // Funções para ações
  const handleCreateCourse = async () => {
    try {
      await createCourseMutation.mutateAsync(newCourseData)
      setSnackbar({
        open: true,
        message: 'Curso criado com sucesso!',
        severity: 'success',
      })
      setDialogCreateCourse(false)
      resetNewCourseData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao criar curso',
        severity: 'error',
      })
    }
  }

  const handleEditCourse = async () => {
    if (!courseToEdit) return
    try {
      const updateData: UpdateCourseInput = {
        titulo: newCourseData.titulo,
        descricao: newCourseData.descricao,
        categoria_id: newCourseData.categoria_id,
        duracao_estimada: newCourseData.duracao_estimada,
        xp_oferecido: newCourseData.xp_oferecido,
        nivel_dificuldade: newCourseData.nivel_dificuldade,
      }
      await updateCourseMutation.mutateAsync(updateData)
      setSnackbar({
        open: true,
        message: 'Curso atualizado com sucesso!',
        severity: 'success',
      })
      setDialogEditCourse(false)
      setCourseToEdit(null)
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar curso',
        severity: 'error',
      })
    }
  }

  const handleDuplicateCourse = async (curso: Curso) => {
    try {
      await duplicateCourseMutation.mutateAsync(curso.codigo)
      setSnackbar({
        open: true,
        message: 'Curso duplicado com sucesso!',
        severity: 'success',
      })
      setAnchorEl(null)
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao duplicar curso',
        severity: 'error',
      })
    }
  }

  const handleToggleStatus = async (curso: Curso) => {
    try {
      await toggleStatusMutation.mutateAsync(!curso.ativo)
      setSnackbar({
        open: true,
        message: `Curso ${!curso.ativo ? 'ativado' : 'desativado'} com sucesso!`,
        severity: 'success',
      })
      setAnchorEl(null)
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao alterar status do curso',
        severity: 'error',
      })
    }
  }

  const resetNewCourseData = () => {
    setNewCourseData({
      codigo: '',
      titulo: '',
      descricao: '',
      categoria_id: '',
      instrutor_id: '',
      duracao_estimada: 0,
      xp_oferecido: 0,
      nivel_dificuldade: 'Básico',
      pre_requisitos: [],
    })
  }

  // Menu handlers
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    curso: Curso
  ) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedCourseForMenu(curso)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedCourseForMenu(null)
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Filtragem de cursos
  const filtered = cursos.filter(curso => {
    // Filtro de aba
    if (tab === 'active' && !curso.ativo) return false
    if (tab === 'disabled' && curso.ativo) return false

    // Outros filtros
    if (filtros.instrutor !== 'all' && curso.instrutor_id !== filtros.instrutor)
      return false
    if (filtros.nivel !== 'all' && curso.nivel_dificuldade !== filtros.nivel)
      return false
    if (filtros.categoria !== 'all' && curso.categoria_id !== filtros.categoria)
      return false

    // Filtro de pesquisa
    if (filtros.q) {
      const searchLower = filtros.q.toLowerCase()
      return (
        curso.titulo.toLowerCase().includes(searchLower) ||
        curso.descricao?.toLowerCase().includes(searchLower) ||
        curso.codigo.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

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
    <DashboardLayout title='Gerenciar Cursos' items={navigationItems}>
      <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filtros.categoria}
                    onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}
                    label='Categoria'
                  >
                    <MenuItem value='all'><em>Todas as Categorias</em></MenuItem>
                    {categorias.map(cat => (
                      <MenuItem key={cat.codigo} value={cat.codigo}>{cat.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Instrutor</InputLabel>
                  <Select
                    value={filtros.instrutor}
                    onChange={e => setFiltros({ ...filtros, instrutor: e.target.value })}
                    label='Instrutor'
                  >
                    <MenuItem value='all'><em>Todos os Instrutores</em></MenuItem>
                    {/* Adicione instrutores se necessário */}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Nível</InputLabel>
                  <Select
                    value={filtros.nivel}
                    onChange={e => setFiltros({ ...filtros, nivel: e.target.value })}
                    label='Nível'
                  >
                    <MenuItem value='all'><em>Todos os Níveis</em></MenuItem>
                    <MenuItem value='Básico'>Básico</MenuItem>
                    <MenuItem value='Intermediário'>Intermediário</MenuItem>
                    <MenuItem value='Avançado'>Avançado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setDialogCreateCourse(true)}
                sx={{ minWidth: 160 }}
              >
                Novo Curso
              </Button>
            </Box>

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
          <CardContent>
            {filtered.length === 0 ? (
              <Alert severity='info'>
                {tab === 'all'
                  ? 'Nenhum curso encontrado com os filtros selecionados.'
                  : `Nenhum curso ${tab === 'active' ? 'ativo' : 'inativo'} encontrado.`}
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ maxHeight: 600, overflow: 'auto' }}
              >
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell align='center'>Categoria</TableCell>
                      <TableCell align='center'>Instrutor</TableCell>
                      <TableCell align='center'>Nível</TableCell>
                      <TableCell align='center'>Inscritos</TableCell>
                      <TableCell align='center'>Taxa Conclusão</TableCell>
                      <TableCell align='center'>Avaliação</TableCell>
                      <TableCell align='center'>Status</TableCell>
                      <TableCell align='center'>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map(curso => {
                      const categoria = categorias.find(
                        c => c.codigo === curso.categoria_id
                      )
                      const instrutor = funcionarios.find(
                        f => f.id === curso.instrutor_id
                      )

                      return (
                        <TableRow
                          key={curso.codigo}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedCourse(curso)}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant='body2' fontWeight={500}>
                                {curso.titulo}
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
                                <TrendingUpIcon
                                  fontSize='small'
                                  color='action'
                                />
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {curso.xp_oferecido} XP
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip
                              variant='outlined'
                              size='small'
                              label={categoria?.nome || 'N/A'}
                              sx={{
                                borderColor: categoria?.cor_hex || '#ccc',
                                color: categoria?.cor_hex || '#666',
                                backgroundColor: categoria?.cor_hex
                                  ? `${categoria.cor_hex}15`
                                  : 'transparent',
                              }}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant='body2'>
                              {instrutor?.nome
                                ? (() => {
                                    const nomes = instrutor.nome
                                      .split(' ')
                                      .filter(n => n.length > 0)
                                    const primeiro = nomes[0]?.charAt(0) || ''
                                    const ultimo =
                                      nomes.length > 1
                                        ? nomes[nomes.length - 1]?.charAt(0) ||
                                          ''
                                        : ''
                                    return `${primeiro}${ultimo}`.toUpperCase()
                                  })()
                                : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Typography variant='body2' fontWeight={500}>
                              {curso.nivel_dificuldade}
                            </Typography>
                          </TableCell>
                          <TableCell align='center'>
                            <Box>
                              <Typography variant='body2' fontWeight={500}>
                                {curso.total_inscritos || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            <Box sx={{ minWidth: 80 }}>
                              <Typography variant='body2' fontWeight={500}>
                                {(
                                  ((curso.total_concluidos || 0) /
                                    Math.max(curso.total_inscritos || 1, 1)) *
                                  100
                                ).toFixed(1)}
                                %
                              </Typography>
                              <LinearProgress
                                variant='determinate'
                                value={
                                  ((curso.total_concluidos || 0) /
                                    Math.max(curso.total_inscritos || 1, 1)) *
                                  100
                                }
                                sx={{ mt: 0.5 }}
                                color={
                                  ((curso.total_concluidos || 0) /
                                    Math.max(curso.total_inscritos || 1, 1)) *
                                    100 >
                                  70
                                    ? 'success'
                                    : ((curso.total_concluidos || 0) /
                                          Math.max(
                                            curso.total_inscritos || 1,
                                            1
                                          )) *
                                          100 >
                                        40
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
                                value={0}
                                readOnly
                                size='small'
                                precision={0.1}
                              />
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              ></Typography>
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            <Chip
                              size='small'
                              label={curso.ativo ? 'Ativo' : 'Inativo'}
                              color={getStatusColor(curso.ativo) as any}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <IconButton
                              size='small'
                              onClick={e => handleOpenMenu(e, curso)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Detalhes do Curso */}
        <CourseDetailsDialog
          open={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          curso={selectedCourse as any}
        />

        {/* Menu de ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            onClick={() =>
              selectedCourseForMenu && openEditDialog(selectedCourseForMenu)
            }
          >
            <EditIcon sx={{ mr: 1 }} fontSize='small' />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() =>
              selectedCourseForMenu &&
              handleDuplicateCourse(selectedCourseForMenu)
            }
          >
            <FileCopy sx={{ mr: 1 }} fontSize='small' />
            Duplicar
          </MenuItem>
          <MenuItem
            onClick={() =>
              selectedCourseForMenu && handleToggleStatus(selectedCourseForMenu)
            }
          >
            {selectedCourseForMenu?.ativo ? (
              <>
                <VisibilityOff sx={{ mr: 1 }} fontSize='small' />
                Desativar
              </>
            ) : (
              <>
                <Visibility sx={{ mr: 1 }} fontSize='small' />
                Ativar
              </>
            )}
          </MenuItem>
        </Menu>

        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  )
}

// Função auxiliar para abrir o dialog de edição
const openEditDialog = (curso: Curso) => {
  // Esta função será implementada quando criarmos os dialogs
  console.log('Editar curso:', curso)
}
