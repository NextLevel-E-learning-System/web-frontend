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
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  Skeleton,
  Grid,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarCategorias,
  useListarDepartamentos,
  useCriarCategoria,
  useAtualizarCategoria,
  type Categoria,
  type Departamento,
} from '@/hooks/users'

interface CategoryForm {
  nome: string
  departamento_codigo: string
  descricao: string
}

export default function AdminCategories() {
  const { navigationItems } = useNavigation()
  const {
    data: categorias = [],
    isLoading: loadingCategorias,
    refetch: refetchCategorias,
  } = useListarCategorias()
  const { data: departamentos = [], isLoading: loadingDepartamentos } =
    useListarDepartamentos()
  const criarCategoria = useCriarCategoria()
  const [editingCat, setEditingCat] = useState<Categoria | null>(null)
  const atualizarCategoria = useAtualizarCategoria(editingCat?.id || '')

  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<CategoryForm>({
    nome: '',
    departamento_codigo: '',
    descricao: '',
  })

  const title = useMemo(
    () => (editingCat ? 'Editar Categoria' : 'Gerenciar Categorias'),
    [editingCat]
  )

  // Filtrar categorias por departamento
  const filteredCategories =
    selectedDept === 'all'
      ? categorias
      : categorias.filter(c => c.departamento_codigo === selectedDept)

  const resetForm = () => {
    setForm({
      nome: '',
      departamento_codigo: '',
      descricao: '',
    })
  }

  const openAdd = () => {
    resetForm()
    setEditingCat(null)
    setIsAddOpen(true)
  }

  const handleAdd = async () => {
    if (!form.nome.trim() || !form.departamento_codigo.trim()) {
      toast.error('Nome e Departamento são obrigatórios')
      return
    }

    try {
      await criarCategoria.mutateAsync({
        nome: form.nome.trim(),
        departamento_codigo: form.departamento_codigo.trim(),
        descricao: form.descricao.trim() || undefined,
      })

      toast.success('Categoria criada com sucesso!')
      setIsAddOpen(false)
      resetForm()
      refetchCategorias()
    } catch (error) {
      toast.error('Erro ao criar categoria')
      console.error(error)
    }
  }

  const handleEdit = (cat: Categoria) => {
    setEditingCat(cat)
    setForm({
      nome: cat.nome,
      departamento_codigo: cat.departamento_codigo,
      descricao: cat.descricao || '',
    })
  }

  const handleUpdate = async () => {
    if (!form.nome.trim() || !form.departamento_codigo.trim()) {
      toast.error('Nome e Departamento são obrigatórios')
      return
    }

    if (!editingCat) return

    try {
      await atualizarCategoria.mutateAsync({
        nome: form.nome.trim(),
        departamento_codigo: form.departamento_codigo.trim(),
        descricao: form.descricao.trim() || undefined,
      })

      toast.success('Categoria atualizada com sucesso!')
      setEditingCat(null)
      resetForm()
      refetchCategorias()
    } catch (error) {
      toast.error('Erro ao atualizar categoria')
      console.error(error)
    }
  }

  const getDepartmentName = (codigo: string) => {
    return departamentos.find(d => d.codigo === codigo)?.nome || codigo
  }

  if (loadingCategorias || loadingDepartamentos) {
    return (
      <DashboardLayout title='Gerenciar Categorias' items={navigationItems}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={title} items={navigationItems}>
      <Box sx={{ p: 3 }}>
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
            disabled={criarCategoria.isPending}
          >
            Adicionar Categoria
          </Button>
        </Box>

        {/* Filtro por Departamento */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                Filtrar por Departamento
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ width: 320 }}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  label='Departamento'
                >
                  <MenuItem value='all'>
                    <em>Todos os Departamentos</em>
                  </MenuItem>
                  {departamentos.map(dept => (
                    <MenuItem key={dept.codigo} value={dept.codigo}>
                      {dept.nome} ({dept.codigo})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Lista de Categorias */}
        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                Lista de Categorias
              </Typography>
            }
            subheader={`${filteredCategories.length} categorias encontradas`}
          />
          <CardContent>
            {filteredCategories.length === 0 ? (
              <Alert severity='info' sx={{ mt: 2 }}>
                {selectedDept === 'all'
                  ? 'Nenhuma categoria cadastrada. Clique em "Adicionar Categoria" para começar.'
                  : 'Nenhuma categoria encontrada para este departamento.'}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map(cat => (
                    <TableRow key={cat.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Chip
                            label={cat.id}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                          <Typography fontWeight={500}>{cat.nome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {getDepartmentName(cat.departamento_codigo)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {cat.departamento_codigo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cat.descricao || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          onClick={() => handleEdit(cat)}
                          aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => {
                            if (
                              confirm(
                                `Tem certeza que deseja excluir a categoria "${cat.nome}"?`
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

        {/* Dialog Adicionar Categoria */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon />
              Nova Categoria
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={form.departamento_codigo}
                    onChange={e =>
                      setForm({ ...form, departamento_codigo: e.target.value })
                    }
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map(dept => (
                      <MenuItem key={dept.codigo} value={dept.codigo}>
                        {dept.nome} ({dept.codigo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome da Categoria'
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder='ex.: Desenvolvimento Web, Análise de Dados'
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
                  placeholder='Descrição da categoria (opcional)'
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setIsAddOpen(false)}
              disabled={criarCategoria.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleAdd}
              disabled={criarCategoria.isPending}
            >
              {criarCategoria.isPending ? 'Criando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Categoria */}
        <Dialog
          open={!!editingCat}
          onClose={() => setEditingCat(null)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Categoria
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={form.departamento_codigo}
                    onChange={e =>
                      setForm({ ...form, departamento_codigo: e.target.value })
                    }
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map(dept => (
                      <MenuItem key={dept.codigo} value={dept.codigo}>
                        {dept.nome} ({dept.codigo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Nome da Categoria'
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
                  placeholder='Descrição da categoria (opcional)'
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setEditingCat(null)}
              disabled={atualizarCategoria.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={atualizarCategoria.isPending}
            >
              {atualizarCategoria.isPending ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
