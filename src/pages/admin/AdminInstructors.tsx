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
} from '@mui/icons-material'
import { useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigation } from '@/hooks/useNavigation'
import DataTable from '@/components/common/DataTable'
import {
  useInstrutores,
  useToggleInstructorStatus,
  useFuncionarios,
  useCreateInstrutor,
  useUpdateInstrutor,
  useDeleteInstrutor,
  type Instructor,
  type InstructorCreate,
  type InstructorUpdate,
  type Funcionario,
  useListarDepartamentosAdmin,
} from '@/api/users'

interface InstructorForm {
  funcionario_id: string
  biografia: string
  especialidades: string[]
  departamento_id?: string
}

export default function AdminInstructors() {
  const { navigationItems } = useNavigation()

  const { data: instrutoresResponse, isLoading: loadingInstrutores } =
    useInstrutores()
  const { data: funcionariosResponse, isLoading: loadingFuncionarios } =
    useFuncionarios()

  const instrutores = useMemo(
    () => instrutoresResponse || [],
    [instrutoresResponse]
  )
  const funcionarios = useMemo(
    () => funcionariosResponse?.items || [],
    [funcionariosResponse]
  )
  const { data: departamentosResponse } = useListarDepartamentosAdmin()
  const departamentos =
    (departamentosResponse as any)?.items || departamentosResponse || []

  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  )
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<InstructorForm>({
    funcionario_id: '',
    departamento_id: '',
    biografia: '',
    especialidades: [],
  })

  const toggleStatusMutation = useToggleInstructorStatus()
  const createMutation = useCreateInstrutor()
  const updateMutation = useUpdateInstrutor()
  const deleteMutation = useDeleteInstrutor()

  // Filtrar funcionários: excluir ADMIN e os que já são instrutores
  const funcionariosDisponiveis = useMemo(() => {
    const instrutoresIds = new Set(
      instrutores.map((i: Instructor) => i.funcionario_id)
    )
    const disponiveis = funcionarios.filter(
      (f: Funcionario) =>
        f.role !== 'ADMIN' && // Excluir ADMIN
        !instrutoresIds.has(f.id) // Excluir quem já é instrutor
    )

    return disponiveis
  }, [funcionarios, instrutores])

  const resetForm = () => {
    setForm({
      funcionario_id: '',
      biografia: '',
      especialidades: [],
    })
  }

  const openAdd = () => {
    resetForm()
    setEditingInstructor(null)
    setIsAddOpen(true)
  }

  const handleFuncionarioChange = (funcionarioId: string) => {
    const funcionario = funcionarios.find(
      (f: Funcionario) => f.id === funcionarioId
    )
    setForm({
      ...form,
      funcionario_id: funcionarioId,
      departamento_id: funcionario?.departamento_id || '',
    })
  }

  const handleAdd = async () => {
    if (!form.funcionario_id) {
      toast.error('Selecione um funcionário')
      return
    }

    try {
      const input: InstructorCreate = {
        funcionario_id: form.funcionario_id,
        biografia: form.biografia.trim() || undefined,
        especialidades:
          form.especialidades.length > 0 ? form.especialidades : undefined,
      }

      await createMutation.mutateAsync(input)
      toast.success('Instrutor criado com sucesso!')
      setIsAddOpen(false)
      resetForm()
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.mensagem || 'Erro ao criar instrutor'
      toast.error(errorMsg)
      console.error(error)
    }
  }

  const handleEdit = useCallback((instructor: Instructor) => {
    setEditingInstructor(instructor)
    setForm({
      funcionario_id: instructor.funcionario_id,
      departamento_id: instructor.departamento_id || '',
      biografia: instructor.biografia || '',
      especialidades: instructor.especialidades || [],
    })
  }, [])

  const handleUpdate = async () => {
    if (!editingInstructor) return

    try {
      const input: InstructorUpdate = {
        biografia: form.biografia.trim() || undefined,
        especialidades:
          form.especialidades.length > 0 ? form.especialidades : undefined,
      }

      await updateMutation.mutateAsync({
        id: editingInstructor.funcionario_id,
        data: input,
      })

      toast.success('Instrutor atualizado com sucesso!')
      setEditingInstructor(null)
      resetForm()
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.mensagem || 'Erro ao atualizar instrutor'
      toast.error(errorMsg)
      console.error(error)
    }
  }

  const handleDelete = useCallback(
    async (funcionario_id: string, nome: string) => {
      if (
        confirm(
          `Tem certeza que deseja remover "${nome}" como instrutor?\nA role será alterada para FUNCIONARIO.`
        )
      ) {
        try {
          await deleteMutation.mutateAsync(funcionario_id)
          toast.success('Instrutor removido e role alterada para FUNCIONARIO!')
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.mensagem || 'Erro ao remover instrutor'
          toast.error(errorMsg)
          console.error(error)
        }
      }
    },
    [deleteMutation]
  )

  const handleToggleAtivo = useCallback(
    async (funcionario_id: string, nome: string, ativo: boolean) => {
      const acao = ativo ? 'desativar' : 'ativar'
      if (confirm(`Tem certeza que deseja ${acao} o instrutor "${nome}"?`)) {
        try {
          await toggleStatusMutation.mutateAsync(funcionario_id)
          toast.success(
            `Instrutor ${acao === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`
          )
        } catch (error) {
          toast.error(`Erro ao ${acao} instrutor`)
          console.error(error)
        }
      }
    },
    [toggleStatusMutation]
  )

  const getRowId = useCallback((row: Instructor) => row.funcionario_id, [])

  const filtered = useMemo(() => {
    if (selectedDept === 'all') return instrutores

    return instrutores.filter((i: Instructor) => {
      return i.departamento_id === selectedDept
    })
  }, [instrutores, selectedDept])

  // Definir colunas da tabela
  const instructorColumns = useMemo(
    () => [
      {
        id: 'nome',
        label: 'Nome',
        render: (_value: any, row: Instructor) => (
          <Box>
            <Typography variant='body2' fontWeight={500}>
              {row?.nome}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'departamento',
        label: 'Departamento',
        render: (_value: any, row: Instructor) => (
          <Typography variant='body2'>
            {row?.departamento_nome || '-'}
          </Typography>
        ),
      },
      {
        id: 'especialidades',
        label: 'Especialidades',
        render: (_value: any, row: Instructor) => (
          <Typography variant='body2'>{row?.especialidades || '-'}</Typography>
        ),
      },
      {
        id: 'biografia',
        label: 'Biografia',
        render: (_value: any, row: Instructor) => (
          <Typography
            variant='body2'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {row?.biografia || '-'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center' as const,
        render: (_value: any, row: Instructor) => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Switch
              checked={row?.ativo}
              onChange={e => {
                e.stopPropagation()
                handleToggleAtivo(row?.funcionario_id, row?.nome, row?.ativo)
              }}
              size='small'
              color='primary'
              onClick={e => e.stopPropagation()}
            />
            <Typography variant='caption' color='text.secondary'>
              {row?.ativo ? 'Ativo' : 'Inativo'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'actions',
        label: '',
        align: 'right' as const,
        render: (_value: any, row: Instructor) => (
          <Box display='flex' gap={1} justifyContent='flex-end'>
            <IconButton
              size='small'
              onClick={() => handleEdit(row)}
              aria-label='editar'
              disabled={!row}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => handleDelete(row.funcionario_id, row.nome)}
              aria-label='remover'
              color='error'
              disabled={!row}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    [handleToggleAtivo, handleEdit, handleDelete]
  )

  if (loadingInstrutores || loadingFuncionarios) {
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
          <Button onClick={openAdd} startIcon={<AddIcon />} variant='contained'>
            Adicionar Instrutor
          </Button>
        </Box>

        <DataTable
          data={filtered}
          columns={instructorColumns}
          loading={loadingInstrutores}
          getRowId={getRowId}
        />

        {/* Dialog Adicionar Instrutor */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />
              Novo Instrutor
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Funcionário</InputLabel>
                  <Select
                    value={form.funcionario_id}
                    onChange={e => handleFuncionarioChange(e.target.value)}
                    label='Funcionário'
                  >
                    <MenuItem value=''>
                      <em>— Selecione um funcionário —</em>
                    </MenuItem>
                    {funcionariosDisponiveis.length === 0 && (
                      <MenuItem value='' disabled>
                        <em>Nenhum funcionário disponível</em>
                      </MenuItem>
                    )}
                    {funcionariosDisponiveis.map((func: Funcionario) => (
                      <MenuItem key={func.id} value={func.id}>
                        {func.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia'
                  value={form.biografia}
                  onChange={e =>
                    setForm({ ...form, biografia: e.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e certificações...'
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Especialidades (separadas por vírgula)'
                  value={form.especialidades.join(', ')}
                  onChange={e =>
                    setForm({
                      ...form,
                      especialidades: e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s),
                    })
                  }
                  fullWidth
                  placeholder='Ex: JavaScript, React, Node.js'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant='outlined'
              onClick={() => setIsAddOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleAdd}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Instrutor */}
        <Dialog
          open={!!editingInstructor}
          onClose={() => setEditingInstructor(null)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Instrutor
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Funcionário'
                  value={editingInstructor?.nome || ''}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia'
                  value={form.biografia}
                  onChange={e =>
                    setForm({ ...form, biografia: e.target.value })
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e certificações ...'
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Especialidades (separadas por vírgula)'
                  value={form.especialidades.join(', ')}
                  onChange={e =>
                    setForm({
                      ...form,
                      especialidades: e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s),
                    })
                  }
                  fullWidth
                  placeholder='Ex: JavaScript, React, Node.js'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant='outlined'
              onClick={() => setEditingInstructor(null)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
