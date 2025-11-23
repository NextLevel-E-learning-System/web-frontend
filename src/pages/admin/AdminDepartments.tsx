import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Skeleton,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import { useState } from 'react'
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
  type Departamento
} from '@/api/users'
import DataTable, { type Column } from '@/components/common/DataTable'

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
    data: departamentosResponse,
    isLoading,
    refetch
  } = useListarDepartamentosAdmin()
  // A resposta da API vem como { items: [...] }
  const departamentos =
    (departamentosResponse as any)?.items || departamentosResponse || []
  const { data: funcionariosResponse } = useFuncionarios()
  const funcionarios = funcionariosResponse?.items || []
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
    onConfirm: () => {}
  })
  const [form, setForm] = useState<DepartmentForm>({
    codigo: '',
    nome: '',
    descricao: '',
    gestor_id: ''
  })

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
      gestor_id: ''
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
        gestor_funcionario_id: form.gestor_id.trim() || undefined
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
      gestor_id: dept.gestor_funcionario_id || ''
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
        gestor_funcionario_id: form.gestor_id.trim() || undefined
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
            severity: 'warning'
          })
          refetch()
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message || 'Erro ao excluir departamento'
          toast.error(errorMessage)
          console.error(error)
          setConfirmDialog(prev => ({ ...prev, isLoading: false }))
        }
      }
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={200} />
        </Box>
      </DashboardLayout>
    )
  }

  // Definição das colunas para o DataTable
  const departmentColumns: Column[] = [
    {
      id: 'codigo',
      label: 'Código',
      align: 'left',
      minWidth: 80,
      render: (_, dept) => (
        <Typography fontWeight={500}>{dept.codigo}</Typography>
      )
    },
    {
      id: 'nome',
      label: 'Departamento',
      align: 'left',
      minWidth: 150,
      render: (_, dept) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          <Typography fontWeight={500}>{dept.nome}</Typography>
          {isMobile && dept.descricao && (
            <Typography variant='caption' color='text.secondary'>
              {dept.descricao}
            </Typography>
          )}
          {isMobile && getGestorNome(dept.gestor_funcionario_id) && (
            <Typography variant='caption' color='text.secondary'>
              Gestor: {getGestorNome(dept.gestor_funcionario_id)}
            </Typography>
          )}
        </Box>
      )
    },
    ...(isMobile
      ? []
      : ([
        {
          id: 'descricao',
          label: 'Descrição',
          align: 'left',
          minWidth: 200,
          render: (_, dept) => (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {dept.descricao || '—'}
            </Typography>
          )
        },
        {
          id: 'gestor',
          label: 'Gestor',
          align: 'left',
          minWidth: 150,
          render: (_, dept) => (
            <Typography variant='body2' color='text.secondary'>
              {getGestorNome(dept.gestor_funcionario_id) || '—'}
            </Typography>
          )
        }
      ] as Column[])),
    {
      id: 'acoes',
      label: 'Ações',
      align: 'right',
      minWidth: 120,
      render: (_, dept) => (
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
      )
    }
  ]

  return (
    <DashboardLayout items={navigationItems}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            mb: 3
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

        <DataTable
          data={departamentosFiltrados}
          columns={departmentColumns}
          getRowId={dept => dept.codigo}
        />

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
