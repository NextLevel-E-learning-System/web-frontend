import {
  Avatar,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Skeleton,
  Grid,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentosAdmin,
  useFuncionarios,
  useCriarDepartamento,
  useAtualizarDepartamento,
  useInativarDepartamento,
  type Departamento,
  type Funcionario,
} from '@/api/users'

interface DepartmentForm {
  codigo: string
  nome: string
  descricao: string
  gestor_id: string
}

export default function AdminDepartments() {
  const { navigationItems } = useNavigation()
  const {
    data: departamentos = [],
    isLoading,
    refetch,
  } = useListarDepartamentosAdmin()
  const { data: funcionarios = [] } = useFuncionarios()
  const criarDepartamento = useCriarDepartamento()
  const inativarDepartamento = useInativarDepartamento()
  const [editingDept, setEditingDept] = useState<Departamento | null>(null)
  const atualizarDepartamento = useAtualizarDepartamento(
    editingDept?.codigo || ''
  )

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'disabled' | 'all'
  >('active')
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    titulo: '',
    mensagem: '',
    onConfirm: () => {},
  })
  const [form, setForm] = useState<DepartmentForm>({
    codigo: '',
    nome: '',
    descricao: '',
    gestor_id: '',
  })

  const title = useMemo(
    () => (editingDept ? 'Editar Departamento' : 'Gerenciar Departamentos'),
    [editingDept]
  )

  // Função para buscar o nome do gestor
  const getGestorNome = (gestorId: string | null) => {
    if (!gestorId) return null
    const gestor = funcionarios.find(f => f.id === gestorId)
    return gestor ? gestor.nome : `ID: ${gestorId}`
  }

  // Filtrar apenas funcionários que podem ser gestores (GERENTE, ADMIN)
  const funcionariosGestores = funcionarios.filter(
    f => f.role === 'GERENTE' || f.role === 'ADMIN'
  )

  // Filtrar departamentos por status
  const departamentosFiltrados = useMemo(() => {
    switch (statusFilter) {
      case 'active':
        return departamentos.filter(dept => dept.ativo)
      case 'disabled':
        return departamentos.filter(dept => !dept.ativo)
      case 'all':
      default:
        return departamentos
    }
  }, [departamentos, statusFilter])

  // Contadores para as abas
  const departamentosAtivos = departamentos.filter(dept => dept.ativo).length
  const departamentosInativos = departamentos.filter(dept => !dept.ativo).length

  const resetForm = () => {
    setForm({
      codigo: '',
      nome: '',
      descricao: '',
      gestor_id: '',
    })
  }

  const openAdd = () => {
    resetForm()
    setEditingDept(null)
    setIsAddOpen(true)
  }

  const handleAdd = async () => {
    if (!form.codigo.trim() || !form.nome.trim()) {
      toast.error('Código e Nome são obrigatórios')
      return
    }

    try {
      await criarDepartamento.mutateAsync({
        codigo: form.codigo.trim().toUpperCase(),
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        gestor_funcionario_id: form.gestor_id.trim() || undefined,
      })

      toast.success('Departamento criado com sucesso!')
      setIsAddOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      toast.error('Erro ao criar departamento')
      console.error(error)
    }
  }

  const handleEdit = (dept: Departamento) => {
    setEditingDept(dept)
    setForm({
      codigo: dept.codigo,
      nome: dept.nome,
      descricao: dept.descricao || '',
      gestor_id: dept.gestor_funcionario_id || '',
    })
  }

  const handleUpdate = async () => {
    if (!form.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!editingDept) return

    try {
      await atualizarDepartamento.mutateAsync({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        gestor_funcionario_id: form.gestor_id.trim() || undefined,
      })

      toast.success('Departamento atualizado com sucesso!')
      setEditingDept(null)
      resetForm()
      refetch()
    } catch (error) {
      toast.error('Erro ao atualizar departamento')
      console.error(error)
    }
  }

  const handleInativar = (codigo: string, nome: string) => {
    setConfirmDialog({
      open: true,
      titulo: 'Inativar Departamento',
      mensagem: `Tem certeza que deseja inativar o departamento "${nome}"? Esta ação pode ser revertida posteriormente.`,
      onConfirm: async () => {
        try {
          await inativarDepartamento.mutateAsync(codigo)
          toast.success('Departamento inativado com sucesso!')
          setConfirmDialog({ ...confirmDialog, open: false })
          refetch()
        } catch (error) {
          toast.error('Erro ao inativar departamento')
          console.error(error)
        }
      },
    })
  }

  const DepartmentAvatar = ({
    codigo,
    nome,
  }: {
    codigo: string
    nome: string
  }) => (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'primary.main',
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      {codigo.slice(0, 2).toUpperCase()}
    </Avatar>
  )

  if (isLoading) {
    return (
      <DashboardLayout title='Gerenciar Departamentos' items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={200} />
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
            justifyContent: 'end',
            mb: 3,
          }}
        >
          <Button
            onClick={openAdd}
            startIcon={<AddIcon />}
            variant='contained'
            disabled={criarDepartamento.isPending}
          >
            Adicionar Departamento
          </Button>
        </Box>

        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                Todos os Departamentos
              </Typography>
            }
          />
          <CardContent>
            <StatusFilterTabs
              value={statusFilter}
              onChange={setStatusFilter}
              activeCount={departamentosAtivos}
              inactiveCount={departamentosInativos}
              activeLabel='Ativos'
              inactiveLabel='Inativos'
            />

            {departamentosFiltrados.length === 0 ? (
              <Alert severity='info' sx={{ mt: 2 }}>
                {statusFilter === 'active' &&
                  'Nenhum departamento ativo encontrado.'}
                {statusFilter === 'disabled' &&
                  'Nenhum departamento inativo encontrado.'}
                {statusFilter === 'all' &&
                  'Nenhum departamento cadastrado. Clique em "Adicionar Departamento" para começar.'}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Gestor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departamentosFiltrados.map(dept => (
                    <TableRow key={dept.codigo} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{dept.codigo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <DepartmentAvatar
                            codigo={dept.codigo}
                            nome={dept.nome}
                          />
                          <Typography fontWeight={500}>{dept.nome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            maxWidth: 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dept.descricao || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {getGestorNome(dept.gestor_funcionario_id) || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dept.ativo ? 'Ativo' : 'Inativo'}
                          color={dept.ativo ? 'success' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(dept)}
                          aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        {dept.ativo && (
                          <IconButton
                            size='small'
                            onClick={() =>
                              handleInativar(dept.codigo, dept.nome)
                            }
                            aria-label='inativar'
                            color='error'
                            disabled={inativarDepartamento.isPending}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Adicionar Departamento */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon />
              Novo Departamento
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código do Departamento'
                  value={form.codigo}
                  onChange={e =>
                    setForm({ ...form, codigo: e.target.value.toUpperCase() })
                  }
                  placeholder='ex.: TI, RH, MKT'
                  fullWidth
                  required
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Gestor do Departamento</InputLabel>
                  <Select
                    value={form.gestor_id}
                    onChange={e =>
                      setForm({ ...form, gestor_id: e.target.value })
                    }
                    label='Gestor do Departamento'
                  >
                    <MenuItem value=''>
                      <em>Nenhum gestor</em>
                    </MenuItem>
                    {funcionariosGestores.map(funcionario => (
                      <MenuItem key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} ({funcionario.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome do Departamento'
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder='ex.: Tecnologia da Informação'
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Descrição'
                  value={form.descricao}
                  onChange={e =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  placeholder='Descreva as responsabilidades e objetivos do departamento'
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setIsAddOpen(false)}
              disabled={criarDepartamento.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleAdd}
              disabled={criarDepartamento.isPending}
            >
              {criarDepartamento.isPending ? 'Criando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Departamento */}
        <Dialog
          open={!!editingDept}
          onClose={() => setEditingDept(null)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Departamento
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código do Departamento'
                  value={form.codigo}
                  disabled
                  fullWidth
                  helperText='O código não pode ser alterado'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Gestor do Departamento</InputLabel>
                  <Select
                    value={form.gestor_id}
                    onChange={e =>
                      setForm({ ...form, gestor_id: e.target.value })
                    }
                    label='Gestor do Departamento'
                  >
                    <MenuItem value=''>
                      <em>Nenhum gestor</em>
                    </MenuItem>
                    {funcionariosGestores.map(funcionario => (
                      <MenuItem key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} ({funcionario.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome do Departamento'
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Descrição'
                  value={form.descricao}
                  onChange={e =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  placeholder='Descreva as responsabilidades e objetivos do departamento'
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setEditingDept(null)}
              disabled={atualizarDepartamento.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={atualizarDepartamento.isPending}
            >
              {atualizarDepartamento.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Confirmação de Inativação */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.titulo}
          message={confirmDialog.mensagem}
          confirmText='Inativar'
          cancelText='Cancelar'
          isLoading={inativarDepartamento.isPending}
          severity='warning'
        />
      </Box>
    </DashboardLayout>
  )
}
