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
  const [tab, setTab] = useState<'general' | 'assignment' | 'content'>('general')
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState<string>('')
  
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
    ativo: true,
  })

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
          ativo: courseToEdit.ativo ?? true,
        })
        
        // Pré-selecionar departamento baseado na categoria do curso
        const categoria = categorias.find(c => c.codigo === courseToEdit.categoria_id)
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
          ativo: true,
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

  const title = mode === 'create' 
    ? 'Adicionar Curso' 
    : `Editar Curso${courseToEdit ? ` — ${courseToEdit.titulo}` : ''}`

  const submitText = mode === 'create' ? 'Adicionar' : 'Salvar alterações'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={{ py: 0 }}>
        <Box sx={{ borderBottom: t => `1px solid ${t.palette.divider}`, mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value="general" label="Geral" />
            <Tab value="assignment" label="Atribuição" />
            <Tab value="content" label="Conteúdo" />
          </Tabs>
        </Box>

        {tab === 'general' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Código"
                      value={form.codigo}
                      onChange={e => setForm({ ...form, codigo: e.target.value })}
                      fullWidth
                      required
                      disabled={mode === 'edit'}
                      helperText={mode === 'edit' ? 'Código não pode ser alterado' : ''}
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
                        label="Status"
                      >
                        <MenuItem value="true">Ativo</MenuItem>
                        <MenuItem value="false">Inativo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                   
            </Grid>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
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
                  label="Departamento"
                  onChange={e => {
                    setDepartamentoSelecionado(e.target.value)
                    setForm({ ...form, categoria_id: '' })
                  }}
                >
                  <MenuItem value="">
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
                  label="Categoria"
                  onChange={e =>
                    setForm({ ...form, categoria_id: e.target.value })
                  }
                >
                  <MenuItem value="">
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
                  label="Instrutor"
                  onChange={e =>
                    setForm({ ...form, instrutor_id: e.target.value })
                  }
                  disabled={mode === 'edit'}
                >
                  <MenuItem value="">
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
            <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Duração Estimada (horas)"
                type="number"
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
                label="XP Oferecido"
                type="number"
                value={form.xp_oferecido}
                onChange={e =>
                  setForm({
                    ...form,
                    xp_oferecido: Number(e.target.value),
                  })
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Nível de Dificuldade</InputLabel>
                <Select
                  value={form.nivel_dificuldade || 'Iniciante'}
                  label="Nível de Dificuldade"
                  onChange={e =>
                    setForm({
                      ...form,
                      nivel_dificuldade: e.target.value,
                    })
                  }
                >
                  <MenuItem value="iniciante">Iniciante</MenuItem>
                  <MenuItem value="intermediario">Intermediário</MenuItem>
                  <MenuItem value="avancado">Avançado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Pré-requisitos</InputLabel>
                <Select
                  multiple
                  label="Pré-requisitos"
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
                    .filter(c => c.codigo !== form.codigo) // Não permitir curso como pré-requisito dele mesmo
                    .map(curso => (
                      <MenuItem key={curso.codigo} value={curso.codigo}>
                        <Checkbox
                          checked={form.pre_requisitos?.includes(curso.codigo)}
                        />
                        <ListItemText primary={curso.titulo} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>
          <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !form.titulo.trim()}
          startIcon={
            isLoading ? <CircularProgress size={18} /> : undefined
          }
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}