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
  Person as PersonIcon,
  Badge as BadgeIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import DataTable, { type Column } from '@/components/common/DataTable'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentosAdmin,
  useListarCargos,
  useFuncionarios,
  useRegisterFuncionario,
  useUpdateFuncionario,
  type FuncionarioRegister,
  type UpdateFuncionarioInput,
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
}

export default function AdminUsers() {
  const { navigationItems, perfil, isGerente } = useNavigation()
  const {
    data: usuariosResponse,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useFuncionarios()

  const usuarios = useMemo(
    () => usuariosResponse?.items || [],
    [usuariosResponse]
  )

  const { data: departamentosResponse, isLoading: loadingDepartments } =
    useListarDepartamentosAdmin()
  const departamentos = useMemo(() => {
    const items =
      (departamentosResponse as any)?.items || departamentosResponse || []
    console.log('Departamentos processados:', items)
    return items
  }, [departamentosResponse])

  const [selectedDept, setSelectedDept] = useState<string>('all')
  const { data: cargosResponse, isLoading: loadingCargos } = useListarCargos()
  const cargos = useMemo(() => {
    const items = (cargosResponse as any)?.items || cargosResponse || []
    console.log('Cargos processados:', items)
    return items
  }, [cargosResponse])
  const criarUsuario = useRegisterFuncionario()
  const [editingUser, setEditingUser] = useState<Funcionario | null>(null)
  const atualizarUsuario = useUpdateFuncionario(editingUser?.id || '0')
  const [userToToggle, setUserToToggle] = useState<string>('')
  const toggleUsuario = useUpdateFuncionario(userToToggle)

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [toggleDialog, setToggleDialog] = useState<{
    open: boolean
    user: Funcionario | null
    newStatus: boolean
  }>({
    open: false,
    user: null,
    newStatus: false,
  })
  const [form, setForm] = useState<UserForm>({
    nome: '',
    cpf: '',
    email: '',
    departamento_id: '',
    cargo_nome: '',
    role: 'FUNCIONARIO',
    ativo: true,
  })

  // Funções auxiliares para as colunas
  const getDepartmentName = useCallback(
    (id: string) => {
      return (
        departamentos.find((d: { codigo: string }) => d.codigo === id)?.nome ||
        id
      )
    },
    [departamentos]
  )

  const getCargoName = useCallback(
    (codigo: string) => {
      return (
        cargos.find((c: { codigo: string }) => c.codigo === codigo)?.nome ||
        codigo
      )
    },
    [cargos]
  )

  const maskCPF = (cpf: string) => {
    if (!cpf) return ''
    // Remove formatação
    const numbers = cpf.replace(/\D/g, '')
    // Formato: 123.***.***-45 (mostra primeiros 3 e últimos 2)
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}.***.***-${numbers.slice(-2)}`
    }
    return cpf
  }

  const handleEdit = useCallback(
    (user: Funcionario) => {
      setEditingUser(user)
      // Buscar o código do cargo baseado no nome
      const cargoEncontrado = (
        cargos as { codigo: string; nome: string }[]
      ).find(c => c.nome === user.cargo_nome)
      setForm({
        nome: user.nome,
        cpf: maskCPF(user.cpf),
        email: user.email,
        departamento_id: user.departamento_id || '',
        cargo_nome: cargoEncontrado?.codigo || user.cargo_nome || '',
        role: user.role || 'FUNCIONARIO',
        ativo: user.ativo,
      })
    },
    [cargos]
  )

  const handleToggleAtivo = useCallback((user: Funcionario) => {
    setUserToToggle(user.id)
    setToggleDialog({
      open: true,
      user,
      newStatus: !user.ativo,
    })
  }, [])

  const confirmToggleAtivo = async () => {
    if (!toggleDialog.user) return

    try {
      await toggleUsuario.mutateAsync({
        ativo: toggleDialog.newStatus,
      })

      const acao = toggleDialog.newStatus ? 'ativado' : 'desativado'
      toast.success(`Usuário ${acao} com sucesso!`)

      setToggleDialog({ open: false, user: null, newStatus: false })
      refetchUsers()
    } catch (error) {
      const acao = toggleDialog.newStatus ? 'ativar' : 'desativar'
      toast.error(`Erro ao ${acao} usuário`)
      console.error(error)
    }
  }

  // Configuração das colunas da tabela
  const columns: Column[] = useMemo(
    () => [
      {
        id: 'nome',
        label: 'Nome',
        render: (value: string) => (
          <Typography fontWeight={500}>{value}</Typography>
        ),
      },
      {
        id: 'email',
        label: 'Email',
        render: (value: string) => <Typography>{value}</Typography>,
      },
      {
        id: 'departamento_id',
        label: 'Departamento',
        render: (value: string | null) =>
          value ? getDepartmentName(value) : '—',
      },
      {
        id: 'cargo_nome',
        label: 'Cargo',
        render: (value: string | null) => (value ? getCargoName(value) : '—'),
      },
      {
        id: 'role',
        label: 'Tipo',
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
        align: 'center' as const,
        render: (value: boolean, row: any) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Switch
              checked={value}
              onChange={e => {
                e.stopPropagation()
                handleToggleAtivo(row)
              }}
              size='small'
              color='primary'
              onClick={e => e.stopPropagation()}
            />
            <Typography variant='caption' color='text.secondary'>
              {value ? 'Ativo' : 'Inativo'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'actions',
        label: '',
        align: 'center' as const,
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
          </Box>
        ),
      },
    ],
    [getDepartmentName, getCargoName, handleEdit, handleToggleAtivo]
  )

  // Filtrar usuários: GERENTE vê apenas do seu departamento, ADMIN vê todos
  const allUsers = useMemo(() => {
    if (!usuarios) return []

    if (isGerente && perfil?.departamento) {
      return usuarios.filter(u => u.departamento_id === perfil.departamento)
    }

    return usuarios
  }, [usuarios, isGerente, perfil?.departamento])

  // Filtrar usuários por departamento e status
  const filtered = useMemo(() => {
    let result = allUsers

    // Filtrar por departamento
    if (selectedDept !== 'all') {
      result = result.filter(user => user.departamento_id === selectedDept)
    }

    // Filtrar por status
    if (tab === 'active') {
      result = result.filter(user => user.ativo === true)
    } else if (tab === 'disabled') {
      result = result.filter(user => user.ativo === false)
    }

    return result
  }, [allUsers, selectedDept, tab])

  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      departamento_id: '',
      cargo_nome: '',
      role: 'FUNCIONARIO',
      ativo: true,
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
        role: form.role || 'FUNCIONARIO',
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

  const handleUpdate = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error('Nome e Email são obrigatórios')
      return
    }

    if (!editingUser) return

    try {
      const input: UpdateFuncionarioInput = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        departamento_id: form.departamento_id || undefined,
        cargo_nome: form.cargo_nome || undefined,
        role: form.role,
        ativo: form.ativo,
      }

      await atualizarUsuario.mutateAsync(input)

      toast.success('Funcionário atualizado com sucesso!')
      setEditingUser(null)
      resetForm()
      refetchUsers()
    } catch (error) {
      toast.error('Erro ao atualizar funcionário')
      console.error(error)
    }
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
            mb: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <FormControl>
            <InputLabel>Departamento</InputLabel>
            <Select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              label='Departamento'
            >
              <MenuItem key='all' value='all'>
                <em>Todos os Departamentos</em>
              </MenuItem>
              {departamentos.map((dept: { codigo: string; nome: string }) => (
                <MenuItem key={dept.codigo} value={dept.codigo}>
                  {dept.codigo} - {dept.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={openAdd}
            startIcon={<AddIcon />}
            variant='contained'
            disabled={criarUsuario.isPending}
          >
            Adicionar Usuário
          </Button>
        </Box>

        <StatusFilterTabs
          value={tab}
          onChange={setTab}
          activeCount={allUsers.filter(u => u.ativo === true).length}
          inactiveCount={allUsers.filter(u => u.ativo === false).length}
          activeLabel='Usuários Ativos'
          inactiveLabel='Usuários Inativos'
        />

        <DataTable columns={columns} data={filtered} getRowId={row => row.id} />

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
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    {departamentos.map(
                      (dept: { codigo: string; nome: string }) => (
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
                    <MenuItem value='FUNCIONARIO'>Funcionário</MenuItem>
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
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
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
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Usuário
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                <TextField label='CPF' value={form.cpf} fullWidth disabled />
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
                    {departamentos.map(
                      (dept: { codigo: string; nome: string }) => (
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
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
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

        {/* Dialog Confirmação Toggle Status */}
        <ConfirmationDialog
          open={toggleDialog.open}
          onClose={() =>
            setToggleDialog({ open: false, user: null, newStatus: false })
          }
          onConfirm={confirmToggleAtivo}
          title={
            toggleDialog.newStatus ? 'Ativar Usuário' : 'Desativar Usuário'
          }
          message={
            toggleDialog.newStatus
              ? `Tem certeza que deseja ativar o usuário "${toggleDialog.user?.nome}"? O usuário poderá fazer login novamente.`
              : `Tem certeza que deseja desativar o usuário "${toggleDialog.user?.nome}"? O usuário será deslogado imediatamente e não poderá mais fazer login.`
          }
          confirmText={toggleDialog.newStatus ? 'Ativar' : 'Desativar'}
          cancelText='Cancelar'
          severity={toggleDialog.newStatus ? 'info' : 'warning'}
          isLoading={toggleUsuario.isPending}
        />
      </Box>
    </DashboardLayout>
  )
}
