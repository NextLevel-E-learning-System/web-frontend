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
  Category as CategoryIcon,
  Circle as CircleIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigation } from '@/hooks/useNavigation'
import { useListarDepartamentosAdmin } from '@/api/users'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CreateCategoryInput,
} from '@/api/courses'
import { authPut } from '@/api/http'
import { API_ENDPOINTS } from '@/api/config'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'

interface CategoryForm {
  codigo: string
  nome: string
  departamento_codigo: string
  descricao: string
  cor_hex: string
}

export default function AdminCategories() {
  const { navigationItems } = useNavigation()

  const { data: departamentos = [], isLoading: loadingDepartamentos } =
    useListarDepartamentosAdmin()
  const { data: categorias = [], isLoading: loadingCategorias } =
    useCategories()

  const createCategoryMutation = useCreateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const [form, setForm] = useState<CategoryForm>({
    codigo: '',
    nome: '',
    departamento_codigo: '',
    descricao: '',
    cor_hex: '#3B82F6',
  })

  const categoriasFiltradas = useMemo(() => {
    if (selectedDept === 'all') return categorias
    return categorias.filter(cat => cat.departamento_codigo === selectedDept)
  }, [categorias, selectedDept])

  const getDepartmentName = (codigo: string) => {
    return departamentos.find(d => d.codigo === codigo)?.nome || codigo
  }

  const resetForm = () => {
    setForm({
      codigo: '',
      nome: '',
      departamento_codigo: '',
      descricao: '',
      cor_hex: '#3B82F6',
    })
  }

  const handleCreate = async () => {
    if (!form.codigo || !form.nome || !form.departamento_codigo) {
      toast.error('Código, nome e departamento são obrigatórios')
      return
    }

    try {
      await createCategoryMutation.mutateAsync({
        codigo: form.codigo,
        nome: form.nome,
        departamento_codigo: form.departamento_codigo,
        descricao: form.descricao || undefined,
        cor_hex: form.cor_hex || undefined,
      })

      toast.success('Categoria criada com sucesso!')
      setIsAddOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao criar categoria')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setForm({
      codigo: category.codigo,
      nome: category.nome,
      departamento_codigo: category.departamento_codigo || '',
      descricao: category.descricao || '',
      cor_hex: category.cor_hex || '#3B82F6',
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingCategory || !form.nome || !form.departamento_codigo) {
      toast.error('Nome e departamento são obrigatórios')
      return
    }

    setIsUpdating(true)
    try {
      await authPut(
        `${API_ENDPOINTS.COURSES}/categorias/${editingCategory.codigo}`,
        {
          nome: form.nome,
          departamento_codigo: form.departamento_codigo,
          descricao: form.descricao || undefined,
          cor_hex: form.cor_hex || undefined,
        }
      )

      toast.success('Categoria atualizada com sucesso!')
      setIsEditOpen(false)
      setEditingCategory(null)
      resetForm()

      // Refetch categorias
      window.location.reload() // Temporário até implementarmos invalidação manual
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar categoria'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.codigo)
      toast.success('Categoria excluída com sucesso!')
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao excluir categoria')
    }
  }

  if (loadingDepartamentos || loadingCategorias) {
    return (
      <DashboardLayout title='Gerenciar Categorias' items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={'Gerenciar Categorias'} items={navigationItems}>
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
              <MenuItem value='all'>
                <em>Todos os Departamentos</em>
              </MenuItem>
              {departamentos.map(dept => (
                <MenuItem key={dept.codigo} value={dept.codigo}>
                  {dept.codigo} - {dept.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            startIcon={<AddIcon />}
            variant='contained'
            onClick={() => setIsAddOpen(true)}
          >
            Adicionar Categoria
          </Button>
        </Box>

        {/* Lista de Categorias */}
        <Card>
          <CardContent>
            {categoriasFiltradas.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CategoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant='h6' color='textSecondary'>
                  Nenhuma categoria encontrada
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  {selectedDept === 'all'
                    ? 'Não há categorias cadastradas'
                    : 'Não há categorias para este departamento'}
                </Typography>
              </Box>
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
                  {categoriasFiltradas.map(categoria => (
                    <TableRow key={categoria.codigo} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <CircleIcon
                            sx={{
                              color: categoria.cor_hex || '#3B82F6',
                              fontSize: 24,
                            }}
                          />
                          <Typography fontWeight={500}>
                            {categoria.nome}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {getDepartmentName(
                              categoria.departamento_codigo || ''
                            )}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {categoria.departamento_codigo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {categoria.descricao || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          aria-label='editar'
                          onClick={() => handleEdit(categoria)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(categoria)}
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
          maxWidth='sm'
          fullWidth
          open={isAddOpen}
          onClose={() => {
            setIsAddOpen(false)
            resetForm()
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon />
              Nova Categoria
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código da Categoria'
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                  placeholder='ex.: DEV-001'
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <TextField
                    label='Cor (Hexadecimal)'
                    value={form.cor_hex}
                    onChange={e => {
                      let value = e.target.value
                      if (value && !value.startsWith('#')) {
                        value = '#' + value
                      }
                      value = value.replace(/[^#0-9A-Fa-f]/g, '')
                      if (value.length > 7) {
                        value = value.substring(0, 7)
                      }
                      setForm({ ...form, cor_hex: value })
                    }}
                    placeholder='#3B82F6'
                    fullWidth
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      alignItems:'center',
                      backgroundColor: form.cor_hex || '#3B82F6',
                      border: '1px solid #000',
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </Grid>
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
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant='outlined'
              onClick={() => {
                setIsAddOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleCreate}
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending
                ? 'Criando...'
                : 'Criar Categoria'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Categoria */}
        <Dialog
          maxWidth='sm'
          fullWidth
          open={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setEditingCategory(null)
            resetForm()
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Categoria
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 0 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código da Categoria'
                  value={form.codigo}
                  fullWidth
                  disabled
                  helperText='O código não pode ser alterado'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    label='Cor (Hexadecimal)'
                    value={form.cor_hex}
                    onChange={e => {
                      let value = e.target.value
                      // Adiciona # se não tiver
                      if (value && !value.startsWith('#')) {
                        value = '#' + value
                      }
                      // Remove caracteres inválidos (manter apenas 0-9, A-F, a-f)
                      value = value.replace(/[^#0-9A-Fa-f]/g, '')
                      // Limita a 7 caracteres (#RRGGBB)
                      if (value.length > 7) {
                        value = value.substring(0, 7)
                      }
                      setForm({ ...form, cor_hex: value })
                    }}
                    placeholder='#3B82F6'
                    fullWidth
                    inputProps={{ 
                      maxLength: 7,
                      style: { fontFamily: 'monospace' }
                    }}
                    helperText='Digite ou cole uma cor em formato hexadecimal'
                  />
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: form.cor_hex || '#3B82F6',
                      border: '1px solid #ddd',
                      flexShrink: 0,
                    }}
                  />
                </Box>
              </Grid>
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
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant='outlined'
              onClick={() => {
                setIsEditOpen(false)
                setEditingCategory(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Confirmação de Exclusão */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setCategoryToDelete(null)
          }}
          onConfirm={confirmDelete}
          title='Excluir Categoria'
          message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.nome}"?`}
          severity='error'
          confirmText='Excluir'
          cancelText='Cancelar'
          isLoading={deleteCategoryMutation.isPending}
        />
      </Box>
    </DashboardLayout>
  )
}
