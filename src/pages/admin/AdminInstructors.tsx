import Grid from '@mui/material/Grid'
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Alert,
  Skeleton,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useListarDepartamentos,
  useListarCargos,
  useFuncionarios,
  UsuarioResumo,

} from '@/hooks/users'


export default function AdminInstructors() {
  const { navigationItems } = useNavigation()

  const { data: funcionarios = [], isLoading: loadingFuncionarios } = useFuncionarios()
  const { data: departamentos = [], isLoading: loadingDepartments } =
    useListarDepartamentos()
  const { data: cargos = [], isLoading: loadingCargos } = useListarCargos()
  const [editingInstructor, setEditingInstructor] =
    useState<UsuarioResumo | null>(null)

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('active')
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Filtrar apenas instrutores e aplicar filtro de status
  const instrutores = funcionarios.filter(f => (f as any).tipo_usuario === 'INSTRUTOR')
  const filtered = instrutores.filter(i => {
    if (tab === 'all') return true
    if (tab === 'active') return i.ativo === true
    return i.ativo === false
  })

  const openAdd = () => {
    setIsAddOpen(true)
  }


  if (loadingDepartments || loadingCargos || loadingFuncionarios) {
    return (
      <DashboardLayout title='Gerenciar Instrutores' items={navigationItems}>
        <Box>
          <Skeleton variant='rectangular' height={300} />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={'Gerenciar Instrutores'} items={navigationItems}>
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
            activeLabel='Instrutores Ativos'
            inactiveLabel='Instrutores Inativos' 
            activeCount={instrutores.filter(i => i.ativo === true).length} 
            inactiveCount={instrutores.filter(i => i.ativo === false).length}
          />
          <Button
            onClick={openAdd}
            startIcon={<AddIcon />}
            variant='contained'
           >
            Adicionar Instrutor
          </Button>
        </Box>

        <Card>
          <CardHeader
            title={
              <Typography variant='h6' fontWeight={600}>
                {tab === 'active'
                  ? 'Instrutores Ativos'
                  : tab === 'disabled'
                    ? 'Instrutores Inativos'
                    : 'Todos os Instrutores'}
              </Typography>
            }
           />
          <CardContent>
            {filtered.length === 0 ? (
              <Alert severity='info'>
                {tab === 'all'
                  ? 'Nenhum instrutor cadastrado. Clique em "Adicionar Instrutor" para começar.'
                  : `Nenhum instrutor ${tab === 'active' ? 'ativo' : 'desabilitado'} encontrado.`}
              </Alert>
            ) : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='right'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                     <TableRow   hover>
                      <TableCell>
                        <Typography
                          component='span'
                          sx={{
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          }}
                        >
                           
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                           
                        </Typography>
                      </TableCell>
                      <TableCell>{ }</TableCell>
                      <TableCell>
                        
                      </TableCell>
                      <TableCell>
                        
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Switch
                            />
                          <Chip
                            size='small'
                             
                          />
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                           aria-label='editar'
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                         
                          aria-label='excluir'
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                 </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Adicionar Instrutor */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeIcon />
              Novo Instrutor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Nome completo'
                    fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Email'
                  type='email'
                   fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='CPF'
                   placeholder='000.000.000-00'
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                  
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map(dept => (
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
                  
                    label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                   
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia do Instrutor'
                  
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e especialidades do instrutor...'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setIsAddOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
             
            >
              'Adicionar'
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Instrutor */}
        <Dialog
          open={!!editingInstructor}
          onClose={() => setEditingInstructor(null)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon />
              Editar Instrutor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Nome completo'
                   fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Email'
                  type='email'
                   fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    
                    label='Departamento'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map(dept => (
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
                     label='Cargo'
                  >
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                    
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                   
                    label='Status'
                  >
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label='Biografia do Instrutor'
                
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5}
                  placeholder='Descreva a experiência, qualificações e especialidades do instrutor...'
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              onClick={() => setEditingInstructor(null)}
             >
              Cancelar
            </Button>
            <Button
              variant='contained'
              
            >
     'Atualizar'
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
