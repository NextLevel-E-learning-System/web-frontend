import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Box,
  Button,
  Tabs,
  Tab,
  Stack,
  Paper,
  CircularProgress,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useCourseModules,
  useCategories,
  useCourses,
  type Course,
  type Category,
} from '@/api/courses'
import { useFuncionarios } from '@/api/users'
import DashboardLayout from '@/components/layout/DashboardLayout'
import useNavigation from '@/hooks/useNavigation'
import CourseModulesSection from '@/components/modules/CourseModulesSection'
import { useCategoryColors } from '@/hooks/useCategoryColors'
import CourseContentHeader from '@/components/employee/CourseContentHeader'
import CourseStudentsPanel from '@/components/courses/CourseStudentsPanel'
import CourseReviewsPanel from '@/components/courses/CourseReviewsPanel'

interface TabDefinition {
  id: string
  label: string
}

const INFO_TAB: TabDefinition = { id: 'info', label: 'Curso' }
const MODULES_TAB: TabDefinition = { id: 'modules', label: 'Módulos' }
const STUDENTS_TAB: TabDefinition = { id: 'students', label: 'Inscritos' }
const REVIEWS_TAB: TabDefinition = { id: 'reviews', label: 'Correções' }

interface LocationState {
  nextTab?: string
  pathname?: string
  state?: LocationState
}

interface FormState {
  codigo: string
  titulo: string
  descricao: string
  categoria_id: string
  instrutor_id: string
  duracao_estimada: number
  xp_oferecido: number
  nivel_dificuldade: string
  pre_requisitos: string[]
  ativo: boolean
}

interface CreateCourseResponse {
  curso?: { codigo: string }
  codigo?: string
  mensagem?: string
}

export default function CourseEditorPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const isEdit = !!codigo
  const navigate = useNavigate()
  const location = useLocation()

  // Verificar se é modo de visualização apenas
  const isViewOnly =
    (location.state as LocationState & { viewOnly?: boolean })?.viewOnly ||
    false

  // Sempre chama os hooks na mesma ordem
  const courseQuery = useCourse(codigo || '')
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse(codigo || '')
  const modulesQuery = useCourseModules(codigo || '')

  // Extrai os dados apenas se estiver em modo de edição
  const rawCourseData = isEdit ? courseQuery?.data : null
  const course: Course | null | undefined = useMemo(() => {
    if (!rawCourseData) return null

    // Verifica se é um Course direto
    if ('codigo' in rawCourseData && typeof rawCourseData.codigo === 'string') {
      return rawCourseData as Course
    }

    // Verifica estruturas aninhadas
    const dataWithCurso = rawCourseData as { curso?: Course }
    if (dataWithCurso.curso?.codigo) return dataWithCurso.curso

    const dataWithItem = rawCourseData as { item?: Course }
    if (dataWithItem.item?.codigo) return dataWithItem.item

    const dataWithData = rawCourseData as { data?: Course }
    if (dataWithData.data?.codigo) return dataWithData.data

    return null
  }, [rawCourseData])

  const loadingCourse = isEdit ? (courseQuery?.isLoading ?? false) : false

  const modules = useMemo(
    () => (isEdit ? modulesQuery?.data || [] : []),
    [isEdit, modulesQuery?.data]
  )
  const { navigationItems } = useNavigation()
  // Dados auxiliares para selects
  const { data: categorias = [] } = useCategories()
  const { data: funcionariosResponse } = useFuncionarios()
  const funcionarios = funcionariosResponse?.items || []
  const { data: allCoursesResponse } = useCourses({})
  const allCourses: Course[] = allCoursesResponse?.items || []

  const [tab, setTab] = useState<string>(INFO_TAB.id)

  // Form state centralizado (pode ser distribuído em subcomponentes via props ou context)
  const [form, setForm] = useState<FormState>({
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

  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('')

  useEffect(() => {
    if (isEdit && course) {
      setForm(prevForm => {
        // Evita setState se nada mudou (previne loop de profundidade)
        const next: FormState = {
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
          k => next[k as keyof FormState] !== prevForm[k as keyof FormState]
        )
        return changed ? next : prevForm
      })
      if (course.departamento_codigo) {
        setDepartamentoSelecionado(dep => dep || course.departamento_codigo!)
      }
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

  const { gradientFrom, gradientTo, categoryName } = useCategoryColors(
    course?.categoria_id
  )

  // Se navegação trouxe state para abrir aba específica (ex: após criar ir para advanced)
  useEffect(() => {
    const state = location.state as LocationState | undefined
    if (state?.nextTab && state.nextTab !== tab) {
      setTab(state.nextTab)
      // Limpa para não reaplicar ao voltar
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate, tab])

  // Atualiza xp com base nos módulos se for edição
  useEffect(() => {
    if (isEdit && codigo && modules && Array.isArray(modules)) {
      const totalXp = modules.reduce((acc, m) => acc + (m.xp || 0), 0)
      setForm(prevForm =>
        prevForm.xp_oferecido !== totalXp
          ? { ...prevForm, xp_oferecido: totalXp }
          : prevForm
      )
    }
  }, [isEdit, codigo, modules])

  const handleSaveInfo = async (goToModules = false) => {
    try {
      if (!form.titulo?.trim() || !form.codigo?.trim()) return

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
        toast.success('Curso atualizado com sucesso!')
        if (goToModules) {
          setTab(MODULES_TAB.id)
        } else {
          navigate('/gerenciar/cursos')
        }
      } else {
        // Criar novo curso
        const createData = {
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
        }
        const result = await createCourse.mutateAsync(createData)
        toast.success('Curso criado com sucesso!')

        // Extrai o código do curso da resposta
        // A API retorna { curso: { codigo: "..." }, mensagem: "..." }
        const responseData = result as CreateCourseResponse
        const codigoCurso =
          responseData?.curso?.codigo || responseData?.codigo || form.codigo

        // Após criar, redireciona para edição do curso criado se quiser ir para módulos
        if (goToModules) {
          navigate(`/gerenciar/cursos/${codigoCurso}`, {
            state: { nextTab: MODULES_TAB.id },
          })
        } else {
          navigate('/gerenciar/cursos')
        }
      }
    } catch (error) {
      toast.error(
        isEdit
          ? 'Erro ao atualizar curso. Tente novamente.'
          : 'Erro ao criar curso. Verifique se o código já não existe.'
      )
      console.error('Erro ao salvar curso:', error)
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
                disabled={isEdit || isViewOnly}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
              <FormControl fullWidth disabled={isViewOnly}>
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
                disabled={isViewOnly}
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
                disabled={isViewOnly}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <FormControl fullWidth disabled={isViewOnly}>
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
              <FormControl fullWidth disabled={isViewOnly}>
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
              <FormControl fullWidth disabled={isViewOnly}>
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
                label='Duração Estimada (horas)'
                type='number'
                value={form.duracao_estimada}
                onChange={e =>
                  setForm({ ...form, duracao_estimada: Number(e.target.value) })
                }
                fullWidth
                disabled={isViewOnly}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <TextField
                label='XP Total'
                type='number'
                value={form.xp_oferecido}
                fullWidth
                disabled
                InputProps={{ readOnly: true }}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <FormControl fullWidth disabled={isViewOnly}>
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
              <FormControl fullWidth disabled={isViewOnly}>
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
          {!isViewOnly && (
            <Stack direction='row' gap={1} justifyContent='flex-end'>
              <Button
                variant='text'
                onClick={() => navigate('/gerenciar/cursos')}
              >
                Cancelar
              </Button>
              <Button
                variant='outlined'
                onClick={() => handleSaveInfo(false)}
                disabled={
                  createCourse.isPending ||
                  updateCourse?.isPending ||
                  !form.titulo ||
                  (!isEdit && !form.codigo)
                }
              >
                Salvar
              </Button>
              {isEdit ? (
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
              ) : (
                <Button
                  variant='contained'
                  onClick={() => handleSaveInfo(true)}
                  disabled={
                    createCourse.isPending ||
                    updateCourse?.isPending ||
                    !form.titulo ||
                    !form.codigo
                  }
                >
                  Criar e Adicionar Módulos
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      )
    }
    if (tab === MODULES_TAB.id)
      return (
        <CourseModulesSection
          cursoCodigo={codigo!}
          onTotalXpChange={total =>
            setForm(prevForm => ({ ...prevForm, xp_oferecido: total }))
          }
          isViewOnly={isViewOnly}
        />
      )
    if (tab === STUDENTS_TAB.id)
      return <CourseStudentsPanel cursoCodigo={codigo!} />
    if (tab === REVIEWS_TAB.id)
      return <CourseReviewsPanel cursoCodigo={codigo!} />
    return null
  }

  return (
    <DashboardLayout items={navigationItems}>
      <CourseContentHeader
        title={isEdit ? `${course?.titulo || form.titulo}` : 'Novo Curso'}
        gradientFrom={isEdit ? gradientFrom : '#6366f1'}
        gradientTo={isEdit ? gradientTo : '#8b5cf6'}
        categoryName={isEdit ? categoryName : undefined}
        showProgress={false}
        level={
          isEdit
            ? course?.nivel_dificuldade || form.nivel_dificuldade
            : undefined
        }
        prerequisites={
          isEdit ? course?.pre_requisitos || form.pre_requisitos : undefined
        }
        backPath='/gerenciar/cursos'
      />
      <Paper variant='outlined' sx={{ mt: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ px: { xs: 1.5, md: 3 } }}
        >
          <Tab label='Visão Geral' value={INFO_TAB.id} />
          {isEdit && <Tab label='Conteúdo' value={MODULES_TAB.id} />}
          {isEdit && <Tab label='Inscritos' value={STUDENTS_TAB.id} />}
          {isEdit && <Tab label='Correções' value={REVIEWS_TAB.id} />}
        </Tabs>
        <Divider />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {loadingCourse && isEdit ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderCurrent()
          )}
        </Box>
      </Paper>
    </DashboardLayout>
  )
}
