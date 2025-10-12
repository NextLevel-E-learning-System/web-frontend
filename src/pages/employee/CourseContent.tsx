import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
  Stack,
  Avatar,
} from '@mui/material'
import {
  SchoolOutlined,
  AccessTimeOutlined,
  ChatBubbleOutlineOutlined,
  ArrowBackIosNewRounded,
  CheckRounded,
  ForumRounded,
} from '@mui/icons-material'
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
import { useMeuPerfil } from '../../api/users'
import { Link as RouterLink } from 'react-router-dom'
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
  const { data: user } = useMeuPerfil()
  const { navigationItems } = useNavigation()

  // Dados passados via state (quando vem da ProgressPage)
  const passedCourseData = location.state?.courseData
  const passedEnrollment = location.state?.enrollment

  // Buscar dados do curso
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(codigo || '')
  const { data: modules, isLoading: modulesLoading } = useCourseModules(
    codigo || ''
  )
  const { data: userEnrollmentsResponse } = useUserEnrollments(user?.id || '')

  // Buscar todos os cursos como backup para garantir dados completos
  const { data: allCourses } = useCourseCatalog({})

  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEX.curriculum)

  // Verificar se o usuário está inscrito no curso
  const userEnrollments = userEnrollmentsResponse?.items || []
  const enrollment =
    passedEnrollment || userEnrollments.find(e => e.curso_id === codigo)
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
        title={completesCourse.titulo || 'Curso sem título'}
        lessons={modules?.length || 0}
        totalHours={completesCourse.duracao_estimada || 0}
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
          {activeTab === TAB_INDEX.curriculum && (
            <CourseCurriculum modules={modules} />
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
                  {completesCourse.descricao}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Typography variant='h6' fontWeight={700}>
                  O que você vai aprender
                </Typography>
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
                      Categoria
                    </Typography>
                    <Chip
                      label={categoryName || 'Sem categoria'}
                      size='small'
                      sx={{
                        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                        color: '#fff',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Nível
                    </Typography>
                    <Typography variant='body1'>
                      {completesCourse.nivel_dificuldade || 'Não informado'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

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
                    IS
                  </Avatar>
                  <Stack spacing={0.5} sx={{ maxWidth: 720 }}>
                    <Typography variant='subtitle1' fontWeight={700}>
                      {completesCourse.instructor.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {completesCourse.instructor.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.5 }}
                    >
                      {completesCourse.instructor.bio}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Box>
      </Paper>
    </DashboardLayout>
  )
}
