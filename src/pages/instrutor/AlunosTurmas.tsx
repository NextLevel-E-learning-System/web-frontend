import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Tabs,
  Tab,
  Paper,
  Alert,
  LinearProgress,
  Tooltip,
  Stack,
  Avatar,
  Grid,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  CheckCircle,
  Schedule,
  Cancel,
  Visibility,
  Groups as GroupsIcon,
  ManageAccounts as ManageIcon,
  Person,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import DataTable, { type Column } from '@/components/common/DataTable'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentosAdmin,
  useListarCargos,
  useFuncionarios,
  useRegisterFuncionario,
  useUpdateFuncionarioRole,
  useExcluirFuncionario,
  useDashboard,
  type FuncionarioRegister,
  type UpdateRoleInput,
  type UserRole,
  type Funcionario,
  type DashboardInstrutor,
} from '@/api/users'
import { useCourseEnrollments } from '@/api/progress'

interface UserForm {
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo_nome: string
  role: UserRole
  ativo: boolean
  biografia: string
}

export default function AlunosTurmas() {
  const { navigationItems, perfil, isGerente } = useNavigation()
  const navigate = useNavigate()
  const { data: dashboardData } = useDashboard()

  const instrutorData =
    dashboardData?.dashboard?.tipo_dashboard === 'instrutor'
      ? (dashboardData.dashboard as DashboardInstrutor)
      : null

  const meusCursos = instrutorData?.cursos || []

  // Estado principal: qual aba está ativa
  const [mainTab, setMainTab] = useState<'turmas' | 'usuarios'>('turmas')

  // Estados para aba de usuários
  const [usuariosTab, setUsuariosTab] = useState<'active' | 'disabled' | 'all'>(
    'all'
  )
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Funcionario | null>(null)

  // Estados para aba de turmas
  const [cursoSelecionado, setCursoSelecionado] = useState<string>('')
  const [turmasTab, setTurmasTab] = useState<'all' | 'active' | 'disabled'>(
    'all'
  )

  // Form state
  const [form, setForm] = useState<UserForm>({
    nome: '',
    cpf: '',
    email: '',
    departamento_id: '',
    cargo_nome: '',
    role: 'ALUNO',
    ativo: true,
    biografia: '',
  })

  // APIs para usuários
  const {
    data: usuariosResponse,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useFuncionarios()

  const { data: departamentosResponse, isLoading: loadingDepartments } =
    useListarDepartamentosAdmin()

  const { data: cargosResponse, isLoading: loadingCargos } = useListarCargos()

  const criarUsuario = useRegisterFuncionario()
  const excluirUsuario = useExcluirFuncionario()
  const atualizarUsuario = useUpdateFuncionarioRole(editingUser?.id || '0')

  // API para turmas
  const {
    data: enrollmentsData,
    isLoading: loadingEnrollments,
    error: enrollmentsError,
  } = useCourseEnrollments(
    cursoSelecionado,
    !!cursoSelecionado && mainTab === 'turmas'
  )

  const enrollments = enrollmentsData || []
  const usuarios = useMemo(
    () => usuariosResponse?.items || [],
    [usuariosResponse]
  )
  const departamentos = useMemo(
    () =>
      (departamentosResponse as { items?: unknown[] })?.items ||
      departamentosResponse ||
      [],
    [departamentosResponse]
  )
  const cargos = useMemo(
    () =>
      (cargosResponse as { items?: unknown[] })?.items || cargosResponse || [],
    [cargosResponse]
  )

  // Helper functions
  const getDepartmentName = (id: string) => {
    return (
      (departamentos as { codigo: string; nome: string }[]).find(
        d => d.codigo === id
      )?.nome || id
    )
  }

  const getCargoName = (codigo: string) => {
    return (
      (cargos as { codigo: string; nome: string }[]).find(
        c => c.codigo === codigo
      )?.nome || codigo
    )
  }

  const getUserTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return <AdminIcon fontSize='small' />
      case 'INSTRUTOR':
        return <BadgeIcon fontSize='small' />
      default:
        return <PersonIcon fontSize='small' />
    }
  }

  const getUserTypeColor = (tipo: string): 'error' | 'warning' | 'default' => {
    switch (tipo) {
      case 'ADMIN':
        return 'error'
      case 'INSTRUTOR':
        return 'warning'
      default:
        return 'default'
    }
  }

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

  // User management functions
  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      departamento_id: '',
      cargo_nome: '',
      role: 'ALUNO',
      ativo: true,
      biografia: '',
    })
  }

  const openAdd = () => {
    resetForm()
    setEditingUser(null)
    setIsAddOpen(true)
  }

  const handleAdd = async () => {
    if (
      !form.nome.trim() ||
      !form.cpf.trim() ||
      !form.email.trim() ||
      !form.departamento_id.trim()
    ) {
      toast.error('Nome, CPF, Email e Departamento são obrigatórios')
      return
    }

    try {
      const input: FuncionarioRegister = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        email: form.email.trim(),
        departamento_id: form.departamento_id.trim(),
        cargo_nome: form.cargo_nome.trim() || undefined,
      }

      await criarUsuario.mutateAsync(input)
      toast.success('Funcionário criado com sucesso!')
      setIsAddOpen(false)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao criar funcionário')
      console.error(error)
    }
  }

  const handleEdit = (usuario: Funcionario) => {
    setEditingUser(usuario)
    setForm({
      nome: usuario.nome,
      cpf: '',
      email: usuario.email,
      departamento_id: usuario.departamento_id || '',
      cargo_nome: usuario.cargo_nome || '',
      role: usuario.role || 'ALUNO',
      ativo: usuario.ativo,
      biografia: '',
    })
  }

  const handleUpdate = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error('Nome e Email são obrigatórios')
      return
    }

    if (!editingUser) return

    try {
      const input: UpdateRoleInput = {
        role: form.role,
      }

      await atualizarUsuario.mutateAsync(input)
      toast.success('Role do funcionário atualizada com sucesso!')
      setEditingUser(null)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao atualizar funcionário')
      console.error(error)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
      try {
        await excluirUsuario.mutateAsync(id)
        toast.success('Usuário excluído com sucesso!')
        refetchUsers()
      } catch (error) {
        toast.error('Erro ao excluir usuário')
        console.error(error)
      }
    }
  }

  const handleToggleAtivo = async (
    _id: string,
    nome: string,
    ativo: boolean
  ) => {
    const acao = ativo ? 'desativar' : 'ativar'
    if (confirm(`Tem certeza que deseja ${acao} o usuário "${nome}"?`)) {
      try {
        toast.success(
          `Usuário ${acao === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`
        )
        refetchUsers()
      } catch (error) {
        toast.error(`Erro ao ${acao} usuário`)
        console.error(error)
      }
    }
  }

  // Turmas functions
  const handleViewStudent = (funcionarioId: string) => {
    navigate(`/progresso/${funcionarioId}`)
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
  const allUsers = useMemo(() => {
    if (!usuarios) return []
    if (isGerente && perfil?.departamento) {
      return (usuarios as Funcionario[]).filter(
        u => u.departamento_id === perfil.departamento
      )
    }
    return usuarios
  }, [usuarios, isGerente, perfil?.departamento])

  const filteredUsers = useMemo(() => {
    return (allUsers as Funcionario[]).filter(usuario => {
      if (usuariosTab === 'all') return true
      if (usuariosTab === 'active') return usuario.ativo === true
      return usuario.ativo === false
    })
  }, [allUsers, usuariosTab])

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

  // Colunas da tabela de usuários
  const usuariosColumns: Column[] = useMemo(
    () => [
      {
        id: 'nome',
        label: 'Nome',
        minWidth: 200,
        render: (value: string) => (
          <Typography fontWeight={500}>{value}</Typography>
        ),
      },
      {
        id: 'email',
        label: 'Email',
        minWidth: 200,
        render: (value: string) => (
          <Typography
            component='span'
            sx={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            {value}
          </Typography>
        ),
      },
      {
        id: 'departamento_id',
        label: 'Departamento',
        minWidth: 150,
        render: (value: string | null) =>
          value ? getDepartmentName(value) : '—',
      },
      {
        id: 'cargo_nome',
        label: 'Cargo',
        minWidth: 150,
        render: (value: string | null) => (value ? getCargoName(value) : '—'),
      },
      {
        id: 'role',
        label: 'Tipo',
        minWidth: 120,
        render: (value: string) => (
          <Chip
            icon={getUserTypeIcon(value)}
            variant='outlined'
            label={value}
            color={getUserTypeColor(value)}
            size='small'
          />
        ),
      },
      {
        id: 'ativo',
        label: 'Status',
        minWidth: 120,
        render: (value: boolean, row: Funcionario) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={value}
              onChange={e => {
                e.stopPropagation()
                handleToggleAtivo(row.id, row.nome, row.ativo)
              }}
              size='small'
              onClick={e => e.stopPropagation()}
            />
            <Typography
              variant='body2'
              color={value ? 'success.main' : 'text.disabled'}
              fontWeight={500}
            >
              {value ? 'ATIVO' : 'INATIVO'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'actions',
        label: 'Ações',
        align: 'right' as const,
        minWidth: 100,
        render: (_, row: Funcionario) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleEdit(row)
              }}
              aria-label='editar'
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleDelete(row.id, row.nome)
              }}
              aria-label='excluir'
              color='error'
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    [getDepartmentName, getCargoName]
  )

  // Colunas da tabela de turmas
  const turmasColumns: Column[] = useMemo(
    () => [
      {
        id: 'funcionario_nome',
        label: 'Aluno',
        minWidth: 250,
        render: (value: string, row: (typeof enrollments)[0]) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant='body2' fontWeight={600}>
                {value}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.funcionario_email || 'Email não disponível'}
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

  const cursoAtual = meusCursos.find(c => c.codigo === cursoSelecionado)

  if (loadingUsers || loadingDepartments || loadingCargos) {
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
        {/* Tabs Principais */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={mainTab}
            onChange={(_, newValue) => setMainTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<GroupsIcon />}
              iconPosition='start'
              label='Turmas'
              value='turmas'
            />
            <Tab
              icon={<ManageIcon />}
              iconPosition='start'
              label='Gerenciar Usuários'
              value='usuarios'
            />
          </Tabs>
        </Paper>

        {/* Conteúdo da Aba de Turmas */}
        {mainTab === 'turmas' && (
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
                  {meusCursos.map(curso => (
                    <MenuItem key={curso.codigo} value={curso.codigo}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography>{curso.titulo}</Typography>
                        <Chip
                          label={`${curso.inscritos} aluno${curso.inscritos !== 1 ? 's' : ''}`}
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {!cursoSelecionado ? (
              <Alert severity='info' icon={<PersonIcon />}>
                <Typography variant='body2'>
                  Selecione um curso para visualizar os alunos inscritos e seus
                  progressos
                </Typography>
              </Alert>
            ) : loadingEnrollments ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography>Carregando alunos...</Typography>
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
                          Total de Alunos
                        </Typography>
                        <Typography
                          variant='h4'
                          fontWeight={700}
                          color='primary'
                        >
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

                {/* Tabela de Alunos da Turma */}
                <DataTable
                  columns={turmasColumns}
                  data={filteredEnrollments}
                  loading={loadingEnrollments}
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
        )}

        {/* Conteúdo da Aba de Usuários */}
        {mainTab === 'usuarios' && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <StatusFilterTabs
                value={usuariosTab}
                onChange={setUsuariosTab}
                activeCount={
                  (allUsers as Funcionario[]).filter(u => u.ativo === true)
                    .length
                }
                inactiveCount={
                  (allUsers as Funcionario[]).filter(u => u.ativo === false)
                    .length
                }
                activeLabel='Usuários Ativos'
                inactiveLabel='Usuários Inativos'
              />
              <Button
                onClick={openAdd}
                startIcon={<AddIcon />}
                variant='contained'
                disabled={criarUsuario.isPending}
              >
                Adicionar Usuário
              </Button>
            </Box>

            <DataTable
              columns={usuariosColumns}
              data={filteredUsers}
              loading={loadingUsers}
              getRowId={row => row.id}
            />
          </Box>
        )}

        {/* Dialog Adicionar Usuário */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Novo Usuário
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome completo'
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='CPF'
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: e.target.value })}
                  placeholder='000.000.000-00'
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Email'
                  type='email'
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={form.departamento_id}
                    onChange={e =>
                      setForm({ ...form, departamento_id: e.target.value })
                    }
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {(departamentos as { codigo: string; nome: string }[]).map(
                      dept => (
                        <MenuItem key={dept.codigo} value={dept.codigo}>
                          {dept.nome}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Cargo</InputLabel>
                  <Select
                    value={form.cargo_nome}
                    onChange={e =>
                      setForm({ ...form, cargo_nome: e.target.value })
                    }
                    label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                    {(cargos as { codigo: string; nome: string }[]).map(
                      cargo => (
                        <MenuItem key={cargo.codigo} value={cargo.codigo}>
                          {cargo.nome}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    value={form.role}
                    onChange={e =>
                      setForm({ ...form, role: e.target.value as UserRole })
                    }
                    label='Tipo de Usuário'
                  >
                    <MenuItem value='ALUNO'>Aluno</MenuItem>
                    <MenuItem value='INSTRUTOR'>Instrutor</MenuItem>
                    <MenuItem value='GERENTE'>Gerente</MenuItem>
                    <MenuItem value='ADMIN'>Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.ativo ? 'ATIVO' : 'INATIVO'}
                    onChange={e =>
                      setForm({ ...form, ativo: e.target.value === 'ATIVO' })
                    }
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {form.role === 'INSTRUTOR' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label='Biografia (Instrutor)'
                    value={form.biografia}
                    onChange={e =>
                      setForm({ ...form, biografia: e.target.value })
                    }
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    placeholder='Descreva a experiência e qualificações do instrutor...'
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setIsAddOpen(false)}
              disabled={criarUsuario.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleAdd}
              disabled={criarUsuario.isPending}
            >
              {criarUsuario.isPending ? 'Criando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Usuário */}
        <Dialog
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Usuário
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome completo'
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Email'
                  type='email'
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={form.departamento_id}
                    onChange={e =>
                      setForm({ ...form, departamento_id: e.target.value })
                    }
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {(departamentos as { codigo: string; nome: string }[]).map(
                      dept => (
                        <MenuItem key={dept.codigo} value={dept.codigo}>
                          {dept.nome}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Cargo</InputLabel>
                  <Select
                    value={form.cargo_nome}
                    onChange={e =>
                      setForm({ ...form, cargo_nome: e.target.value })
                    }
                    label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                    {(cargos as { codigo: string; nome: string }[]).map(
                      cargo => (
                        <MenuItem key={cargo.codigo} value={cargo.codigo}>
                          {cargo.nome}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    value={form.role}
                    onChange={e =>
                      setForm({ ...form, role: e.target.value as UserRole })
                    }
                    label='Tipo de Usuário'
                  >
                    <MenuItem value='ALUNO'>Aluno</MenuItem>
                    <MenuItem value='INSTRUTOR'>Instrutor</MenuItem>
                    <MenuItem value='GERENTE'>Gerente</MenuItem>
                    <MenuItem value='ADMIN'>Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.ativo ? 'ATIVO' : 'INATIVO'}
                    onChange={e =>
                      setForm({ ...form, ativo: e.target.value === 'ATIVO' })
                    }
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {form.role === 'INSTRUTOR' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label='Biografia (Instrutor)'
                    value={form.biografia}
                    onChange={e =>
                      setForm({ ...form, biografia: e.target.value })
                    }
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    placeholder='Descreva a experiência e qualificações do instrutor...'
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setEditingUser(null)}
              disabled={atualizarUsuario.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={atualizarUsuario.isPending}
            >
              {atualizarUsuario.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
