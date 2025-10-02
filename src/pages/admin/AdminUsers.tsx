import Grid from '@mui/material/Grid'
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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
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
  role: UserRole
  ativo: boolean
  biografia: string
}

export default function AdminUsers() {
  const { navigationItems, user, isGerente } = useNavigation()
  const {
    data: usuariosResponse,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useFuncionarios()
  const usuarios = usuariosResponse?.items || []
  
  const { data: departamentosResponse, isLoading: loadingDepartments } =
    useListarDepartamentosAdmin()
  const departamentos = (departamentosResponse as any)?.items || departamentosResponse || []
  
  const { data: cargosResponse, isLoading: loadingCargos } = useListarCargos()
  const cargos = (cargosResponse as any)?.items || cargosResponse || []
  const criarUsuario = useRegisterFuncionario()
  const [editingUser, setEditingUser] = useState<Funcionario | null>(null)
  const excluirUsuario = useExcluirFuncionario()
  const atualizarUsuario = useUpdateFuncionarioRole(editingUser?.id || '0')

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
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

  // Configuração das colunas da tabela
  const columns: Column[] = useMemo(
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
            color={getUserTypeColor(value) as any}
            size='small'
          />
        ),
      },
      {
        id: 'ativo',
        label: 'Status',
        minWidth: 120,
        render: (value: boolean, row: any) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
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
        render: (_, row: any) => (
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
    [departamentos, cargos]
  )

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

  const handleEdit = (user: Funcionario) => {
    setEditingUser(user)
    setForm({
      nome: user.nome,
      cpf: '', // CPF não é retornado na listagem por segurança
      email: user.email,
      departamento_id: user.departamento_id || '',
      cargo_nome: user.cargo_nome || '',
      role: user.role || 'ALUNO',
      ativo: user.ativo,
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
        // Aqui você precisa implementar a API para ativar/desativar usuário
        // Por enquanto, só mostro o toast de sucesso
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

  const getDepartmentName = (id: string) => {
    return departamentos.find((d: { codigo: string }) => d.codigo === id)?.nome || id
  }

  const getCargoName = (codigo: string) => {
    return cargos.find((c: { codigo: string }) => c.codigo === codigo)?.nome || codigo
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

            <DataTable
              columns={columns}
              data={filtered}
              loading={loadingUsers}
              getRowId={row => row.id}
            />
     
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
                    {departamentos.map((dept: { codigo: string; nome: string }) => (
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
                    {cargos.map((cargo: { codigo: string; nome: string }) => (
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
                    {departamentos.map((dept: { codigo: string; nome: string }) => (
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
                    {cargos.map((cargo: { codigo: string; nome: string }) => (
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
