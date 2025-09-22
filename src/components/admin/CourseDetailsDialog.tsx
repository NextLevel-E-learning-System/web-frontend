import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from '@mui/material'
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { useState } from 'react'

interface CursoDetalhes {
  id?: string
  codigo: string
  titulo: string
  descricao?: string
  categoria_nome?: string
  instrutor_nome?: string
  instrutor_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
  ativo?: boolean
  total_modulos?: number
  total_inscritos: number
  total_concluidos: number
  em_andamento: number
  taxa_conclusao: number
  avaliacao_media: number
  total_avaliacoes: number
  tempo_medio_conclusao: number
  data_criacao?: string
}

interface CourseDetailsDialogProps {
  open: boolean
  onClose: () => void
  curso: CursoDetalhes | null
}

export default function CourseDetailsDialog({
  open,
  onClose,
  curso,
}: CourseDetailsDialogProps) {
  if (!curso) return null
  const [tab, setTab] = useState<
    'general' | 'assignment' | 'settings' | 'content'
  >('general')
  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Básico':
        return 'success'
      case 'Intermediário':
        return 'warning'
      case 'Avançado':
        return 'error'
      default:
        return 'default'
    }
  }

  const getProgressColor = (taxa: number) => {
    if (taxa > 70) return 'success'
    if (taxa > 40) return 'warning'
    return 'error'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Novo Curso</DialogTitle>
      <DialogContent>
        <Box
          sx={{ borderBottom: t => `1px solid ${t.palette.divider}`, mb: 2 }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value='general' label='Geral' />
            <Tab value='assignment' label='Atribuição' />
            <Tab value='settings' label='Configurações' />
            <Tab value='content' label='Conteúdo' />
          </Tabs>
        </Box>

        {tab === 'general' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código'
                  value={curso.codigo}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Select
                  fullWidth
                  value={form.status}
                  onChange={e =>
                    setForm({
                      ...form,
                      status: e.target.value as Subject['status'],
                    })
                  }
                >
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Draft'>Draft</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </Select>
              </Grid>
            </Grid>
            <TextField
              label='Título'
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <TextField
              label='Descrição'
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        )}

        {tab === 'assignment' && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                fullWidth
                displayEmpty
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <MenuItem value=''>
                  <em>— Selecione o departamento —</em>
                </MenuItem>
                {departments.map(d => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                fullWidth
                displayEmpty
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value=''>
                  <em>— Selecione a categoria —</em>
                </MenuItem>
                {categories.map(c => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Select
                fullWidth
                displayEmpty
                value={form.instructor}
                onChange={e => setForm({ ...form, instructor: e.target.value })}
              >
                <MenuItem value=''>
                  <em>— Selecione o instrutor —</em>
                </MenuItem>
                {instructors.map(i => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        )}

        {tab === 'settings' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.independent}
                  onChange={e =>
                    setForm({ ...form, independent: e.target.checked })
                  }
                />
              }
              label='Disciplina independente'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.certification}
                  onChange={e =>
                    setForm({ ...form, certification: e.target.checked })
                  }
                />
              }
              label='Possui certificação'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.sequential}
                  onChange={e =>
                    setForm({ ...form, sequential: e.target.checked })
                  }
                />
              }
              label='Aprendizado sequencial'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.showProgress}
                  onChange={e =>
                    setForm({ ...form, showProgress: e.target.checked })
                  }
                />
              }
              label='Mostrar progresso'
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Taxa (fees)'
                  type='number'
                  value={form.fees}
                  onChange={e => setForm({ ...form, fees: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Unidades de teste'
                  type='number'
                  value={form.trialUnits}
                  onChange={e =>
                    setForm({ ...form, trialUnits: e.target.value })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {tab === 'content' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Sobre o curso'
              value={form.about}
              onChange={e => setForm({ ...form, about: e.target.value })}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label='Pré-requisitos'
              value={form.prerequisites}
              onChange={e =>
                setForm({ ...form, prerequisites: e.target.value })
              }
              fullWidth
              multiline
              minRows={4}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={() => setIsAddOpen(false)}>
          Cancelar
        </Button>
        <Button variant='contained' onClick={handleAdd}>
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
