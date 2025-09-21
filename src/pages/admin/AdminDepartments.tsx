import {
  Box,
  Button,
  Card,
  CardContent,
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableContainer,
  Paper,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentosAdmin,
  useFuncionarios,
  useCriarDepartamento,
  useAtualizarDepartamento,
  useDeleteDepartamento,
  type Departamento,
} from '@/api/users'

interface DepartmentForm {
  codigo: string
  nome: string
  descricao: string
  gestor_id: string
}

export default function AdminDepartments() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { navigationItems } = useNavigation()
  const {
    data: departamentos = [],
    isLoading,
    refetch,
  } = useListarDepartamentosAdmin()
  const { data: funcionarios = [] } = useFuncionarios()
  const criarDepartamento = useCriarDepartamento()
  const deleteDepartamento = useDeleteDepartamento()
  const [editingDept, setEditingDept] = useState<Departamento | null>(null)
  const atualizarDepartamento = useAtualizarDepartamento(
    editingDept?.codigo || ''
  )

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    titulo: '',
    mensagem: '',
    confirmText: 'Confirmar',
    isLoading: false,
    severity: 'warning' as 'error' | 'warning' | 'info',
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
  // Usar todos os departamentos diretamente (sem filtro de status)
  const departamentosFiltrados = departamentos

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

  const handleDelete = (codigo: string, nome: string) => {
    setConfirmDialog({
      open: true,
      titulo: 'Excluir Departamento',
      mensagem: `Tem certeza que deseja excluir permanentemente o departamento "${nome}"? Esta ação não pode ser revertida e só é possível se não houver categorias ou funcionários associados.`,
      confirmText: 'Excluir',
      isLoading: false,
      severity: 'error',
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, isLoading: true }))
          await deleteDepartamento.mutateAsync(codigo)
          toast.success('Departamento excluído com sucesso!')
          setConfirmDialog({
            ...confirmDialog,
            open: false,
            isLoading: false,
            severity: 'warning',
          })
          refetch()
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao excluir departamento'
          toast.error(errorMessage)
          console.error(error)
          setConfirmDialog(prev => ({ ...prev, isLoading: false }))
        }
      },
    })
  }

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
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            Lista de Departamentos ({departamentosFiltrados.length})
          </Typography>
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
          <CardContent>
            {departamentosFiltrados.length === 0 ? (
              <Alert severity='info'>
                Nenhum departamento cadastrado. Clique em "Adicionar Departamento" para começar.
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ maxHeight: 600, overflow: 'auto' }}
              >
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 80 }}>Código</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>Departamento</TableCell>
                      {!isMobile && (
                        <TableCell sx={{ minWidth: 200 }}>Descrição</TableCell>
                      )}
                      {!isMobile && (
                        <TableCell sx={{ minWidth: 150 }}>Gestor</TableCell>
                      )}
                      <TableCell align='right' sx={{ minWidth: 120 }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departamentosFiltrados.map(dept => (
                      <TableRow key={dept.codigo} hover>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {dept.codigo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                            }}
                          >
                            <Typography fontWeight={500}>
                              {dept.nome}
                            </Typography>
                            {isMobile && dept.descricao && (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {dept.descricao}
                              </Typography>
                            )}
                            {isMobile &&
                              getGestorNome(dept.gestor_funcionario_id) && (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  Gestor:{' '}
                                  {getGestorNome(dept.gestor_funcionario_id)}
                                </Typography>
                              )}
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {dept.descricao || '—'}
                            </Typography>
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>
                              {getGestorNome(dept.gestor_funcionario_id) || '—'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align='right'>
                          <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            <IconButton
                              size='small'
                              onClick={() => handleEdit(dept)}
                              aria-label='editar'
                              color='primary'
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size='small'
                              onClick={() => handleDelete(dept.codigo, dept.nome)}
                              aria-label='excluir'
                              color='error'
                              disabled={deleteDepartamento.isPending || confirmDialog.isLoading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.titulo}
          message={confirmDialog.mensagem}
          confirmText={confirmDialog.confirmText}
          cancelText='Cancelar'
          isLoading={confirmDialog.isLoading}
          severity={confirmDialog.severity}
        />
      </Box>
    </DashboardLayout>
  )
}
