import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentos,
  useListarCargos,
  useFuncionarios,
  useRegisterFuncionario,
  useUpdateFuncionarioRole,
  useExcluirFuncionario,
  type PerfilUsuario,
  type FuncionarioRegister,
  type UpdateRoleInput,
  type UserRole,
  type Funcionario,
} from '@/api/users'

interface UserForm {
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo_nome: string
  tipo_usuario: UserRole
  status: 'ATIVO' | 'INATIVO'
  biografia: string
}

// Interface estendida para o frontend incluir tipo_usuario
interface FuncionarioWithRole extends Funcionario {
  tipo_usuario?: UserRole
}

export default function AdminUsers() {
  const { navigationItems, user, isGerente, isAdmin } = useNavigation()
  const {
    data: usuarios = [],
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useFuncionarios()
  const { data: departamentos = [], isLoading: loadingDepartments } =
    useListarDepartamentos()
  const { data: cargos = [], isLoading: loadingCargos } = useListarCargos()
  const criarUsuario = useRegisterFuncionario()
  const [editingUser, setEditingUser] = useState<PerfilUsuario | null>(null)
  const excluirUsuario = useExcluirFuncionario()
  const atualizarUsuario = useUpdateFuncionarioRole(editingUser?.id || '0')

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('active')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<UserForm>({
    nome: '',
    cpf: '',
    email: '',
    departamento_id: '',
    cargo_nome: '',
    tipo_usuario: 'ALUNO',
    status: 'ATIVO',
    biografia: '',
  })

  // Título dinâmico baseado na role
  const title = useMemo(() => {
    if (editingUser) return 'Editar Usuário'
    if (isGerente)
      return `Funcionários - Departamento ${user?.departamento_id || ''}`
    return 'Gerenciar Usuários'
  }, [editingUser, isGerente, user?.departamento_id])

  // Filtrar usuários: GERENTE vê apenas do seu departamento, ADMIN vê todos
  const allUsers = useMemo(() => {
    if (!usuarios) return []

    if (isGerente && user?.departamento_id) {
      return usuarios.filter(u => u.departamento_id === user.departamento_id)
    }

    return usuarios
  }, [usuarios, isGerente, user?.departamento_id])

  // Filtrar usuários por status
  const filtered = allUsers.filter(user => {
    if (tab === 'all') return true
    if (tab === 'active') return user.ativo === true
    return user.ativo === false
  })

  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      departamento_id: '',
      cargo_nome: '',
      tipo_usuario: 'ALUNO',
      status: 'ATIVO',
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

  const handleEdit = (user: PerfilUsuario) => {
    setEditingUser(user)
    setForm({
      nome: user.nome,
      cpf: '', // CPF não é retornado na listagem por segurança
      email: user.email,
      departamento_id: user.departamento_id || '',
      cargo_nome: user.cargo_nome || '',
      tipo_usuario: user.tipo_usuario || 'ALUNO',
      status: user.ativo ? 'ATIVO' : 'INATIVO',
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
      // Para atualizar role, usamos API específica de role
      const input: UpdateRoleInput = {
        role: form.tipo_usuario,
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

  const getDepartmentName = (id: string) => {
    return departamentos.find(d => d.codigo === id)?.nome || id
  }

  const getCargoName = (codigo: string) => {
    return cargos.find(c => c.codigo === codigo)?.nome || codigo
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

  const getUserTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'error'
      case 'INSTRUTOR':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (loadingUsers || loadingDepartments || loadingCargos) {
    return (
      <DashboardLayout title='Gerenciar Usuários' items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={title} items={navigationItems}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <StatusFilterTabs
            value={tab}
            onChange={setTab}
            activeCount={allUsers.filter(u => u.ativo === true).length}
            inactiveCount={allUsers.filter(u => u.ativo === false).length}
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

        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                {tab === 'active'
                  ? 'Usuários Ativos'
                  : tab === 'disabled'
                    ? 'Usuários Inativos'
                    : 'Todos os Usuários'}
              </Typography>
            }
            subheader={`${filtered.length} usuários encontrados`}
          />
          <CardContent>
            {filtered.length === 0 ? (
              <Alert severity='info'>
                {tab === 'all'
                  ? 'Nenhum usuário cadastrado. Clique em "Adicionar Usuário" para começar.'
                  : `Nenhum usuário ${tab === 'active' ? 'ativo' : 'inativo'} encontrado.`}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(user => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Typography fontWeight={500}>{user.nome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          component='span'
                          sx={{
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.departamento_id
                          ? getDepartmentName(user.departamento_id)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {user.cargo_nome ? getCargoName(user.cargo_nome) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getUserTypeIcon(
                            (user as FuncionarioWithRole).tipo_usuario ||
                              'FUNCIONARIO'
                          )}
                          variant='outlined'
                          label={
                            (user as FuncionarioWithRole).tipo_usuario ||
                            'FUNCIONARIO'
                          }
                          color={
                            getUserTypeColor(
                              (user as FuncionarioWithRole).tipo_usuario ||
                                'FUNCIONARIO'
                            ) as any
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          color={user.ativo ? 'success' : 'default'}
                          label={user.ativo ? 'ATIVO' : 'INATIVO'}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(user)}
                          aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(user.id, user.nome)}
                          aria-label='excluir'
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Adicionar Usuário */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='md'
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
                    {departamentos.map(dept => (
                      <MenuItem key={dept.codigo} value={dept.codigo}>
                        {dept.nome}
                      </MenuItem>
                    ))}
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
                    {cargos.map(cargo => (
                      <MenuItem key={cargo.codigo} value={cargo.codigo}>
                        {cargo.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    value={form.tipo_usuario}
                    onChange={e =>
                      setForm({ ...form, tipo_usuario: e.target.value as any })
                    }
                    label='Tipo de Usuário'
                  >
                    <MenuItem value='FUNCIONARIO'>Funcionário</MenuItem>
                    <MenuItem value='INSTRUTOR'>Instrutor</MenuItem>
                    <MenuItem value='ADMIN'>Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    onChange={e =>
                      setForm({ ...form, status: e.target.value as any })
                    }
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {form.tipo_usuario === 'INSTRUTOR' && (
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
                    {departamentos.map(dept => (
                      <MenuItem key={dept.codigo} value={dept.codigo}>
                        {dept.nome}
                      </MenuItem>
                    ))}
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
                    {cargos.map(cargo => (
                      <MenuItem key={cargo.codigo} value={cargo.codigo}>
                        {cargo.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    value={form.tipo_usuario}
                    onChange={e =>
                      setForm({ ...form, tipo_usuario: e.target.value as any })
                    }
                    label='Tipo de Usuário'
                  >
                    <MenuItem value='FUNCIONARIO'>Funcionário</MenuItem>
                    <MenuItem value='INSTRUTOR'>Instrutor</MenuItem>
                    <MenuItem value='ADMIN'>Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    onChange={e =>
                      setForm({ ...form, status: e.target.value as any })
                    }
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {form.tipo_usuario === 'INSTRUTOR' && (
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
