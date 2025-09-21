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
import { useListarDepartamentos } from '@/api/users'

interface CategoryForm {
  nome: string
  departamento_codigo: string
  descricao: string
}

export default function AdminCategories() {
  const { navigationItems } = useNavigation()

  const { data: departamentos = [], isLoading: loadingDepartamentos } =
    useListarDepartamentos()

  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<CategoryForm>({
    nome: '',
    departamento_codigo: '',
    descricao: '',
  })

  const getDepartmentName = (codigo: string) => {
    return departamentos.find(d => d.codigo === codigo)?.nome || codigo
  }

  if (loadingDepartamentos) {
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
                  {dept.nome} ({dept.codigo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button startIcon={<AddIcon />} variant='contained'>
            Adicionar Categoria
          </Button>
        </Box>

        {/* Lista de Categorias */}
        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                Lista de Categorias
              </Typography>
            }
          />
          <CardContent>
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
                <TableRow hover>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Chip size='small' color='primary' variant='outlined' />
                      <Typography fontWeight={500}></Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant='body2' fontWeight={500}></Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      ></Typography>
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
                    ></Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton size='small' aria-label='editar'>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={() => {
                        if (confirm()) {
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
              </TableBody>
            </Table>
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
            <Button variant='outlined' onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button variant='contained'></Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Categoria */}
        <Dialog maxWidth='sm' fullWidth open={false}>
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
            <Button variant='outlined'>Cancelar</Button>
            <Button variant='contained'></Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
