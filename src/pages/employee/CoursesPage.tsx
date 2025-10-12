import { Grid } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useMeuPerfil } from '@/api/users'
import { useNavigation } from '@/hooks/useNavigation'
import CodeIcon from '@mui/icons-material/Code'
import BrushIcon from '@mui/icons-material/Brush'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import CampaignIcon from '@mui/icons-material/Campaign'
import ComputerIcon from '@mui/icons-material/Computer'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'
import GavelIcon from '@mui/icons-material/Gavel'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import GroupIcon from '@mui/icons-material/Group'
import ConstructionIcon from '@mui/icons-material/Construction'
import {
  useCourseCatalog,
  useCategories,
  type Course as Curso,
  type CatalogFilters as FiltrosCatalogo,
} from '@/api/courses'
import { useCreateEnrollment, useUserEnrollments } from '@/api/progress'
import { useCategoryColors } from '@/hooks/useCategoryColors'
import CategoryChips from '@/components/employee/CategoryChips'
import CourseCard from '@/components/employee/CourseCard'
import CourseProgressCard from '@/components/employee/CourseProgressCard'
import CourseDialog from '@/components/employee/CourseDialog'
import FilterBar from '@/components/common/FilterBar'
import { Pagination, CircularProgress, Alert } from '@mui/material'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Psychology,
  School,
  Science,
  Security,
  Storefront,
  TrendingUp,
} from '@mui/icons-material'

export interface TileCategory {
  label: string
  gradientFrom: string
  gradientTo: string
  icon?: React.ReactNode
  count?: number
}

// Mapeamento de ícones baseado no código da categoria
const getCategoryIcon = (categoryCodigo: string) => {
  const codigo = categoryCodigo.toLowerCase()

  switch (codigo) {
    case 'compliance':
      return <GavelIcon sx={{ color: '#fff' }} />
    case 'desenvolvimento':
      return <CodeIcon sx={{ color: '#fff' }} />
    case 'design':
      return <BrushIcon sx={{ color: '#fff' }} />
    case 'financeiro':
      return <AccountBalanceIcon sx={{ color: '#fff' }} />
    case 'integração':
    case 'integracao':
      return <IntegrationInstructionsIcon sx={{ color: '#fff' }} />
    case 'logística':
    case 'logistica':
      return <LocalShippingIcon sx={{ color: '#fff' }} />
    case 'marketing':
      return <CampaignIcon sx={{ color: '#fff' }} />
    case 'segurança':
    case 'seguranca':
      return <Security sx={{ color: '#fff' }} />
    case 'vendas':
      return <Storefront sx={{ color: '#fff' }} />

    case 'ti':
    case 'tecnologia':
    case 'informatica':
      return <ComputerIcon sx={{ color: '#fff' }} />
    case 'rh':
    case 'recursos-humanos':
    case 'pessoas':
      return <GroupIcon sx={{ color: '#fff' }} />
    case 'operacional':
    case 'operacoes':
    case 'producao':
      return <ConstructionIcon sx={{ color: '#fff' }} />
    case 'qualidade':
    case 'sst':
    case 'meio-ambiente':
      return <HealthAndSafetyIcon sx={{ color: '#fff' }} />
    case 'liderança':
    case 'lideranca':
    case 'gestao':
      return <BusinessCenterIcon sx={{ color: '#fff' }} />
    case 'vendas-avancadas':
    case 'comercial':
      return <TrendingUp sx={{ color: '#fff' }} />
    case 'soft-skills':
    case 'comportamental':
      return <Psychology sx={{ color: '#fff' }} />
    case 'dados':
    case 'analytics':
    case 'ciencia':
      return <Science sx={{ color: '#fff' }} />

    // Default
    default:
      return <School sx={{ color: '#fff' }} />
  }
}

interface CourseItemProps {
  course: Curso
  isEnrolled: boolean
  userProgress?: {
    progresso_percentual: number
  }
  calculateTimeLeft: (
    courseDurationHours: number,
    progressPercent: number
  ) => string
  handleViewCourse: (course: Curso) => void
  handleGoToCourse: (courseCode: string) => void
}

function CourseItem({
  course,
  isEnrolled,
  userProgress,
  calculateTimeLeft,
  handleViewCourse,
  handleGoToCourse,
}: CourseItemProps) {
  const { gradientFrom, gradientTo, categoryName } = useCategoryColors(
    course.categoria_id
  )

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      {isEnrolled && userProgress ? (
        <CourseProgressCard
          title={course.titulo}
          description={course.descricao || ''}
          category={categoryName}
          progress={userProgress.progresso_percentual}
          timeLeft={calculateTimeLeft(
            course.duracao_estimada || 0,
            userProgress.progresso_percentual
          )}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          courseCode={course.codigo}
          onContinueLearning={handleGoToCourse}
        />
      ) : (
        <CourseCard
          title={course.titulo}
          category={categoryName}
          hours={`${course.duracao_estimada}h`}
          description={course.descricao}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          onViewCourse={() => handleViewCourse(course)}
          completionRate={course.taxa_conclusao}
          totalEnrollments={course.total_inscricoes}
          instructorName={course.instrutor_nome}
          xpOffered={course.xp_oferecido}
          level={course.nivel_dificuldade}
        />
      )}
    </Grid>
  )
}

export default function Courses() {
  const { data: user } = useMeuPerfil()
  const { navigationItems } = useNavigation()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 6

  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filters: FiltrosCatalogo = useMemo(() => {
    const f: FiltrosCatalogo = {}

    if (searchTerm.trim()) {
      f.q = searchTerm.trim()
    }

    if (selectedCategory && selectedCategory !== 'all') {
      f.categoria_id = selectedCategory
    }

    if (selectedLevel && selectedLevel !== 'all') {
      f.nivel = selectedLevel
    }

    if (selectedDuration && selectedDuration !== 'all') {
      switch (selectedDuration) {
        case 'lt5':
          f.duracaoMax = 5
          break
        case '5-10':
          break
        case '>10':
          break
      }
    }

    return f
  }, [searchTerm, selectedCategory, selectedLevel, selectedDuration])

  const { data: categories, error: categoriesError } = useCategories()
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourseCatalog(filters)
  const { mutate: createEnrollment, isPending: isEnrolling } =
    useCreateEnrollment()

  const { data: userEnrollmentsResponse } = useUserEnrollments(user?.id || '')
  const userEnrollments = userEnrollmentsResponse?.items || []

  // Função para converter hex para rgb (necessária para processedCategories)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const filteredCourses = useMemo(() => {
    if (!courses) return []

    let filtered = courses

    if (selectedDuration === '5-10') {
      filtered = filtered.filter(course => {
        const duration = course.duracao_estimada || 0
        return duration >= 5 && duration <= 10
      })
    } else if (selectedDuration === '>10') {
      filtered = filtered.filter(course => {
        const duration = course.duracao_estimada || 0
        return duration > 10
      })
    }

    return filtered
  }, [courses, selectedDuration])

  const processedCategories: TileCategory[] = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return []

    return categories.map(category => {
      const rgb = hexToRgb(category.cor_hex)
      const gradientColors = rgb
        ? {
            gradientFrom: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
            gradientTo: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
          }
        : {
            gradientFrom: '#6b7280',
            gradientTo: '#374151',
          }

      const courseCount =
        filteredCourses?.filter(
          course => course.categoria_id === category.codigo
        ).length || 0

      return {
        label: category.codigo,
        code: category.codigo,
        ...gradientColors,
        icon: getCategoryIcon(category.codigo),
        count: courseCount,
      }
    })
  }, [categories, filteredCourses])

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage)
  }, [filteredCourses, currentPage, coursesPerPage])

  const totalPages = Math.ceil((filteredCourses?.length || 0) / coursesPerPage)

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
    setSelectedLevel('all')
    setSelectedDuration('all')
    setCurrentPage(1)
  }

  // Função para selecionar categoria
  const handleCategorySelect = (categoryCode: string) => {
    setSelectedCategory(categoryCode === selectedCategory ? null : categoryCode)
    setCurrentPage(1) // Reset para primeira página
  }

  // Função para abrir o dialog do curso
  const handleViewCourse = (course: Curso) => {
    setSelectedCourse(course)
    setDialogOpen(true)
  }

  // Função para fechar o dialog
  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedCourse(null)
  }

  // Função para verificar se o usuário está inscrito no curso
  const isUserEnrolled = (courseCode: string) => {
    if (!userEnrollments || !Array.isArray(userEnrollments)) {
      return false
    }
    return userEnrollments.some(
      enrollment => enrollment.curso_id === courseCode
    )
  }

  // Função para obter dados de progresso do usuário para um curso
  const getUserCourseProgress = (courseCode: string) => {
    if (!userEnrollments || !Array.isArray(userEnrollments)) {
      return null
    }
    return userEnrollments.find(
      enrollment => enrollment.curso_id === courseCode
    )
  }

  const calculateTimeLeft = (
    courseDurationHours: number,
    progressPercent: number
  ) => {
    const remainingHours = (courseDurationHours * (100 - progressPercent)) / 100
    const hours = Math.floor(remainingHours)
    const minutes = Math.floor((remainingHours % 1) * 60)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return minutes > 0 ? `${minutes}m` : '< 1m'
  }

  const handleGoToCourse = (courseCode: string) => {
    const courseData = filteredCourses.find(
      course => course.codigo === courseCode
    )
    const enrollment = getUserCourseProgress(courseCode)

    navigate(`/cursos/${courseCode}`, {
      state: {
        courseData,
        enrollment,
        fromCatalog: true,
      },
    })
  }

  // Função para criar dados do curso para o dialog
  const createCourseDialogData = (course: Curso) => {
    const isEnrolled = isUserEnrolled(course.codigo)

    // Obter dados da categoria manualmente para o dialog
    const category = categories?.find(c => c.codigo === course.categoria_id)
    const categoryName = category?.nome || 'Sem categoria'

    let gradientFrom = '#6b7280'
    let gradientTo = '#374151'

    if (category?.cor_hex) {
      const rgb = hexToRgb(category.cor_hex)
      if (rgb) {
        gradientFrom = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
        gradientTo = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
      }
    }

    return {
      title: course.titulo,
      category: categoryName,
      description: course.descricao,
      rating: course.avaliacao_media || 0,
      reviews: course.total_avaliacoes || 0,
      students: course.total_inscritos || 0,
      level: course.nivel_dificuldade,
      hours: `${course.duracao_estimada}h`,
      gradientFrom,
      gradientTo,
      courseCode: course.codigo,
      xpOffered: course.xp_oferecido || 0,
      isActive: course.ativo,
      instructorName: course.instrutor_nome,
      prerequisites: course.pre_requisitos || [],
      completionRate: course.taxa_conclusao || 0,
      totalEnrollments: course.total_inscricoes || 0,
      modules: course.modulos,
      isEnrolled,
    }
  }

  const handleEnrollCourse = (courseCode: string) => {
    if (!user?.id) {
      console.error('Usuário não encontrado')
      return
    }

    createEnrollment(
      {
        funcionario_id: user.id,
        curso_id: courseCode,
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
          setSelectedCourse(null)
          toast.success('Inscrição realizada com sucesso!')
        },
        onError: (error: unknown) => {
          console.error('Erro ao se inscrever:', error)

          interface ErrorResponse {
            mensagem?: string
            pendentes?: Array<{ titulo: string }>
          }

          interface HttpError {
            response: {
              status: number
              data: ErrorResponse
            }
          }

          const isHttpError = (err: unknown): err is HttpError => {
            return typeof err === 'object' && err !== null && 'response' in err
          }

          if (!isHttpError(error)) {
            toast.error('Erro ao se inscrever no curso. Tente novamente.')
            return
          }

          if (error.response.status === 409) {
            const errorData = error.response.data
            toast.error(
              errorData?.mensagem || 'Você já está inscrito neste curso'
            )
          } else if (error.response.status === 422) {
            const errorData = error.response.data
            if (errorData?.pendentes && Array.isArray(errorData.pendentes)) {
              const coursesList = errorData.pendentes
                .map(course => `• ${course.titulo}`)
                .join('\n')
              toast.error(`Pré-requisitos não atendidos:\n${coursesList}`)
            } else {
              toast.error(errorData?.mensagem || 'Pré-requisitos não atendidos')
            }
          } else if (error.response.status === 404) {
            const errorData = error.response.data
            toast.error(errorData?.mensagem || 'Curso não encontrado')
          } else {
            const errorData = error.response.data
            toast.error(
              errorData?.mensagem ||
                'Erro ao se inscrever no curso. Tente novamente.'
            )
          }
        },
      }
    )
  }

  if (categoriesError || coursesError) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Erro ao carregar os dados:{' '}
          {categoriesError?.message ||
            coursesError?.message ||
            'Erro desconhecido'}
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant='h5' fontWeight={800}>
          Explorar cursos
        </Typography>
        <TextField
          size='small'
          placeholder='Buscar cursos...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Box>

      <FilterBar
        categories={categories || []}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        selectedDuration={selectedDuration}
        onCategoryChange={setSelectedCategory}
        onLevelChange={setSelectedLevel}
        onDurationChange={setSelectedDuration}
        onClearFilters={clearAllFilters}
      />

      <CategoryChips
        items={processedCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Carregamento dos cursos */}
      {coursesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {paginatedCourses.map(course => {
              const userProgress = getUserCourseProgress(course.codigo)
              const isEnrolled = isUserEnrolled(course.codigo)

              return (
                <CourseItem
                  key={course.codigo}
                  course={course}
                  isEnrolled={isEnrolled}
                  userProgress={
                    userProgress
                      ? {
                          progresso_percentual:
                            userProgress.progresso_percentual,
                        }
                      : undefined
                  }
                  calculateTimeLeft={calculateTimeLeft}
                  handleViewCourse={handleViewCourse}
                  handleGoToCourse={handleGoToCourse}
                />
              )
            })}
          </Grid>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                shape='rounded'
                color='primary'
              />
            </Box>
          )}

          {/* Mensagem quando não há cursos */}
          {filteredCourses && filteredCourses.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant='h6' color='text.secondary'>
                Nenhum curso encontrado
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tente ajustar os filtros ou termos de busca
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Dialog do Curso */}
      {selectedCourse && (
        <CourseDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          course={createCourseDialogData(selectedCourse)}
          onEnroll={handleEnrollCourse}
          onGoToCourse={handleGoToCourse}
          isEnrolling={isEnrolling}
        />
      )}
    </DashboardLayout>
  )
}
