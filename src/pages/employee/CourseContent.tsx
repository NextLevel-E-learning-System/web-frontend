import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  Avatar,
} from '@mui/material'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CourseContentHeader from '../../components/employee/CourseContentHeader'
import { useNavigation } from '../../hooks/useNavigation'
import { useCategoryColors } from '../../hooks/useCategoryColors'
import {
  useCourse,
  useCourseModules,
  useCourseCatalog,
} from '../../api/courses'
import { useUserEnrollments } from '../../api/progress'
import { useDashboardCompleto } from '../../api/users'
import CourseCurriculum from '@/components/employee/CourseCurriculum'

const TAB_INDEX = {
  curriculum: 0,
  overview: 1,
  discussions: 2,
} as const

type TabIndex = (typeof TAB_INDEX)[keyof typeof TAB_INDEX]

export default function CourseContent() {
  const { codigo } = useParams<{ codigo: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil } = useDashboardCompleto()
  const { navigationItems } = useNavigation()

  // Dados passados via state (quando vem da ProgressPage)
  const passedCourseData = location.state?.courseData

  // Buscar dados do curso
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(codigo || '')
  const { data: modules, isLoading: modulesLoading } = useCourseModules(
    codigo || ''
  )

  // SEMPRE buscar dados atualizados das inscrições (não usar passedEnrollment)
  const { data: userEnrollmentsResponse } = useUserEnrollments(
    perfil?.id || '',
    {
      refetchOnMount: 'always', // Força refetch ao montar
    }
  )

  // Buscar todos os cursos como backup para garantir dados completos
  const { data: allCourses } = useCourseCatalog({})

  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEX.curriculum)

  // Verificar se o usuário está inscrito no curso - SEMPRE usar dados do cache
  const userEnrollments = userEnrollmentsResponse?.items || []
  const enrollment = userEnrollments.find(e => e.curso_id === codigo)
  const isEnrolled = !!enrollment

  // Usar dados passados via state quando disponíveis, senão buscar no backend
  const completesCourse =
    passedCourseData || course || allCourses?.find(c => c.codigo === codigo)

  // Usar hook para obter cores e nome da categoria
  const { gradientFrom, gradientTo, categoryName } = useCategoryColors(
    completesCourse?.categoria_id
  )

  // Se não estiver inscrito, redirecionar para a página de cursos
  useEffect(() => {
    if (!courseLoading && !isEnrolled && codigo) {
      navigate('/cursos')
    }
  }, [courseLoading, isEnrolled, codigo, navigate])

  if (courseLoading || modulesLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (courseError || !completesCourse) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {courseError?.message || 'Curso não encontrado'}
        </Alert>
      </DashboardLayout>
    )
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    setActiveTab(newValue)
  }

  return (
    <DashboardLayout items={navigationItems}>
      <CourseContentHeader
        title={completesCourse.titulo}
        progressPercent={enrollment?.progresso_percentual || 0}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        categoryName={categoryName}
      />

      <Paper variant='outlined' sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ px: { xs: 1.5, md: 3 }, pt: 1.5 }}
        >
          <Tab label='Conteúdo' value={TAB_INDEX.curriculum} />
          <Tab label='Visão Geral' value={TAB_INDEX.overview} />
        </Tabs>
        <Divider />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === TAB_INDEX.curriculum && enrollment && (
            <CourseCurriculum
              modules={modules || []}
              enrollmentId={enrollment.id}
            />
          )}

          {activeTab === TAB_INDEX.overview && (
            <Stack spacing={{ xs: 3, md: 4 }}>
              <Stack spacing={1.5}>
                <Typography variant='h6' fontWeight={700}>
                  Sobre este curso
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ maxWidth: 860 }}
                >
                  {completesCourse.descricao || 'Descrição não disponível'}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Typography variant='h6' fontWeight={700}>
                  Informações do curso
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(3, minmax(0, 1fr))',
                    },
                    gap: { xs: 2, md: 2.5 },
                  }}
                >
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Categoria
                    </Typography>
                    <Chip
                      label={categoryName || 'Sem categoria'}
                      size='small'
                      sx={{
                        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                        color: '#fff',
                        mt: 0.5,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Nível
                    </Typography>
                    <Typography variant='body1' sx={{ mt: 0.5 }}>
                      {completesCourse.nivel_dificuldade || 'Não informado'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      XP Oferecido
                    </Typography>
                    <Typography variant='body1' sx={{ mt: 0.5 }}>
                      {completesCourse.xp_oferecido || 0} XP
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: { xs: 2, md: 2.5 },
                  }}
                >
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Total de Módulos
                    </Typography>
                    <Typography variant='body1' sx={{ mt: 0.5 }}>
                      {modules?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Duração Estimada
                    </Typography>
                    <Typography variant='body1' sx={{ mt: 0.5 }}>
                      {completesCourse.duracao_estimada || 0} horas
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {completesCourse.instrutor_nome && (
                <Stack spacing={2}>
                  <Typography variant='h6' fontWeight={700}>
                    Sobre o instrutor
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2.5}
                    alignItems={{ sm: 'center' }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 64,
                        height: 64,
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {completesCourse.instrutor_nome
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Avatar>
                    <Stack spacing={0.5} sx={{ maxWidth: 720 }}>
                      <Typography variant='subtitle1' fontWeight={700}>
                        {completesCourse.instrutor_nome}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Instrutor do curso
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </Box>
      </Paper>
    </DashboardLayout>
  )
}
