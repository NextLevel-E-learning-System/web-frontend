import {
  Box,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Divider,
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
import { useDashboard } from '@/api/users'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { useDashboardCompleto } from '@/api/users'
import { useUserEnrollments, getEnrollmentStats } from '@/api/progress'
import { useCategoryColors } from '@/hooks/useCategoryColors'
import { useCourseCatalog } from '@/api/courses'
import { useNavigate } from 'react-router-dom'
import CourseProgressCard from '@/components/employee/CourseProgressCard'
import AchievementCard from '@/components/employee/AchievementCard'
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
  const { isLoading, error } = useDashboardCompleto()
  const { navigationItems } = useDashboardLayout()
  const { data: dashboardResponse } = useDashboard()
  const perfil = dashboardResponse?.usuario
  const navigate = useNavigate()

  // Buscar inscrições do usuário
  const {
    data: userEnrollmentsResponse,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useUserEnrollments(perfil?.id || '')

  // Buscar catálogo de cursos para obter dados completos
  const { data: courses } = useCourseCatalog({})

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

  if (error || !perfil) {
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
              Seu Progresso de Aprendizagem
            </Typography>
            <Typography color='text.secondary'>
              Acompanhe sua jornada de estudos, conquistas e metas para se
              manter motivado.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant='subtitle1' fontWeight={800} sx={{ mb: 2 }}>
            Visão Geral
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<AccessTimeIcon sx={{ fontSize: 26 }} />}
                label='Total de Inscrições'
                value={
                  enrollmentsLoading ? '...' : `${enrollmentStats.total} cursos`
                }
                trendLabel='Todos os cursos inscritos'
                iconColor='#2563eb'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<CheckCircleIcon sx={{ fontSize: 26 }} />}
                label='Cursos Concluídos'
                value={
                  enrollmentsLoading
                    ? '...'
                    : enrollmentStats.concluidos.toString()
                }
                trendLabel='Cursos finalizados com sucesso'
                iconColor='#10b981'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<MenuBook sx={{ fontSize: 26 }} />}
                label='Cursos em Andamento'
                value={
                  enrollmentsLoading
                    ? '...'
                    : enrollmentStats.emAndamento.toString()
                }
                trendLabel='Cursos que você está estudando'
                iconColor='#8b5cf6'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                icon={<StarRate sx={{ fontSize: 26 }} />}
                label='XP Total'
                value={
                  enrollmentsLoading
                    ? '...'
                    : perfil?.xp_total?.toString() || '0'
                }
                trendLabel='Experiência acumulada'
                iconColor='#f59e0b'
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant='subtitle1' fontWeight={800} sx={{ mb: 2 }}>
            Progresso nos Cursos
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
              Suas Conquistas
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Madrugador'
                subtitle='Complete 5 aulas antes das 8h'
                gradientFrom='#fde68a'
                gradientTo='#fca5a5'
                icon={<EmojiEvents />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Coruja Noturna'
                subtitle='Estude por 2 horas após as 22h'
                gradientFrom='#a78bfa'
                gradientTo='#60a5fa'
                icon={<Nightlight />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Consistente'
                subtitle='Estude por 7 dias seguidos'
                gradientFrom='#6ee7b7'
                gradientTo='#93c5fd'
                icon={<Bolt />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Perfeccionista'
                subtitle='Tire 100% em 3 quizzes'
                gradientFrom='#fecaca'
                gradientTo='#fef3c7'
                icon={<Speed />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Recordista'
                subtitle='Conclua um curso em tempo recorde'
                gradientFrom='#fda4af'
                gradientTo='#fde68a'
                icon={<Bolt />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <AchievementCard
                title='Explorador'
                subtitle='Experimente cursos de 5 categorias'
                gradientFrom='#bae6fd'
                gradientTo='#a7f3d0'
                icon={<Explore />}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
