import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
  LinearProgress,
  Rating,
  IconButton,
  Menu,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  FileCopy,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { VisibilityOff } from '@mui/icons-material'
import { Visibility } from '@mui/icons-material'
import { useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import CourseModal from '@/components/admin/CourseModal'
import DataTable, { Column } from '@/components/common/DataTable'
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
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: 'all',
    instrutor: 'all',
    status: 'all',
    nivel: 'all',
  })

  // Estados para modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [courseToEdit, setCourseToEdit] = useState<Curso | null>(null)

  // Estados para ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCourseForMenu, setSelectedCourseForMenu] =
    useState<Curso | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'duplicate' | 'toggle' | null
    curso: Curso | null
  }>({ open: false, action: null, curso: null })

  // Hooks de dados
  const coursesFilters = useMemo(() => {
    const filters: any = {}
    if (filtros.categoria !== 'all') filters.categoria = filtros.categoria
    if (filtros.instrutor !== 'all') filters.instrutor = filtros.instrutor
    if (filtros.nivel !== 'all') filters.nivel = filtros.nivel

    return filters
  }, [filtros])

  const { data: cursosResponse, isLoading: loadingCursos } =
    useCourses(coursesFilters)
  const { data: categorias = [], isLoading: loadingCategorias } =
    useCategories()
  const { data: funcionarios = [] } = useFuncionarios()
  const cursos = cursosResponse?.items || []

  // Mutations
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse(courseToEdit?.codigo || '')
  const duplicateCourseMutation = useDuplicateCourse()
  const toggleStatusMutation = useToggleCourseStatus(
    cursosResponse?.items[0]?.codigo
  )


  // Contadores para as tabs (baseados nos cursos já filtrados pela API, mas sem filtro de status)
  const cursosAtivos = cursos.filter(c => c.ativo === true).length
  const cursosInativos = cursos.filter(c => c.ativo === false).length

  // Handlers do modal
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setCourseToEdit(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (curso: Curso) => {
    setModalMode('edit')
    setCourseToEdit(curso)
    setModalOpen(true)
  }

  const handleModalSubmit = async (data: CreateCourseInput | UpdateCourseInput) => {
    try {
      if (modalMode === 'create') {
        await createCourseMutation.mutateAsync(data as CreateCourseInput)
      } else if (courseToEdit) {
        await updateCourseMutation.mutateAsync(data as UpdateCourseInput)
      }
      setModalOpen(false)
    } catch (error) {
      // Erro será exibido pela mutation
      throw error
    }
  }

  const handleDuplicateCourse = async (curso: Curso) => {
    try {
      await duplicateCourseMutation.mutateAsync(curso.codigo)
      setAnchorEl(null)
    } catch (error) {
      // erro ao duplicar curso
    }
  }

  const handleToggleStatus = async (curso: Curso) => {
    try {
      await toggleStatusMutation.mutateAsync(!curso.ativo)
      setAnchorEl(null)
    } catch (error) {
      // erro ao alterar status do curso
    }
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

  const filtered = cursos.filter(curso => {
    // Aplicar APENAS o filtro de status da aba
    // Os outros filtros (categoria, instrutor, nível) já são aplicados pela API
    if (tab === 'active' && !curso.ativo) return false
    if (tab === 'disabled' && curso.ativo) return false
    
    return true
  })

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

  // Definição das colunas para o DataTable
  const courseColumns: Column[] = [
    {
      id: 'titulo',
      label: 'Curso',
      align: 'left',
      render: (_, curso) => (
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
      ),
    },
    {
      id: 'categoria',
      label: 'Categoria',
      align: 'center',
      render: (_, curso) => {
        const categoria = categorias.find(c => c.codigo === curso.categoria_id)
        return (
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
        )
      },
    },
    {
      id: 'instrutor',
      label: 'Instrutor',
      align: 'center',
      render: (_, curso) => {
        const instrutor = funcionarios.find(f => f.id === curso.instrutor_id)
        return (
          <Typography variant='body2'>
            {instrutor?.nome
              ? (() => {
                  const nomes = instrutor.nome
                    .split(' ')
                    .filter(n => n.length > 0)
                  const primeiro = nomes[0]?.charAt(0) || ''
                  const ultimo =
                    nomes.length > 1
                      ? nomes[nomes.length - 1]?.charAt(0) || ''
                      : ''
                  return `${primeiro}${ultimo}`.toUpperCase()
                })()
              : '-'}
          </Typography>
        )
      },
    },
    {
      id: 'nivel',
      label: 'Nível',
      align: 'center',
      render: (_, curso) => (
        <Chip
          size='small'
          label={curso.nivel_dificuldade}
          color={getNivelColor(curso.nivel_dificuldade) as any}
        />
      ),
    },
    {
      id: 'inscritos',
      label: 'Inscritos',
      align: 'center',
      render: (_, curso) => (
        <Box>
          <Typography variant='body2' fontWeight={500}>
            {curso.total_inscritos || 0}
          </Typography>
          <Typography variant='caption' color='success.main'>
            {curso.total_concluidos || 0} concluídos
          </Typography>
        </Box>
      ),
    },
    {
      id: 'taxa_conclusao',
      label: 'Taxa Conclusão',
      align: 'center',
      render: (_, curso) => (
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
      ),
    },
    {
      id: 'avaliacao',
      label: 'Avaliação',
      align: 'center',
      render: (_, curso) => (
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
            {curso.avaliacao_media || 0} ({curso.total_avaliacoes || 0})
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (_, curso) => (
        <FormControlLabel
          control={
            <Switch
              checked={curso.ativo}
              onChange={async () => {
                await handleToggleStatus(curso)
              }}
              color='primary'
            />
          }
          label={curso.ativo ? 'Ativo' : 'Inativo'}
        />
      ),
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center',
      render: (_, curso) => (
        <IconButton
          size='small'
          onClick={e => handleOpenMenu(e, curso)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ]

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
            onClick={handleOpenCreateModal}
            sx={{ minWidth: 160 }}
          >
            Adicionar Curso
          </Button>
        </Box>
        {/* Tabs de Status */}
        <StatusFilterTabs
          value={tab}
          onChange={setTab}
          activeCount={cursosAtivos}
          inactiveCount={cursosInativos}
          activeLabel='Cursos Ativos'
          inactiveLabel='Cursos Inativos'
        />
        {/* Tabela de Cursos */}
        <DataTable
          data={filtered}
          columns={courseColumns}
          loading={loadingCursos || loadingCategorias}
          getRowId={(curso) => curso.codigo}
          rowsPerPage={5}
        />
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
                handleOpenEditModal(selectedCourseForMenu)
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

        {/* Modal de Curso (Criar/Editar) */}
        <CourseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          isLoading={
            modalMode === 'create' 
              ? createCourseMutation.isPending 
              : updateCourseMutation.isPending
          }
          mode={modalMode}
          courseToEdit={courseToEdit}
          categorias={categorias}
          funcionarios={funcionarios}
          cursos={cursos}
        />
      </Box>
    </DashboardLayout>
  )
}
