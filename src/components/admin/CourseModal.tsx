import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Grid,
  Checkbox,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import ModuleAssessmentsPanel from '@/components/assessments/ModuleAssessmentsPanel'
import { useCourseModules, useCreateModule } from '@/api/courses'
import AddIcon from '@mui/icons-material/Add'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Chip,
  Tabs as MuiTabs,
  Tab as MuiTab,
  IconButton,
  Tooltip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ModuleInfoForm from '@/components/modules/ModuleInfoForm'
import ModuleMaterialsPanel from '@/components/modules/ModuleMaterialsPanel'
import ModuleCreateDialog, {
  type CompositeModuleCreate,
} from '@/components/modules/ModuleCreateDialog'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import { useState, useEffect } from 'react'
import {
  type Course as Curso,
  type CreateCourseInput,
  type UpdateCourseInput,
  type Category,
} from '@/api/courses'
import { type Funcionario } from '@/api/users'

interface CourseModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCourseInput | UpdateCourseInput) => Promise<void>
  isLoading?: boolean
  mode: 'create' | 'edit'
  courseToEdit?: Curso | null
  categorias: Category[]
  funcionarios: Funcionario[]
  cursos: Curso[]
}

type FormData = CreateCourseInput & UpdateCourseInput

export default function CourseModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  mode,
  courseToEdit,
  categorias,
  funcionarios,
  cursos,
}: CourseModalProps) {
  const [tab, setTab] = useState<
    'general' | 'assignment' | 'content' | 'modules'
  >('general')
  const [departamentoSelecionado, setDepartamentoSelecionado] =
    useState<string>('')

  const [form, setForm] = useState<FormData>({
    codigo: '',
    titulo: '',
    descricao: '',
    categoria_id: '',
    instrutor_id: '',
    duracao_estimada: 0,
    xp_oferecido: 0,
    nivel_dificuldade: 'Iniciante',
    pre_requisitos: [],
    ativo: false,
  })
  const handleModulesTotalXp = (total: number) => {
    setForm(f => ({ ...f, xp_oferecido: total }))
  }

  // Reset form quando o modal abre/fecha ou muda de modo
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && courseToEdit) {
        setForm({
          codigo: courseToEdit.codigo || '',
          titulo: courseToEdit.titulo || '',
          descricao: courseToEdit.descricao || '',
          categoria_id: courseToEdit.categoria_id || '',
          instrutor_id: courseToEdit.instrutor_id || '',
          duracao_estimada: courseToEdit.duracao_estimada || 0,
          xp_oferecido: courseToEdit.xp_oferecido || 0,
          nivel_dificuldade: courseToEdit.nivel_dificuldade || 'Iniciante',
          pre_requisitos: courseToEdit.pre_requisitos || [],
          ativo: courseToEdit.ativo ?? false,
        })

        // Pré-selecionar departamento baseado na categoria do curso
        const categoria = categorias.find(
          c => c.codigo === courseToEdit.categoria_id
        )
        if (categoria?.departamento_codigo) {
          setDepartamentoSelecionado(categoria.departamento_codigo)
        }
      } else {
        // Reset para modo create
        setForm({
          codigo: '',
          titulo: '',
          descricao: '',
          categoria_id: '',
          instrutor_id: '',
          duracao_estimada: 0,
          xp_oferecido: 0,
          nivel_dificuldade: 'Iniciante',
          pre_requisitos: [],
          ativo: false,
        })
        setDepartamentoSelecionado('')
      }
      setTab('general')
    }
  }, [open, mode, courseToEdit, categorias])

  const handleSubmit = async () => {
    try {
      if (mode === 'create') {
        await onSubmit(form as CreateCourseInput)
      } else {
        // Para edição, incluir categoria_id que pode ser editada
        const updateData: UpdateCourseInput = {
          titulo: form.titulo,
          descricao: form.descricao,
          categoria_id: form.categoria_id,
          duracao_estimada: form.duracao_estimada,
          xp_oferecido: form.xp_oferecido,
          nivel_dificuldade: form.nivel_dificuldade,
        }
        await onSubmit(updateData)
      }
    } catch (error) {
      // Erro será tratado pelo componente pai
    }
  }

  const title =
    mode === 'create'
      ? 'Adicionar Curso'
      : `Editar Curso${courseToEdit ? ` — ${courseToEdit.titulo}` : ''}`

  const submitText = mode === 'create' ? 'Adicionar' : 'Salvar alterações'

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Box
          sx={{ borderBottom: t => `1px solid ${t.palette.divider}`, mb: 2 }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value='general' label='Geral' />
            <Tab value='assignment' label='Atribuição' />
            <Tab value='content' label='Conteúdo' />
            {mode === 'edit' && <Tab value='modules' label='Módulos' />}
          </Tabs>
        </Box>

        {tab === 'general' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Código'
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                  fullWidth
                  required
                  disabled={mode === 'edit'}
                  helperText={
                    mode === 'edit' ? 'Código não pode ser alterado' : ''
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.ativo ? 'true' : 'false'}
                    onChange={e =>
                      setForm({
                        ...form,
                        ativo: e.target.value === 'true',
                      })
                    }
                    label='Status'
                  >
                    <MenuItem value='true'>Ativo</MenuItem>
                    <MenuItem value='false'>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label='Título'
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label='Descrição'
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>
        )}

        {tab === 'assignment' && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={departamentoSelecionado}
                  label='Departamento'
                  onChange={e => {
                    setDepartamentoSelecionado(e.target.value)
                    setForm({ ...form, categoria_id: '' })
                  }}
                >
                  <MenuItem value=''>
                    <em>— Selecione o departamento —</em>
                  </MenuItem>
                  {categorias
                    .map(cat => cat.departamento_codigo)
                    .filter((v, i, arr) => v && arr.indexOf(v) === i)
                    .map(depCodigo => (
                      <MenuItem key={depCodigo} value={depCodigo!}>
                        {depCodigo}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={form.categoria_id || ''}
                  label='Categoria'
                  onChange={e =>
                    setForm({ ...form, categoria_id: e.target.value })
                  }
                >
                  <MenuItem value=''>
                    <em>— Selecione a categoria —</em>
                  </MenuItem>
                  {categorias
                    .filter(
                      cat =>
                        !departamentoSelecionado ||
                        cat.departamento_codigo === departamentoSelecionado
                    )
                    .map(cat => (
                      <MenuItem key={cat.codigo} value={cat.codigo}>
                        {cat.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Instrutor</InputLabel>
                <Select
                  value={form.instrutor_id || ''}
                  label='Instrutor'
                  onChange={e =>
                    setForm({ ...form, instrutor_id: e.target.value })
                  }
                  disabled={mode === 'edit'}
                >
                  <MenuItem value=''>
                    <em>— Selecione o instrutor —</em>
                  </MenuItem>
                  {funcionarios?.map(func => (
                    <MenuItem key={func.id} value={func.id}>
                      {func.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {tab === 'content' && (
          <Box sx={{ mt: 1, display: 'grid', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Duração Estimada (horas)'
                  type='number'
                  value={form.duracao_estimada}
                  onChange={e =>
                    setForm({
                      ...form,
                      duracao_estimada: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='XP Total (derivado dos módulos)'
                  type='number'
                  value={form.xp_oferecido}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText='Soma automática dos XP definidos em cada módulo'
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Nível de Dificuldade</InputLabel>
                  <Select
                    value={form.nivel_dificuldade || 'Iniciante'}
                    label='Nível de Dificuldade'
                    onChange={e =>
                      setForm({
                        ...form,
                        nivel_dificuldade: e.target.value,
                      })
                    }
                  >
                    <MenuItem value='iniciante'>Iniciante</MenuItem>
                    <MenuItem value='intermediario'>Intermediário</MenuItem>
                    <MenuItem value='avancado'>Avançado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Pré-requisitos</InputLabel>
                  <Select
                    multiple
                    label='Pré-requisitos'
                    value={form.pre_requisitos || []}
                    onChange={e => {
                      const value = e.target.value
                      setForm({
                        ...form,
                        pre_requisitos: Array.isArray(value) ? value : [value],
                      })
                    }}
                    renderValue={selected =>
                      (Array.isArray(selected) ? selected : [selected])
                        .map(cod => {
                          const curso = cursos.find(c => c.codigo === cod)
                          return curso ? curso.codigo : cod
                        })
                        .join(', ')
                    }
                  >
                    {cursos
                      .filter(c => c.codigo !== form.codigo)
                      .map(curso => (
                        <MenuItem key={curso.codigo} value={curso.codigo}>
                          <Checkbox
                            checked={form.pre_requisitos?.includes(
                              curso.codigo
                            )}
                          />
                          <ListItemText primary={curso.titulo} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        {tab === 'modules' && mode === 'edit' && (
          <Box sx={{ mt: 1 }}>
            <CourseModulesSection
              cursoCodigo={form.codigo}
              onTotalXpChange={handleModulesTotalXp}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant='outlined' onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={isLoading || !form.titulo.trim()}
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Seção interna para gerenciamento de módulos e avaliações
interface ModulesSectionProps {
  cursoCodigo: string
  onTotalXpChange?: (total: number) => void
}
function CourseModulesSection({
  cursoCodigo,
  onTotalXpChange,
}: ModulesSectionProps) {
  const { data: modulos = [], isLoading } = useCourseModules(cursoCodigo)
  const createModule = useCreateModule(cursoCodigo)
  const [createOpen, setCreateOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [moduleTab, setModuleTab] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState<{ open: boolean; moduloId?: string }>(
    () => ({ open: false })
  )

  // Reordenação simples (front-end) - envia update de ordem individual
  const swapOrder = async (fromId: string, direction: 'up' | 'down') => {
    const ordered = [...modulos].sort((a, b) => a.ordem - b.ordem)
    const idx = ordered.findIndex(m => m.id === fromId)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= ordered.length) return
    const current = ordered[idx]
    const target = ordered[targetIdx]
    // Otimista: trocar local
    const currentOrder = current.ordem
    current.ordem = target.ordem
    target.ordem = currentOrder
    try {
      // Usa atualização individual (poderia ser uma rota bulk se existir)
      // Reaproveita hook de update criando dinamicamente (padrão já usado em outros pontos)
      const updaterCurrent = (await import('@/api/courses')).useUpdateModule(
        cursoCodigo,
        current.id
      )
      const updaterTarget = (await import('@/api/courses')).useUpdateModule(
        cursoCodigo,
        target.id
      )
      await Promise.all([
        updaterCurrent.mutateAsync({ ordem: current.ordem }),
        updaterTarget.mutateAsync({ ordem: target.ordem }),
      ])
    } catch {}
  }

  return (
    <Box>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 1 }}
      >
        <Typography variant='subtitle2'>Módulos</Typography>
        <Button
          variant='outlined'
          size='small'
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Novo Módulo
        </Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : modulos.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhum módulo cadastrado.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {modulos
            .sort((a, b) => a.ordem - b.ordem)
            .map((m, i, arr) => {
              const allowedTabs: Array<'info' | 'materiais' | 'avaliacoes'> = [
                'info',
              ]
              if (['video', 'pdf'].includes((m as any).tipo_conteudo))
                allowedTabs.push('materiais')
              if ((m as any).tipo_conteudo === 'quiz')
                allowedTabs.push('avaliacoes')
              const stored = moduleTab[m.id]
              const currentTab = (
                stored && allowedTabs.includes(stored as any) ? stored : 'info'
              ) as 'info' | 'materiais' | 'avaliacoes'
              return (
                <Accordion
                  key={m.id}
                  expanded={expanded === m.id}
                  onChange={(_, isExp) => setExpanded(isExp ? m.id : false)}
                  disableGutters
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 1,
                      },
                    }}
                  >
                    <Typography variant='body2' fontWeight={600}>
                      {m.titulo}
                    </Typography>
                    <Chip size='small' label={`Ordem ${m.ordem}`} />
                    {m.xp ? (
                      <Chip
                        size='small'
                        variant='outlined'
                        label={`${m.xp} XP`}
                      />
                    ) : null}
                    <Stack direction='row' gap={0.5} sx={{ ml: 'auto' }}>
                      <Tooltip title='Mover para cima'>
                        <span>
                          <IconButton
                            size='small'
                            disabled={i === 0}
                            onClick={e => {
                              e.stopPropagation()
                              swapOrder(m.id, 'up')
                            }}
                          >
                            <ArrowUpwardIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title='Mover para baixo'>
                        <span>
                          <IconButton
                            size='small'
                            disabled={i === arr.length - 1}
                            onClick={e => {
                              e.stopPropagation()
                              swapOrder(m.id, 'down')
                            }}
                          >
                            <ArrowDownwardIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title='Excluir módulo (não implementado)'>
                        <span>
                          <IconButton
                            size='small'
                            disabled
                            onClick={e => {
                              e.stopPropagation()
                              setConfirm({ open: true, moduloId: m.id })
                            }}
                          >
                            <DeleteIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{
                        mb: 2,
                        borderBottom: theme =>
                          `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <MuiTabs
                        value={currentTab}
                        onChange={(_, val) =>
                          setModuleTab(prev => ({ ...prev, [m.id]: val }))
                        }
                        variant='scrollable'
                        scrollButtons='auto'
                      >
                        <MuiTab value='info' label='Info' />
                        {allowedTabs.includes('materiais') && (
                          <MuiTab value='materiais' label='Materiais' />
                        )}
                        {allowedTabs.includes('avaliacoes') && (
                          <MuiTab value='avaliacoes' label='Avaliações' />
                        )}
                      </MuiTabs>
                    </Box>
                    {currentTab === 'info' && (
                      <ModuleInfoForm cursoCodigo={cursoCodigo} modulo={m} />
                    )}
                    {currentTab === 'materiais' &&
                      allowedTabs.includes('materiais') && (
                        <ModuleMaterialsPanel moduloId={m.id} />
                      )}
                    {currentTab === 'avaliacoes' &&
                      allowedTabs.includes('avaliacoes') && (
                        <ModuleAssessmentsPanel
                          cursoCodigo={cursoCodigo}
                          moduloId={m.id}
                          moduloTitulo={m.titulo}
                        />
                      )}
                  </AccordionDetails>
                </Accordion>
              )
            })}
        </Box>
      )}
      {/* Efeito para comunicar total de XP ao pai */}
      {onTotalXpChange && (
        <XPNotifier modulos={modulos} onChange={onTotalXpChange} />
      )}
      <ConfirmationDialog
        open={confirm.open}
        title='Excluir módulo'
        message='Funcionalidade de exclusão ainda não implementada.'
        onConfirm={() => setConfirm({ open: false })}
        onClose={() => setConfirm({ open: false })}
        confirmText='Fechar'
        cancelText=''
      />
      <ModuleCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        nextOrder={(modulos?.length || 0) + 1}
        loading={createModule.isPending}
        onCreate={async (data: CompositeModuleCreate) => {
          const created = await createModule.mutateAsync(data.module)
          // TODO: pipeline: upload materiais -> criar avaliação -> adicionar questões
          return created
        }}
      />
    </Box>
  )
}

// Componente auxiliar invisível para disparar atualização de XP total
function XPNotifier({
  modulos,
  onChange,
}: {
  modulos: Array<{ xp: number }>
  onChange: (total: number) => void
}) {
  const total = modulos.reduce((acc, m) => acc + (m.xp || 0), 0)
  // useEffect inline simples: executa sempre que total muda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onChange(total)
  }, [total])
  return null
}
