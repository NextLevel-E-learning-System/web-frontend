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
  Tabs,
  Tab,
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
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Badge as BadgeIcon,
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

interface InstructorForm {
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo: string
  biografia: string
  status: 'ATIVO' | 'INATIVO'
}

export default function AdminInstructors() {
  const { navigationItems } = useNavigation()

  // Filtrar apenas instrutores
  const {
    data: todosUsuarios = { items: [] },
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useListarUsuarios({
    tipo_usuario: 'INSTRUTOR',
  })

  const { data: departamentos = [], isLoading: loadingDepartments } =
    useListarDepartamentos()
  const { data: cargos = [], isLoading: loadingCargos } = useListarCargos()
  const criarUsuario = useCriarUsuario()
  const [editingInstructor, setEditingInstructor] =
    useState<UsuarioResumo | null>(null)
  const atualizarUsuario = useAtualizarUsuario(editingInstructor?.id || '')
  const excluirUsuario = useExcluirUsuario()

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('active')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<InstructorForm>({
    nome: '',
    cpf: '',
    email: '',
    departamento_id: '',
    cargo: '',
    biografia: '',
    status: 'ATIVO',
  })

  const title = useMemo(
    () => (editingInstructor ? 'Editar Instrutor' : 'Gerenciar Instrutores'),
    [editingInstructor]
  )

  // Filtrar instrutores por status
  const instrutores = todosUsuarios.items || []
  const filtered = instrutores.filter(i => {
    if (tab === 'all') return true
    if (tab === 'active') return i.status === 'ATIVO'
    return i.status === 'INATIVO'
  })

  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      departamento_id: '',
      cargo: '',
      biografia: '',
      status: 'ATIVO',
    })
  }

  const openAdd = () => {
    resetForm()
    setEditingInstructor(null)
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
        tipo_usuario: 'INSTRUTOR',
        status: form.status,
        biografia: form.biografia.trim() || undefined,
      }

      await criarUsuario.mutateAsync(input)

      toast.success('Instrutor criado com sucesso!')
      setIsAddOpen(false)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao criar instrutor')
      console.error(error)
    }
  }

  const handleEdit = (instructor: UsuarioResumo) => {
    setEditingInstructor(instructor)
    setForm({
      nome: instructor.nome,
      cpf: '', // CPF não é retornado na listagem por segurança
      email: instructor.email,
      departamento_id: instructor.departamento_id || '',
      cargo: instructor.cargo || '',
      biografia: '', // Será carregado do perfil completo se necessário
      status: instructor.status || 'ATIVO',
    })
  }

  const handleUpdate = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error('Nome e Email são obrigatórios')
      return
    }

    if (!editingInstructor) return

    try {
      const input: AtualizacaoAdmin = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        departamento_id: form.departamento_id.trim() || undefined,
        cargo: form.cargo.trim() || undefined,
        tipo_usuario: 'INSTRUTOR',
        status: form.status,
        biografia: form.biografia.trim() || undefined,
      }

      await atualizarUsuario.mutateAsync(input)

      toast.success('Instrutor atualizado com sucesso!')
      setEditingInstructor(null)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao atualizar instrutor')
      console.error(error)
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o instrutor "${nome}"?`)) {
      try {
        await excluirUsuario.mutateAsync(id)
        toast.success('Instrutor excluído com sucesso!')
        refetchUsers()
      } catch (error) {
        toast.error('Erro ao excluir instrutor')
        console.error(error)
      }
    }
  }

  const toggleStatus = (instructor: UsuarioResumo) => {
    setEditingInstructor(instructor)
    const newStatus = instructor.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'

    // Atualizar diretamente
    atualizarUsuario.mutate(
      {
        status: newStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            `Instrutor ${newStatus === 'ATIVO' ? 'ativado' : 'desativado'} com sucesso!`
          )
          setEditingInstructor(null)
          refetchUsers()
        },
        onError: () => {
          toast.error('Erro ao alterar status do instrutor')
          setEditingInstructor(null)
        },
      }
    )
  }

  const getDepartmentName = (id: string) => {
    return departamentos.find(d => d.codigo === id)?.nome || id
  }

  const getCargoName = (id: string) => {
    return cargos.find(c => c.id === id)?.nome || id
  }

  if (loadingUsers || loadingDepartments || loadingCargos) {
    return (
      <DashboardLayout title='Gerenciar Instrutores' items={navigationItems}>
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
          <Button
            href='/dashboard/admin'
            startIcon={<ArrowBackIcon />}
            variant='outlined'
          >
            Voltar ao Dashboard
          </Button>
          <Button
            onClick={openAdd}
            startIcon={<AddIcon />}
            variant='contained'
            disabled={criarUsuario.isPending}
          >
            Adicionar Instrutor
          </Button>
        </Box>

        <StatusFilterTabs
          value={tab}
          onChange={setTab}
          activeCount={instrutores.filter(i => i.status === 'ATIVO').length}
          inactiveCount={instrutores.filter(i => i.status === 'INATIVO').length}
          activeLabel='Instrutores Ativos'
          inactiveLabel='Instrutores Inativos'
        />

        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                {tab === 'active'
                  ? 'Instrutores Ativos'
                  : tab === 'disabled'
                    ? 'Instrutores Inativos'
                    : 'Todos os Instrutores'}
              </Typography>
            }
            subheader={`${filtered.length} instrutores encontrados`}
          />
          <CardContent>
            {filtered.length === 0 ? (
              <Alert severity='info' sx={{ mt: 2 }}>
                {tab === 'all'
                  ? 'Nenhum instrutor cadastrado. Clique em "Adicionar Instrutor" para começar.'
                  : `Nenhum instrutor ${tab === 'active' ? 'ativo' : 'desabilitado'} encontrado.`}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(instructor => (
                    <TableRow key={instructor.id} hover>
                      <TableCell>
                        <Typography
                          component='span'
                          sx={{
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                          {instructor.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {instructor.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>
                        {instructor.departamento_id
                          ? getDepartmentName(instructor.departamento_id)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {instructor.cargo
                          ? getCargoName(instructor.cargo)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Switch
                            checked={instructor.status === 'ATIVO'}
                            onChange={() => toggleStatus(instructor)}
                          />
                          <Chip
                            size='small'
                            color={
                              instructor.status === 'ATIVO'
                                ? 'success'
                                : 'default'
                            }
                            label={instructor.status || 'ATIVO'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(instructor)}
                          aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() =>
                            handleDelete(instructor.id, instructor.nome)
                          }
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

        {/* Dialog Adicionar Instrutor */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeIcon />
              Novo Instrutor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
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
                  label='Email'
                  type='email'
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia do Instrutor'
                  value={form.biografia}
                  onChange={e =>
                    setForm({ ...form, biografia: e.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e especialidades do instrutor...'
                />
              </Grid>
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

        {/* Dialog Editar Instrutor */}
        <Dialog
          open={!!editingInstructor}
          onClose={() => setEditingInstructor(null)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Instrutor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia do Instrutor'
                  value={form.biografia}
                  onChange={e =>
                    setForm({ ...form, biografia: e.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e especialidades do instrutor...'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setEditingInstructor(null)}
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
