import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Tabs,
  Tab,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material'
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useCourseModules,
  useCategories,
  useCourses,
  type Course,
  type Module,
  type Category,
} from '@/api/courses'
import { useFuncionarios } from '@/api/users'
import DashboardLayout from '@/components/layout/DashboardLayout'
import useNavigation from '@/hooks/useNavigation'
// Componentes antigos (Advanced/Curriculum/Publish) removidos da UI direta nesta fase.

interface TabDefinition {
  id: string
  label: string
}

// Agora somente duas fases: Informações (criação completa) e Módulos (após curso existir)
const INFO_TAB: TabDefinition = { id: 'info', label: 'Informações' }
const MODULES_TAB: TabDefinition = { id: 'modules', label: 'Módulos' }

export default function CourseEditorPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const isEdit = !!codigo
  const navigate = useNavigate()
  const location = useLocation() as any
  const courseQuery = isEdit ? useCourse(codigo!) : null
  const course = courseQuery?.data as Course | null | undefined
  const loadingCourse = courseQuery?.isLoading ?? false
  const createCourse = useCreateCourse()
  const updateCourse = isEdit ? useUpdateCourse(codigo!) : null
  const modulesQuery = isEdit ? useCourseModules(codigo!) : null
  const modules: Module[] = modulesQuery?.data || []
  const { navigationItems } = useNavigation()
  // Dados auxiliares para selects
  const { data: categorias = [] } = useCategories()
  const { data: funcionariosResponse } = useFuncionarios()
  const funcionarios = funcionariosResponse?.items || []
  const { data: allCoursesResponse } = useCourses({})
  const allCourses: Course[] = allCoursesResponse?.items || []

  const [tab, setTab] = useState<string>(INFO_TAB.id)
  const [snack, setSnack] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // Form state centralizado (pode ser distribuído em subcomponentes via props ou context)
  const [form, setForm] = useState<any>({
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

  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('')

  useEffect(() => {
    if (isEdit && course) {
      setForm((f: any) => ({
        ...f,
        codigo: course.codigo,
        titulo: course.titulo,
        descricao: course.descricao,
        categoria_id: course.categoria_id,
        instrutor_id: course.instrutor_id,
        duracao_estimada: course.duracao_estimada || 0,
        xp_oferecido: course.xp_oferecido || 0,
        nivel_dificuldade: course.nivel_dificuldade || 'Iniciante',
        pre_requisitos: course.pre_requisitos || [],
        ativo: course.ativo,
      }))
    }
  }, [isEdit, course])

  // Ajusta departamento selecionado ao carregar categorias e curso
  useEffect(() => {
    if (categorias.length && form.categoria_id) {
      const cat = (categorias as Category[]).find(
        c => c.codigo === form.categoria_id
      )
      if (cat?.departamento_codigo && !departamentoSelecionado) {
        setDepartamentoSelecionado(cat.departamento_codigo)
      }
    }
  }, [categorias, form.categoria_id, departamentoSelecionado])

  // Se navegação trouxe state para abrir aba específica (ex: após criar ir para advanced)
  useEffect(() => {
    if (location.state?.nextTab && location.state.nextTab !== tab) {
      setTab(location.state.nextTab)
      // Limpa para não reaplicar ao voltar
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate, tab])

  // Atualiza xp com base nos módulos se for edição
  useEffect(() => {
    if (isEdit) {
      const totalXp = modules.reduce((acc, m: any) => acc + (m.xp || 0), 0)
      setForm((f: any) => ({ ...f, xp_oferecido: totalXp }))
    }
  }, [modules, isEdit])

  const handleSaveInfo = async (goToModules = false) => {
    try {
      if (!form.titulo?.trim()) return
      if (isEdit && updateCourse) {
        await updateCourse.mutateAsync({
          titulo: form.titulo,
          descricao: form.descricao,
          categoria_id: form.categoria_id,
          duracao_estimada: form.duracao_estimada,
          xp_oferecido: form.xp_oferecido,
          nivel_dificuldade: form.nivel_dificuldade,
          // Campos não atualizados neste endpoint específico (instrutor, prereqs, ativo) omitidos
        })
        setSnack({
          open: true,
          message: 'Curso atualizado',
          severity: 'success',
        })
        if (goToModules) setTab(MODULES_TAB.id)
      } else {
        const created = await createCourse.mutateAsync({
          codigo: form.codigo,
          titulo: form.titulo,
          descricao: form.descricao,
          categoria_id: form.categoria_id,
          instrutor_id: form.instrutor_id,
          duracao_estimada: form.duracao_estimada,
          xp_oferecido: form.xp_oferecido,
          nivel_dificuldade: form.nivel_dificuldade,
          pre_requisitos: form.pre_requisitos,
          ativo: form.ativo,
        })
        setSnack({ open: true, message: 'Curso criado', severity: 'success' })
        navigate(`/admin/courses/${created.codigo}/edit`, {
          state: { nextTab: goToModules ? MODULES_TAB.id : INFO_TAB.id },
        })
      }
    } catch (e) {
      setSnack({ open: true, message: 'Erro ao salvar', severity: 'error' })
    }
  }

  // Painel de módulos simples placeholder (apenas lista com contagem) - poderá ser substituído por interface completa existente
  const ModulesPanel = () => (
    <Stack gap={2}>
      <Typography variant='subtitle1'>Gerenciar Módulos</Typography>
      {modulesQuery?.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack gap={1}>
          {modules.length === 0 && (
            <Typography variant='body2' color='text.secondary'>
              Nenhum módulo cadastrado ainda.
            </Typography>
          )}
          {modules.map(m => (
            <Paper key={m.id} variant='outlined' sx={{ p: 1.5 }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
              >
                <Stack>
                  <Typography fontWeight={600}>{m.titulo}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Tipo: {m.tipo_conteudo || '—'} • XP: {m.xp || 0}
                  </Typography>
                </Stack>
                <Button
                  size='small'
                  onClick={() =>
                    navigate(`/admin/courses/${codigo}/edit?module=${m.id}`)
                  }
                >
                  Abrir
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
      <Divider />
      <Stack direction='row' justifyContent='flex-end'>
        <Button
          variant='contained'
          onClick={() =>
            navigate(`/admin/courses/${codigo}/edit?createModule=1`)
          }
        >
          Novo Módulo
        </Button>
      </Stack>
    </Stack>
  )

  const renderCurrent = () => {
    if (tab === INFO_TAB.id) {
      return (
        <Stack gap={2}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
            }}
          >
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <TextField
                label='Código'
                value={form.codigo}
                onChange={e => setForm({ ...form, codigo: e.target.value })}
                fullWidth
                required
                disabled={isEdit}
                helperText={isEdit ? 'Código não pode ser alterado' : ''}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.ativo ? 'true' : 'false'}
                  label='Status'
                  onChange={e =>
                    setForm({ ...form, ativo: e.target.value === 'true' })
                  }
                  disabled={isEdit} // caso status altere em outro fluxo
                >
                  <MenuItem value='true'>Ativo</MenuItem>
                  <MenuItem value='false'>Inativo</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <TextField
                label='Título'
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                label='Descrição'
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                fullWidth
                multiline
                minRows={3}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
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
                    <em>— Selecione —</em>
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
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
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
                    <em>— Selecione —</em>
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
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <FormControl fullWidth>
                <InputLabel>Instrutor</InputLabel>
                <Select
                  value={form.instrutor_id || ''}
                  label='Instrutor'
                  onChange={e =>
                    setForm({ ...form, instrutor_id: e.target.value })
                  }
                  disabled={isEdit}
                >
                  <MenuItem value=''>
                    <em>— Selecione —</em>
                  </MenuItem>
                  {funcionarios
                    .filter(func => func.role === 'INSTRUTOR')
                    .map(func => (
                      <MenuItem key={func.id} value={func.id}>
                        {func.nome}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <TextField
                label='Duração Estimada (h)'
                type='number'
                value={form.duracao_estimada}
                onChange={e =>
                  setForm({ ...form, duracao_estimada: Number(e.target.value) })
                }
                fullWidth
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <TextField
                label='XP Total (módulos)'
                type='number'
                value={form.xp_oferecido}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText='Calculado a partir dos módulos'
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <FormControl fullWidth>
                <InputLabel>Nível</InputLabel>
                <Select
                  value={form.nivel_dificuldade}
                  label='Nível'
                  onChange={e =>
                    setForm({ ...form, nivel_dificuldade: e.target.value })
                  }
                >
                  <MenuItem value='Iniciante'>Iniciante</MenuItem>
                  <MenuItem value='Intermediário'>Intermediário</MenuItem>
                  <MenuItem value='Avançado'>Avançado</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControl fullWidth>
                <InputLabel>Pré-requisitos</InputLabel>
                <Select
                  multiple
                  label='Pré-requisitos'
                  value={form.pre_requisitos}
                  onChange={e => {
                    const value = e.target.value
                    setForm({
                      ...form,
                      pre_requisitos: Array.isArray(value) ? value : [value],
                    })
                  }}
                  renderValue={selected =>
                    (Array.isArray(selected) ? selected : [selected])
                      .map(
                        cod =>
                          allCourses.find(c => c.codigo === cod)?.codigo || cod
                      )
                      .join(', ')
                  }
                >
                  {allCourses
                    .filter(c => c.codigo !== form.codigo)
                    .map(curso => (
                      <MenuItem key={curso.codigo} value={curso.codigo}>
                        <Checkbox
                          checked={form.pre_requisitos.includes(curso.codigo)}
                        />
                        <ListItemText primary={curso.titulo} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Stack direction='row' gap={1} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={() => handleSaveInfo(true)}
              disabled={
                createCourse.isPending ||
                updateCourse?.isPending ||
                !form.titulo
              }
            >
              Salvar & Módulos
            </Button>
            <Button
              variant='contained'
              onClick={() => handleSaveInfo(false)}
              disabled={
                createCourse.isPending ||
                updateCourse?.isPending ||
                !form.titulo
              }
            >
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </Stack>
        </Stack>
      )
    }
    if (tab === MODULES_TAB.id) return <ModulesPanel />
    return null
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              {isEdit
                ? `Editar Curso — ${course?.titulo || form.titulo}`
                : 'Novo Curso'}
            </Typography>
            <Stack direction='row' gap={1}>
              <Button variant='outlined' onClick={() => navigate(-1)}>
                Voltar
              </Button>
              <Button
                variant='contained'
                onClick={() => handleSaveInfo()}
                disabled={createCourse.isPending || updateCourse?.isPending}
              >
                {isEdit ? 'Salvar' : 'Criar'}
              </Button>
            </Stack>
          </Stack>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant='scrollable'
            allowScrollButtonsMobile
          >
            <Tab value={INFO_TAB.id} label={INFO_TAB.label} />
            <Tab
              value={MODULES_TAB.id}
              label={MODULES_TAB.label}
              disabled={!isEdit}
            />
          </Tabs>
        </Paper>
        <Paper sx={{ p: 2, minHeight: 400 }}>
          {loadingCourse && isEdit ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderCurrent()
          )}
        </Paper>
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          <Alert
            onClose={() => setSnack(s => ({ ...s, open: false }))}
            severity={snack.severity}
            variant='filled'
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  )
}
