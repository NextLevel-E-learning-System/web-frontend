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
  useListarUsuarios,
  useListarDepartamentos,
  useListarCargos,
  useCriarUsuario,
  useAtualizarUsuario,
  useExcluirUsuario,
  type UsuarioResumo,
  type CriarUsuarioInput,
  type AtualizacaoAdmin,
} from '@/hooks/users'

interface UserForm {
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo: string
  tipo_usuario: 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN'
  status: 'ATIVO' | 'INATIVO'
  biografia: string
}

export default function AdminUsers() {
  const { navigationItems } = useNavigation()
  const {
    data: usuarios = { items: [] },
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useListarUsuarios()
  const { data: departamentos = [], isLoading: loadingDepartments } =
    useListarDepartamentos()
  const { data: cargos = [], isLoading: loadingCargos } = useListarCargos()
  const criarUsuario = useCriarUsuario()
  const [editingUser, setEditingUser] = useState<UsuarioResumo | null>(null)
  const atualizarUsuario = useAtualizarUsuario(editingUser?.id || '')
  const excluirUsuario = useExcluirUsuario()

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('active')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<UserForm>({
    nome: '',
    cpf: '',
    email: '',
    departamento_id: '',
    cargo: '',
    tipo_usuario: 'FUNCIONARIO',
    status: 'ATIVO',
    biografia: '',
  })

  const title = useMemo(
    () => (editingUser ? 'Editar Usuário' : 'Gerenciar Usuários'),
    [editingUser]
  )

  // Filtrar usuários por status
  const allUsers = usuarios.items || []
  const filtered = allUsers.filter(user => {
    if (tab === 'all') return true
    if (tab === 'active') return user.status === 'ATIVO'
    return user.status === 'INATIVO'
  })

  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      departamento_id: '',
      cargo: '',
      tipo_usuario: 'FUNCIONARIO',
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
      const input: CriarUsuarioInput = {
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        email: form.email.trim(),
        departamento_id: form.departamento_id.trim(),
        cargo: form.cargo.trim() || undefined,
        tipo_usuario: form.tipo_usuario,
        status: form.status,
        biografia: form.biografia.trim() || undefined,
      }

      await criarUsuario.mutateAsync(input)

      toast.success('Usuário criado com sucesso!')
      setIsAddOpen(false)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao criar usuário')
      console.error(error)
    }
  }

  const handleEdit = (user: UsuarioResumo) => {
    setEditingUser(user)
    setForm({
      nome: user.nome,
      cpf: '', // CPF não é retornado na listagem por segurança
      email: user.email,
      departamento_id: user.departamento_id || '',
      cargo: user.cargo || '',
      tipo_usuario: user.tipo_usuario || 'FUNCIONARIO',
      status: user.status || 'ATIVO',
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
      const input: AtualizacaoAdmin = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        departamento_id: form.departamento_id.trim() || undefined,
        cargo: form.cargo.trim() || undefined,
        tipo_usuario: form.tipo_usuario,
        status: form.status,
        biografia: form.biografia.trim() || undefined,
      }

      await atualizarUsuario.mutateAsync(input)

      toast.success('Usuário atualizado com sucesso!')
      setEditingUser(null)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao atualizar usuário')
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

  const getCargoName = (id: string) => {
    return cargos.find(c => c.id === id)?.nome || id
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
            mb: 3,
          }}
        >
          <StatusFilterTabs
            value={tab}
            onChange={setTab}
            activeCount={allUsers.filter(u => u.status === 'ATIVO').length}
            inactiveCount={allUsers.filter(u => u.status === 'INATIVO').length}
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
              <Alert severity='info' sx={{ mt: 2 }}>
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
                        {user.cargo ? getCargoName(user.cargo) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getUserTypeIcon(
                            user.tipo_usuario || 'FUNCIONARIO'
                          )}
                          variant='outlined'
                          label={user.tipo_usuario || 'FUNCIONARIO'}
                          color={
                            getUserTypeColor(
                              user.tipo_usuario || 'FUNCIONARIO'
                            ) as any
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          color={
                            user.status === 'ATIVO' ? 'success' : 'default'
                          }
                          label={user.status || 'ATIVO'}
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
                    value={form.cargo}
                    onChange={e => setForm({ ...form, cargo: e.target.value })}
                    label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                    {cargos.map(cargo => (
                      <MenuItem key={cargo.id} value={cargo.id}>
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
                    value={form.cargo}
                    onChange={e => setForm({ ...form, cargo: e.target.value })}
                    label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                    {cargos.map(cargo => (
                      <MenuItem key={cargo.id} value={cargo.id}>
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
