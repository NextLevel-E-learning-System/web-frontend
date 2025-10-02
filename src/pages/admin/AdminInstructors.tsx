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
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusFilterTabs from '@/components/common/StatusFilterTabs'
import { useNavigation } from '@/hooks/useNavigation'
import DataTable from '@/components/common/DataTable'
import {
  useListarDepartamentosAdmin,
  useListarCargos,
  useInstrutores,
  useToggleInstructorStatus,
  type Instructor,
} from '@/api/users'

export default function AdminInstructors() {
  const { navigationItems } = useNavigation()

  const { data: instrutoresResponse, isLoading: loadingInstrutores } =
    useInstrutores()
  const { data: departamentosResponse, isLoading: loadingDepartments } =
    useListarDepartamentosAdmin()
  const { data: cargosResponse, isLoading: loadingCargos } = useListarCargos()
  
  const instrutores = useMemo(() => instrutoresResponse || [], [instrutoresResponse])
  const departamentos = useMemo(() => (departamentosResponse as any)?.items || departamentosResponse || [], [departamentosResponse])
  const cargos = useMemo(() => (cargosResponse as any)?.items || cargosResponse || [], [cargosResponse])
  
  const [editingInstructor, setEditingInstructor] =
    useState<Instructor | null>(null)

  const [tab, setTab] = useState<'active' | 'disabled' | 'all'>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const toggleStatusMutation = useToggleInstructorStatus()

  // Definir colunas da tabela
  const instructorColumns = useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      width: 80,
      render: (row: Instructor) => (
        <Typography
          component='span'
          sx={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {row.funcionario_id}
        </Typography>
      )
    },
    {
      id: 'nome',
      label: 'Nome',
      width: 200,
      render: (row: Instructor) => (
        <Box>
          <Typography variant='body2' fontWeight={500}>
            {row.nome}
          </Typography>
        </Box>
      )
    },
    {
      id: 'email',
      label: 'Email',
      width: 250,
      render: (row: Instructor) => (
        <Typography variant='body2'>
          {row.email}
        </Typography>
      )
    },
    {
      id: 'departamento',
      label: 'Departamento',
      width: 150,
      render: (row: Instructor) => (
        <Chip
          label={row.departamento_nome || 'N/A'}
          size='small'
          variant='outlined'
        />
      )
    },
    {
      id: 'cargo',
      label: 'Cargo',
      width: 150,
      render: (row: Instructor) => (
        <Chip
          label={row.cargo_nome || 'N/A'}
          size='small'
          variant='outlined'
        />
      )
    },
    {
      id: 'avaliacao',
      label: 'Avaliação',
      width: 100,
      render: (row: Instructor) => (
        <Typography variant='body2'>
          {row.avaliacao_media ? `${row.avaliacao_media.toFixed(1)}/5` : 'N/A'}
        </Typography>
      )
    },
    {
      id: 'status',
      label: 'Status',
      width: 120,
      render: (row: Instructor) => (
        <Box display='flex' alignItems='center' gap={1}>
          <Switch
            checked={row.ativo}
            onChange={() => handleToggleAtivo(row.funcionario_id, row.nome, row.ativo)}
            size='small'
          />
          <Typography
            variant='body2'
            color={
              row.ativo ? 'success.main' : 'text.disabled'
            }
            fontWeight={500}
          >
            {row.ativo ? 'Ativo' : 'Inativo'}
          </Typography>
        </Box>
      )
    },
    {
      id: 'actions',
      label: 'Ações',
      width: 120,
      align: 'right' as const,
      render: (row: Instructor) => (
        <Box display='flex' gap={1} justifyContent='flex-end'>
          <IconButton
            size='small'
            onClick={() => setEditingInstructor(row)}
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
        </Box>
      )
    }
  ], [departamentos, cargos])

  const getRowId = useCallback((row: Instructor) => row.funcionario_id, [])

  // Filtrar dados baseado no tab selecionado
  const filtered = useMemo(() => {
    return instrutores.filter((i: Instructor) => {
      if (tab === 'active') return i.ativo === true
      if (tab === 'disabled') return i.ativo === false
      return true // 'all'
    })
  }, [instrutores, tab])

  const openAdd = () => {
    setIsAddOpen(true)
  }

  const handleToggleAtivo = async (
    funcionario_id: string,
    nome: string,
    ativo: boolean
  ) => {
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
  }

  if (loadingDepartments || loadingCargos || loadingInstrutores) {
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
          }}
        >
          <StatusFilterTabs
            value={tab}
            onChange={setTab}
            activeLabel='Instrutores Ativos'
            inactiveLabel='Instrutores Inativos'
            activeCount={instrutores.filter((i: Instructor) => i.ativo === true).length}
            inactiveCount={instrutores.filter((i: Instructor) => i.ativo === false).length}
          />
          <Button onClick={openAdd} startIcon={<AddIcon />} variant='contained'>
            Adicionar Instrutor
          </Button>
        </Box>

        {filtered.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">
              {tab === 'all'
                ? 'Nenhum instrutor cadastrado. Clique em "Adicionar Instrutor" para começar.'
                : `Nenhum instrutor ${tab === 'active' ? 'ativo' : 'desabilitado'} encontrado.`}
            </Typography>
          </Box>
        ) : (
          <DataTable
            data={filtered}
            columns={instructorColumns}
            loading={loadingInstrutores}
            getRowId={getRowId}
          />
        )}

        {/* Dialog Adicionar Instrutor */}
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon />
              Novo Instrutor
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label='Nome completo' fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label='Email' type='email' fullWidth required />
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
                  <Select label='Status'>
                    <MenuItem value='ATIVO'>Ativo</MenuItem>
                    <MenuItem value='INATIVO'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select label='Departamento'>
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map((dept: { codigo: string; nome: string }) => (
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
                  <Select label='Cargo'>
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
            <Button variant='outlined' onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button variant='contained'>'Adicionar'</Button>
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
                <TextField label='Nome completo' fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label='Email' type='email' fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select label='Departamento'>
                    <MenuItem value=''>
                      <em>— Selecione o departamento —</em>
                    </MenuItem>
                    {departamentos.map((dept: { codigo: string; nome: string }) => (
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
                  <Select label='Cargo'>
                    <MenuItem value=''>
                      <em>— Selecione o cargo —</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select label='Status'>
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
            <Button variant='contained'>'Atualizar'</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  )
}
