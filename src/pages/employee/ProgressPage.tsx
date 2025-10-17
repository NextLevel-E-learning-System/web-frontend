import {
  Box,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Button,
} from '@mui/material'
import {
  MenuBook,
  StarRate,
  EmojiEvents,
  Nightlight,
  Bolt,
  Speed,
  Explore,
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { type DashboardAluno } from '@/api/users'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import { useUserEnrollments, getEnrollmentStats } from '@/api/progress'
import { useCategoryColors } from '@/hooks/useCategoryColors'
import { useCourseCatalog } from '@/api/courses'
import TimeRangeToggle, {
  type TimeRange,
} from '@/components/common/TimeRangeToggle'
import { useNavigate } from 'react-router-dom'
import CourseProgressCard from '@/components/employee/CourseProgressCard'
import AchievementCard from '@/components/employee/AchievementCard'
import GoalCard from '@/components/employee/GoalCard'
import MetricCard from '@/components/common/StatCard'

/* Lines 30-39 omitted */

interface CourseProgressItemProps {
  enrollment: {
    id: string
    progresso_percentual: number
    curso_id: string
    status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  }
  course: {
    codigo: string
    titulo: string
    descricao?: string
    categoria_id?: string
    duracao_estimada?: number
  }
  calculateTimeLeft: (
    progressPercent: number,
    estimatedHours?: number
  ) => string
  handleGoToCourse: (courseCode: string) => void
}

function CourseProgressItem({
  enrollment,
  course,
  calculateTimeLeft,
  handleGoToCourse,
}: CourseProgressItemProps) {
  const { gradientFrom, gradientTo, categoryName } = useCategoryColors(
    course.categoria_id
  )

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <CourseProgressCard
        title={course.titulo}
        description={course.descricao || ''}
        category={categoryName}
        progress={enrollment.progresso_percentual}
        timeLeft={calculateTimeLeft(
          enrollment.progresso_percentual,
          course.duracao_estimada || 2
        )}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        courseCode={course.codigo}
        status={enrollment.status}
        onContinueLearning={handleGoToCourse}
      />
    </Grid>
  )
}

export default function ProgressPage() {
  const { dashboard, isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()
  const { perfil } = useDashboardCompleto()
  const navigate = useNavigate()

  // Buscar inscrições do usuário
  const {
    data: userEnrollmentsResponse,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments(perfil?.id || '')

  // Buscar catálogo de cursos para obter dados completos
  const { data: courses } = useCourseCatalog({})

  const alunoData =
    dashboard?.tipo_dashboard === 'aluno' ? (dashboard as DashboardAluno) : null

  // Processar dados das inscrições
  const enrollments = userEnrollmentsResponse?.items || []
  const enrollmentStats = getEnrollmentStats(enrollments)

  // Função para calcular tempo restante estimado (assumindo 2h por curso como exemplo)
  const calculateTimeLeft = (progressPercent: number, estimatedHours = 2) => {
    const remainingHours = (estimatedHours * (100 - progressPercent)) / 100
    const hours = Math.floor(remainingHours)
    const minutes = Math.floor((remainingHours % 1) * 60)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return minutes > 0 ? `${minutes}m` : '< 1m'
  }

  const handleGoToCourse = (courseCode: string) => {
    const courseData = getCourseFromEnrollment({ curso_id: courseCode })
    const enrollment = enrollments.find(e => e.curso_id === courseCode)

    navigate(`/cursos/${courseCode}`, {
      state: {
        courseData,
        enrollment,
        fromProgress: true,
      },
    })
  }

  const getCourseFromEnrollment = (enrollment: { curso_id: string }) => {
    if (!courses || !Array.isArray(courses)) return null
    return courses.find(course => course.codigo === enrollment.curso_id)
  }

  if (isLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (error || !alunoData) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error'>Erro ao carregar dados. Tente novamente.</Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant='h5' fontWeight={800}>
              Your Learning Progress
            </Typography>
            <Typography color='text.secondary'>
              Track your learning journey, monitor achievements, and set goals
              to keep yourself motivated.
            </Typography>
          </Box>
          <TimeRangeToggle
            value={'all'}
            onChange={function (_value: TimeRange): void {
              throw new Error('Function not implemented.')
            }}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant='subtitle1' fontWeight={800} sx={{ mb: 2 }}>
            Activity Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<AccessTimeIcon sx={{ fontSize: 26 }} />}
                label='Total Enrollments'
                value={
                  enrollmentsLoading ? '...' : `${enrollmentStats.total} cursos`
                }
                trendLabel='All course enrollments'
                iconColor='#2563eb'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<CheckCircleIcon sx={{ fontSize: 26 }} />}
                label='Courses Completed'
                value={
                  enrollmentsLoading
                    ? '...'
                    : enrollmentStats.concluidos.toString()
                }
                trendLabel='Successfully completed courses'
                iconColor='#10b981'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<MenuBook sx={{ fontSize: 26 }} />}
                label='Courses in Progress'
                value={
                  enrollmentsLoading
                    ? '...'
                    : enrollmentStats.emAndamento.toString()
                }
                trendLabel='Currently enrolled courses'
                iconColor='#8b5cf6'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<StarRate sx={{ fontSize: 26 }} />}
                label='Cancelled Courses'
                value={
                  enrollmentsLoading
                    ? '...'
                    : enrollmentStats.cancelados.toString()
                }
                trendLabel='All time course enrollments'
                iconColor='#f59e0b'
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant='subtitle1' fontWeight={800} sx={{ mb: 2 }}>
            Course Progress
          </Typography>
          <Grid container spacing={2}>
            {enrollmentsLoading ? (
              <Grid size={{ xs: 12 }}>
                <Typography>Carregando...</Typography>
              </Grid>
            ) : enrollmentsError ? (
              <Grid size={{ xs: 12 }}>
                <Typography color='error'>
                  Erro ao carregar cursos: {enrollmentsError.message}
                </Typography>
              </Grid>
            ) : enrollments.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography color='text.secondary'>
                  Nenhum curso em andamento
                </Typography>
              </Grid>
            ) : (
              enrollments.map(enrollment => {
                const course = getCourseFromEnrollment(enrollment)
                if (!course) return null

                return (
                  <CourseProgressItem
                    key={enrollment.id}
                    enrollment={enrollment}
                    course={course}
                    calculateTimeLeft={calculateTimeLeft}
                    handleGoToCourse={handleGoToCourse}
                  />
                )
              })
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant='subtitle1' fontWeight={800}>
              Your Achievements
            </Typography>
            <Button variant='text' size='small'>
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Early Bird'
                subtitle='Complete 5 lessons before 8am'
                gradientFrom='#fde68a'
                gradientTo='#fca5a5'
                icon={<EmojiEvents />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Night Owl'
                subtitle='Study for 2 hours after 10pm'
                gradientFrom='#a78bfa'
                gradientTo='#60a5fa'
                icon={<Nightlight />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Consistent'
                subtitle='Study for 7 days in a row'
                gradientFrom='#6ee7b7'
                gradientTo='#93c5fd'
                icon={<Bolt />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Perfectionist'
                subtitle='Score 100% on 3 quizzes'
                gradientFrom='#fecaca'
                gradientTo='#fef3c7'
                icon={<Speed />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Speed Demon'
                subtitle='Complete a course in record time'
                gradientFrom='#fda4af'
                gradientTo='#fde68a'
                icon={<Bolt />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Explorer'
                subtitle='Try courses from 5 categories'
                gradientFrom='#bae6fd'
                gradientTo='#a7f3d0'
                icon={<Explore />}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant='subtitle1' fontWeight={800}>
              Your Learning Goals
            </Typography>
            <Button variant='contained' size='small'>
              Set New Goal
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <GoalCard
                title='Complete React Course'
                subtitle='Finish all lessons by August 25'
                progress={75}
                daysLeft={10}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GoalCard
                title='Study 2 hours daily'
                subtitle='Maintain consistent study schedule'
                progress={40}
                daysLeft={18}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <GoalCard
                title='Complete 5 Courses'
                subtitle='By the end of this quarter'
                progress={40}
                daysLeft={45}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
