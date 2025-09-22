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
  Checkbox,
  FormControlLabel,
  Tab,
  Tabs,
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
import ConfirmationDialog from '@/components/common/ConfirmationDialog'

interface Filtros {
  categoria: string
  instrutor: string
  status: 'all' | 'active' | 'inactive'
  nivel: string
}

export default function AdminCourses() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const { navigationItems } = useNavigation()

  // Estados
  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: 'all',
    instrutor: 'all',
    status: 'all',
    nivel: 'all',
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
  const [tabModal, setTabModal] = useState<
    'general' | 'assignment' | 'content'
  >('general')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'duplicate' | 'toggle' | null
    curso: Curso | null
  }>({ open: false, action: null, curso: null })

  // Form states
  const [form, setForm] = useState<CreateCourseInput>({
    codigo: '',
    titulo: '',
    descricao: '',
    categoria_id: '',
    instrutor_id: '',
    duracao_estimada: 0,
    xp_oferecido: 0,
    nivel_dificuldade: 'Iniciante',
    pre_requisitos: [],
    ativo: true,
  })

  // Hooks de dados
  const coursesFilters = useMemo(() => {
    const filters: any = {}
    if (filtros.categoria !== 'all') filters.categoria = filtros.categoria
    if (filtros.instrutor !== 'all') filters.instrutor = filtros.instrutor
    if (filtros.nivel !== 'all') filters.nivel = filtros.nivel

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
      await createCourseMutation.mutateAsync(form)
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

    return true
  })

  const getStatusColor = (ativo: boolean) => {
    return ativo ? 'success' : 'default'
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante':
        return 'success'
      case 'intermediario':
        return 'warning'
      case 'avancado':
        return 'error'
      default:
        return 'default'
    }
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 180 }}>
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
                  <MenuItem key={cat.codigo} value={cat.codigo}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
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
                <MenuItem value={'instrutor.id'}>'instrutor.nome'</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
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
          </Box>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setDialogCreateCourse(true)}
            sx={{ minWidth: 160 }}
          >
            Adicionar Curso
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
                              label={categoria?.codigo}
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
                            <Chip
                              size='small'
                              label={curso.nivel_dificuldade}
                              color={
                                getNivelColor(curso.nivel_dificuldade) as any
                              }
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <Box>
                              <Typography variant='body2' fontWeight={500}>
                                {curso.total_inscritos || 0}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='success.main'
                              >
                                {curso.total_concluidos || 0} concluídos
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align='center'>
                            <Box sx={{ minWidth: 80 }}>
                              <Typography variant='body2' fontWeight={500}>
                                {curso.taxa_conclusao || 0}%
                              </Typography>
                              <LinearProgress
                                variant='determinate'
                                value={curso.taxa_conclusao || 0}
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
                                value={curso.avaliacao_media || 0}
                                readOnly
                                size='small'
                                precision={0.1}
                              />
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {curso.avaliacao_media || 0} (
                                {curso.total_avaliacoes || 0})
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
        {/* Menu de ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              if (selectedCourseForMenu) {
                setCourseToEdit(selectedCourseForMenu)
                setDialogEditCourse(true)
              }
            }}
          >
            <EditIcon sx={{ mr: 1 }} fontSize='small' />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              if (selectedCourseForMenu) {
                setConfirmDialog({
                  open: true,
                  action: 'duplicate',
                  curso: selectedCourseForMenu,
                })
              }
            }}
          >
            <FileCopy sx={{ mr: 1 }} fontSize='small' />
            Duplicar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              if (selectedCourseForMenu) {
                setConfirmDialog({
                  open: true,
                  action: 'toggle',
                  curso: selectedCourseForMenu,
                })
              }
            }}
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
        {/* Dialog de confirmação para duplicar/inativar */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() =>
            setConfirmDialog({ open: false, action: null, curso: null })
          }
          onConfirm={async () => {
            if (confirmDialog.action === 'duplicate' && confirmDialog.curso) {
              await handleDuplicateCourse(confirmDialog.curso)
              setConfirmDialog({ open: false, action: null, curso: null })
            }
            if (confirmDialog.action === 'toggle' && confirmDialog.curso) {
              await handleToggleStatus(confirmDialog.curso)
              setConfirmDialog({ open: false, action: null, curso: null })
            }
          }}
          title={
            confirmDialog.action === 'duplicate'
              ? 'Duplicar Curso'
              : 'Alterar Status do Curso'
          }
          message={
            confirmDialog.action === 'duplicate'
              ? `Deseja duplicar o curso "${confirmDialog.curso?.titulo}"?`
              : confirmDialog.curso?.ativo
                ? `Deseja inativar o curso "${confirmDialog.curso?.titulo}"?`
                : `Deseja ativar o curso "${confirmDialog.curso?.titulo}"?`
          }
          confirmText={
            confirmDialog.action === 'duplicate'
              ? 'Duplicar'
              : confirmDialog.curso?.ativo
                ? 'Inativar'
                : 'Ativar'
          }
          cancelText='Cancelar'
          severity={confirmDialog.action === 'duplicate' ? 'info' : 'warning'}
        />

        <Dialog
          open={dialogCreateCourse}
          onClose={() => setDialogCreateCourse(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>Adicionar Curso</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                borderBottom: t => `1px solid ${t.palette.divider}`,
                mb: 2,
              }}
            >
              <Tabs value={tabModal} onChange={(_, v) => setTabModal(v)}>
                <Tab value='general' label='Geral' />
                <Tab value='assignment' label='Atribuição' />
                <Tab value='settings' label='Configurações' />
                <Tab value='content' label='Conteúdo' />
              </Tabs>
            </Box>

            {tabModal === 'general' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='Código'
                      value={form.codigo}
                      onChange={e =>
                        setForm({ ...form, codigo: e.target.value })
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Select
                      fullWidth
                      value={form.ativo}
                      onChange={e =>
                        setForm({
                          ...form,
                          ativo: e.target.value === 'true',
                        })
                      }
                    >
                      <MenuItem value={'true'}>Ativo</MenuItem>
                      <MenuItem value={'false'}>Inativo</MenuItem>
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='Título'
                      value={form.titulo}
                      onChange={e =>
                        setForm({ ...form, titulo: e.target.value })
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='Descrição'
                      value={form.descricao}
                      onChange={e =>
                        setForm({ ...form, descricao: e.target.value })
                      }
                      fullWidth
                      multiline
                      minRows={3}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='Duração Estimada (horas)'
                      type='number'
                      value={form.duracao_estimada}
                      onChange={e =>
                        setForm({
                          ...form,
                          duracao_estimada: Number(e.target.value),
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='XP Oferecido'
                      type='number'
                      value={form.xp_oferecido}
                      onChange={e =>
                        setForm({
                          ...form,
                          xp_oferecido: Number(e.target.value),
                        })
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabModal === 'assignment' && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      value={form.departamento_id || ''}
                      label='Departamento'
                      onChange={e => {
                        setForm({
                          ...form,
                          departamento_id: e.target.value,
                          categoria_id: '',
                        })
                      }}
                    >
                      <MenuItem value=''>
                        <em>— Selecione o departamento —</em>
                      </MenuItem>
                      {departamentos?.map(dep => (
                        <MenuItem key={dep.id} value={dep.id}>
                          {dep.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={form.categoria_id || ''}
                      label='Categoria'
                      onChange={e =>
                        setForm({ ...form, categoria_id: e.target.value })
                      }
                    >
                      <MenuItem value=''>
                        <em>— Selecione a categoria —</em>
                      </MenuItem>
                      {categorias
                        .filter(
                          cat =>
                            !form.departamento_id ||
                            cat.departamento_id === form.departamento_id
                        )
                        .map(cat => (
                          <MenuItem key={cat.codigo} value={cat.codigo}>
                            {cat.nome}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Instrutor</InputLabel>
                    <Select
                      value={form.instrutor_id || ''}
                      label='Instrutor'
                      onChange={e =>
                        setForm({ ...form, instrutor_id: e.target.value })
                      }
                    >
                      <MenuItem value=''>
                        <em>— Selecione o instrutor —</em>
                      </MenuItem>
                      {funcionarios?.map(func => (
                        <MenuItem key={func.id} value={func.id}>
                          {func.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tabModal === 'content' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label='Sobre o curso'
                  value={form.descricao}
                  onChange={e =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={4}
                />
                <FormControl fullWidth>
                  <InputLabel>Pré-requisitos</InputLabel>
                  <Select
                    multiple
                    value={form.pre_requisitos || []}
                    onChange={e =>
                      setForm({ ...form, pre_requisitos: e.target.value })
                    }
                    renderValue={selected =>
                      (selected as string[])
                        .map(cod => {
                          const curso = cursos.find(c => c.codigo === cod)
                          return curso ? curso.titulo : cod
                        })
                        .join(', ')
                    }
                  >
                    {cursos.map(curso => (
                      <MenuItem key={curso.codigo} value={curso.codigo}>
                        <Checkbox
                          checked={form.pre_requisitos?.includes(curso.codigo)}
                        />
                        <ListItemText primary={curso.titulo} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setDialogCreateCourse(false)}
            >
              Cancelar
            </Button>
            <Button variant='contained' onClick={handleCreateCourse}>
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
