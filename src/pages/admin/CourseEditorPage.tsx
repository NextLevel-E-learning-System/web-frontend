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
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
import CourseModulesSection from '@/components/modules/CourseModulesSection'

interface TabDefinition {
  id: string
  label: string
}

const INFO_TAB: TabDefinition = { id: 'info', label: 'Curso' }
const MODULES_TAB: TabDefinition = { id: 'modules', label: 'Módulos' }

export default function CourseEditorPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const isEdit = !!codigo
  const navigate = useNavigate()
  const location = useLocation() as any

  const courseQuery = isEdit && codigo ? useCourse(codigo) : null

  const rawCourseData: any = courseQuery?.data
  const course: Course | null | undefined = rawCourseData
    ? rawCourseData?.codigo
      ? (rawCourseData as Course)
      : rawCourseData?.curso?.codigo
        ? (rawCourseData.curso as Course)
        : rawCourseData?.item?.codigo
          ? (rawCourseData.item as Course)
          : rawCourseData?.data?.codigo
            ? (rawCourseData.data as Course)
            : null
    : null
  const loadingCourse = courseQuery?.isLoading ?? false
  const createCourse = useCreateCourse()
  const updateCourse = isEdit && codigo ? useUpdateCourse(codigo) : null

  // Só executa useCourseModules se temos um código válido
  const modulesQuery = isEdit && codigo ? useCourseModules(codigo) : null
  const modules: Module[] = modulesQuery?.data || []
  const { navigationItems } = useNavigation()
  // Dados auxiliares para selects
  const { data: categorias = [] } = useCategories()
  const { data: funcionariosResponse } = useFuncionarios()
  const funcionarios = funcionariosResponse?.items || []
  const { data: allCoursesResponse } = useCourses({})
  const allCourses: Course[] = allCoursesResponse?.items || []

  const [tab, setTab] = useState<string>(INFO_TAB.id)

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
      setForm((f: any) => {
        // Evita setState se nada mudou (previne loop de profundidade)
        const next = {
          ...f,
          codigo: course.codigo,
          titulo: course.titulo,
          descricao: course.descricao ?? '',
          categoria_id: course.categoria_id || '',
          instrutor_id: course.instrutor_id || '',
          duracao_estimada: course.duracao_estimada || 0,
          xp_oferecido: course.xp_oferecido || 0,
          nivel_dificuldade: course.nivel_dificuldade || 'Iniciante',
          pre_requisitos: course.pre_requisitos || [],
          ativo: course.ativo,
        }
        const changed = Object.keys(next).some(
          k => (next as any)[k] !== (f as any)[k]
        )
        return changed ? next : f
      })
      if (course.departamento_codigo) {
        setDepartamentoSelecionado(dep => dep || course.departamento_codigo!)
      }
    }
  }, [isEdit, course?.codigo])

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
  }, [location, navigate, tab, codigo])

  // Atualiza xp com base nos módulos se for edição
  useEffect(() => {
    if (isEdit && codigo && modules && Array.isArray(modules)) {
      const totalXp = modules.reduce((acc, m: any) => acc + (m.xp || 0), 0)
      setForm((f: any) =>
        f.xp_oferecido !== totalXp ? { ...f, xp_oferecido: totalXp } : f
      )
    }
  }, [modules.length, isEdit, codigo, modules])

  const handleSaveInfo = async (goToModules = false) => {
    try {
      if (!form.titulo?.trim()) return

      if (isEdit && updateCourse) {
        const updateData = {
          titulo: form.titulo,
          descricao: form.descricao,
          categoria_id: form.categoria_id,
          instrutor_id: form.instrutor_id,
          duracao_estimada: form.duracao_estimada,
          xp_oferecido: form.xp_oferecido,
          nivel_dificuldade: form.nivel_dificuldade,
          pre_requisitos: form.pre_requisitos,
          ativo: form.ativo,
        }
        await updateCourse.mutateAsync(updateData)
        if (goToModules) {
          setTab(MODULES_TAB.id)
        } else {
          setTimeout(() => navigate('/gerenciar/cursos'), 1500)
        }
      } else {
        setTimeout(() => navigate('/gerenciar/cursos'), 1500)
      }
    } catch (e: any) {
      /* empty */
    }
  }

  const renderCurrent = () => {
    // Evita piscar formulário vazio enquanto carrega dados em modo edição
    if (isEdit && loadingCourse)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )
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
                minRows={2}
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
                  onChange={e => {
                    setForm({ ...form, instrutor_id: e.target.value })
                  }}
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
                disabled
                InputProps={{ readOnly: true }}
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
            <Button variant='text' onClick={() => navigate('/gerenciar/cursos')}>
              Cancelar
            </Button>
            <Button
              variant='outlined'
              onClick={() => handleSaveInfo(false)}
              disabled={
                createCourse.isPending ||
                updateCourse?.isPending ||
                !form.titulo
              }
            >
              Salvar
            </Button>
            {isEdit && (
              <Button
                variant='contained'
                onClick={() => handleSaveInfo(true)}
                disabled={
                  createCourse.isPending ||
                  updateCourse?.isPending ||
                  !form.titulo
                }
              >
                Próximo
              </Button>
            )}
          </Stack>
        </Stack>
      )
    }
    if (tab === MODULES_TAB.id)
      return (
        <CourseModulesSection
          cursoCodigo={codigo!}
          onTotalXpChange={total =>
            setForm((f: any) => ({ ...f, xp_oferecido: total }))
          }
        />
      )
    return null
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>
              {isEdit ? `${course?.titulo || form.titulo}` : 'Novo Curso'}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              variant='text'
              size='small'
              onClick={() =>
                navigate('/gerenciar/cursos', { state: { fromEditor: true } })
              }
            >
              Voltar para Cursos
            </Button>
          </Stack>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant='scrollable'
            allowScrollButtonsMobile
          >
            <Tab value={INFO_TAB.id} label={INFO_TAB.label} />
            {isEdit && <Tab value={MODULES_TAB.id} label={MODULES_TAB.label} />}
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
      </Box>
    </DashboardLayout>
  )
}
