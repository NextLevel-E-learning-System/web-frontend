import {
  Box,
  Button,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  LinearProgress,
  IconButton,
  Menu,
  Switch,
  Badge,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  FileCopy,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  RateReview,
} from '@mui/icons-material'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import DataTable, { type Column } from '@/components/common/DataTable'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useCourses,
  useCategories,
  useDuplicateCourse,
  useToggleCourseStatus,
  type Course as Curso,
} from '@/api/courses'
import { useFuncionarios } from '@/api/users'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import { useAuth } from '@/contexts/AuthContext'

interface Filtros {
  categoria: string
  instrutor: string
  status: 'all' | 'active' | 'inactive'
  nivel: string
}

export default function AdminCourses() {
  const { navigationItems } = useNavigation()
  const { user } = useAuth()
  const isInstrutor = user?.role === 'INSTRUTOR'

  // Estados
  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: 'all',
    instrutor: 'all',
    status: 'all',
    nivel: 'all',
  })

  // Navegação para editor dedicado
  const navigate = useNavigate()

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
    const filters: Record<string, string | boolean> = {}
    if (filtros.categoria !== 'all') filters.categoria = filtros.categoria
    if (filtros.instrutor !== 'all') filters.instrutor = filtros.instrutor
    if (filtros.nivel !== 'all') filters.nivel = filtros.nivel

    // Se o usuário for INSTRUTOR, filtrar apenas seus cursos
    if (isInstrutor && user?.id) {
      filters.instrutor = user.id
    }

    return filters
  }, [filtros, isInstrutor, user?.id])

  const {
    data: cursosResponse,
    isLoading: loadingCursos,
    refetch,
  } = useCourses(coursesFilters)
  const location = useLocation()
  // Refetch cursos ao voltar para a página
  useEffect(() => {
    // Se vier de uma navegação (ex: edição de curso/módulo), faz refetch
    if (location.state?.fromEditor) {
      refetch()
    }
    // Sempre faz refetch ao montar
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])
  const { data: categorias = [], isLoading: loadingCategorias } =
    useCategories()
  const { data: funcionariosResponse, isLoading: loadingFuncionarios } =
    useFuncionarios()

  const cursos = useMemo(
    () => cursosResponse?.items || [],
    [cursosResponse?.items]
  )
  const funcionarios = funcionariosResponse?.items || []

  // Mutations
  // Criação/Edição agora ocorrem em CourseEditorPage
  const duplicateCourseMutation = useDuplicateCourse()
  const toggleStatusMutation = useToggleCourseStatus()

  // Contadores para as tabs (baseados nos cursos já filtrados pela API, mas sem filtro de status)
  const cursosAtivos = cursos.filter(c => c.ativo === true).length
  const cursosInativos = cursos.filter(c => c.ativo === false).length

  // Handlers substituídos por navegação
  const handleCreateCourse = () => navigate('/gerenciar/cursos/novo-curso')

  const handleEditCourse = (curso: Curso) => {
    navigate(`/gerenciar/cursos/${curso.codigo}`)
  }

  const handleViewCourse = (curso: Curso) => {
    const hasPendentes = (curso.pendentes_correcao || 0) > 0
    navigate(`/gerenciar/cursos/${curso.codigo}`, {
      state: {
        viewOnly: true,
        ...(hasPendentes && { nextTab: 'reviews' }),
      },
    })
  }

  const canEditCourse = (curso: Curso) => {
    if (isInstrutor && (curso.total_inscricoes || 0) > 0) {
      return false
    }
    return true
  }

  const handleDuplicateCourse = async (curso: Curso) => {
    try {
      await duplicateCourseMutation.mutateAsync(curso.codigo)
      setAnchorEl(null)
    } catch {
      // erro ao duplicar curso
    }
  }

  const handleToggleStatus = async (curso: Curso) => {
    try {
      await toggleStatusMutation.mutateAsync({
        codigo: curso.codigo,
        active: curso.ativo ? false : true,
      })
      setAnchorEl(null)
    } catch (error) {
      console.error('Erro ao alterar status do curso:', error)
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

  const filtered = useMemo(() => {
    return cursos.filter(curso => {
      if (tab === 'active' && !curso.ativo) return false
      if (tab === 'disabled' && curso.ativo) return false
      return true
    })
  }, [cursos, tab])

  const getRowId = useCallback((curso: Curso) => curso.codigo, [])

  const getNivelColor = (
    nivel?: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (nivel) {
      case 'Iniciante':
        return 'success'
      case 'Intermediário':
        return 'warning'
      case 'Avançado':
        return 'error'
      default:
        return 'default'
    }
  }

  // Definição das colunas para o DataTable
  const allColumns: (Column | null)[] = [
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
            <Typography variant='caption' color='text.secondary'>
              {curso.duracao_estimada}h
            </Typography>
            <TrendingUpIcon fontSize='small' color='action' />
            <Typography variant='caption' color='text.secondary'>
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
    !isInstrutor
      ? {
          id: 'instrutor_nome',
          label: 'Instrutor',
          align: 'center' as const,
          render: (value: string | null) => (
            <Typography variant='body2'>{value || '-'}</Typography>
          ),
        }
      : null,
    {
      id: 'nivel',
      label: 'Dificuldade',
      align: 'center' as const,
      render: (_value: unknown, curso: Curso) => (
        <Box>
          <Chip
            size='small'
            label={curso.nivel_dificuldade || '-'}
            color={getNivelColor(curso.nivel_dificuldade)}
          />
        </Box>
      ),
    },
    {
      id: 'inscritos',
      label: 'Inscrições',
      align: 'center',
      render: (_, curso) => (
        <Box>
          <Typography variant='body2' fontWeight={500}>
            {curso.total_inscricoes || 0} inscrições
          </Typography>
          <Typography variant='caption' color='success.main'>
            {curso.total_conclusoes || 0} conclusões
          </Typography>
        </Box>
      ),
    },
    // Coluna de correções pendentes (apenas para INSTRUTOR)
    isInstrutor
      ? {
          id: 'pendentes_correcao',
          label: 'Correções Pendentes',
          align: 'center' as const,
          render: (_value: unknown, curso: Curso) => (
            <Typography
              variant='body2'
              fontWeight={500}
              color={
                curso.pendentes_correcao && curso.pendentes_correcao > 0
                  ? 'warning.main'
                  : 'text.secondary'
              }
            >
              {curso.pendentes_correcao || 0}
            </Typography>
          ),
        }
      : null,
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
      id: 'status',
      label: 'Status',
      align: 'center',
      render: (_, curso) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Switch
            size='small'
            checked={curso.ativo}
            onChange={async e => {
              e.stopPropagation()
              await handleToggleStatus(curso)
            }}
            onClick={e => e.stopPropagation()}
            color='primary'
            disabled={!canEditCourse(curso)}
          />
          <Typography variant='caption' color='text.secondary'>
            {curso.ativo ? 'Ativo' : 'Inativo'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center',
      render: (_, curso) => {
        const hasPendentes = isInstrutor && (curso.pendentes_correcao || 0) > 0
        return (
          <Tooltip
            title={hasPendentes ? 'Correções pendentes!' : 'Mais opções'}
          >
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleOpenMenu(e, curso)
              }}
            >
              <Badge
                badgeContent={hasPendentes ? curso.pendentes_correcao : 0}
                color='warning'
              >
                <MoreVertIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )
      },
    },
  ]

  const courseColumns: Column[] = allColumns.filter(
    (col): col is Column => col !== null
  )

  if (loadingCursos || loadingCategorias || loadingFuncionarios) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
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
            {/* Filtro de instrutor - escondido para INSTRUTOR pois ele só vê seus próprios cursos */}
            {!isInstrutor && (
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
                  {funcionarios
                    .filter(func => func.role === 'INSTRUTOR')
                    .map(instrutor => (
                      <MenuItem key={instrutor.id} value={instrutor.id}>
                        {instrutor.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
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
                <MenuItem value='Iniciante'>Iniciante</MenuItem>
                <MenuItem value='Intermediário'>Intermediário</MenuItem>
                <MenuItem value='Avançado'>Avançado</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
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
          getRowId={getRowId}
        />
        {/* Menu de ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          {/* Opção especial para correções pendentes (apenas para INSTRUTOR) */}
          {isInstrutor &&
            selectedCourseForMenu &&
            (selectedCourseForMenu.pendentes_correcao || 0) > 0 && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu()
                  if (selectedCourseForMenu) {
                    navigate(
                      `/gerenciar/cursos/${selectedCourseForMenu.codigo}`,
                      {
                        state: { viewOnly: true, nextTab: 'reviews' },
                      }
                    )
                  }
                }}
                sx={{
                  color: 'warning.main',
                  fontWeight: 500,
                }}
              >
                <RateReview sx={{ mr: 1 }} fontSize='small' />
                Ver Correções ({selectedCourseForMenu.pendentes_correcao})
              </MenuItem>
            )}
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              if (selectedCourseForMenu) {
                handleViewCourse(selectedCourseForMenu)
              }
            }}
          >
            <VisibilityIcon sx={{ mr: 1 }} fontSize='small' />
            Visualizar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu()
              if (selectedCourseForMenu) {
                handleEditCourse(selectedCourseForMenu)
              }
            }}
            disabled={
              selectedCourseForMenu
                ? !canEditCourse(selectedCourseForMenu)
                : false
            }
            sx={{
              opacity:
                selectedCourseForMenu && !canEditCourse(selectedCourseForMenu)
                  ? 0.5
                  : 1,
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
      </Box>
    </DashboardLayout>
  )
}
