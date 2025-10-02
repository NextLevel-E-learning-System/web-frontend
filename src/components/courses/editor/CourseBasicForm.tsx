import {
  type Course as Curso,
  type CreateCourseInput,
  type UpdateCourseInput,
  type Category,
} from '@/api/courses'
import { type Funcionario } from '@/api/users'
import {
  Stack,
  TextField,
  Button,
  Grid,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material'
import { useEffect, useState } from 'react'

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

export default function CourseBasicForm({
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
    <Stack gap={2}>
      <TextField
        label='Código'
        value={form.codigo}
        onChange={e => setForm({ ...form, codigo: e.target.value })}
        fullWidth
        required
        disabled={mode === 'edit'}
        helperText={mode === 'edit' ? 'Código não pode ser alterado' : ''}
      />
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
      <Grid container spacing={2}>
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
              onChange={e => setForm({ ...form, categoria_id: e.target.value })}
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
              onChange={e => setForm({ ...form, instrutor_id: e.target.value })}
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
                      checked={form.pre_requisitos?.includes(curso.codigo)}
                    />
                    <ListItemText primary={curso.titulo} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Button
        variant='contained'
        onClick={handleSubmit}
        disabled={isLoading || !form.titulo?.trim()}
      >
        Salvar
      </Button>
    </Stack>
  )
}
