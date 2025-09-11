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
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentos,
  useCriarDepartamento,
  useAtualizarDepartamento,
  type Departamento,
} from '@/hooks/users'

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
  } = useListarDepartamentos()
  const criarDepartamento = useCriarDepartamento()
  const [editingDept, setEditingDept] = useState<Departamento | null>(null)
  const atualizarDepartamento = useAtualizarDepartamento(
    editingDept?.codigo || ''
  )

  const [isAddOpen, setIsAddOpen] = useState(false)
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
        gestor_id: form.gestor_id.trim() || undefined,
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
      gestor_id: dept.gestor_id || '',
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
        gestor_id: form.gestor_id.trim() || undefined,
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
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Button
            href='/dashboard/admin'
            startIcon={<ArrowBackIcon />}
            variant='text'
          >
            Voltar ao Dashboard
          </Button>
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
            {departamentos.length === 0 ? (
              <Alert severity='info' sx={{ mt: 2 }}>
                Nenhum departamento cadastrado. Clique em "Adicionar
                Departamento" para começar.
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Gestor ID</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departamentos.map(dept => (
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
                          {dept.gestor_id || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(dept)}
                          aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => {
                            if (
                              confirm(
                                `Tem certeza que deseja excluir o departamento "${dept.nome}"?`
                              )
                            ) {
                              // TODO: Implementar exclusão quando endpoint estiver disponível
                              toast.info(
                                'Funcionalidade de exclusão será implementada em breve'
                              )
                            }
                          }}
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
                <TextField
                  label='ID do Gestor'
                  value={form.gestor_id}
                  onChange={e =>
                    setForm({ ...form, gestor_id: e.target.value })
                  }
                  placeholder='ID do usuário gestor (opcional)'
                  fullWidth
                />
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
                <TextField
                  label='ID do Gestor'
                  value={form.gestor_id}
                  onChange={e =>
                    setForm({ ...form, gestor_id: e.target.value })
                  }
                  placeholder='ID do usuário gestor (opcional)'
                  fullWidth
                />
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
      </Box>
    </DashboardLayout>
  )
}
