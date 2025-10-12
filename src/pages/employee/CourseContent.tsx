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
} from '@mui/material'
import {
  SchoolOutlined,
  AccessTimeOutlined,
  ChatBubbleOutlineOutlined,
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

  if (!isEnrolled) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Você não está inscrito neste curso. Redirecionando...
        </Alert>
      </DashboardLayout>
    )
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    setActiveTab(newValue)
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Container maxWidth='xl' sx={{ py: 3 }}>
        <CourseContentHeader
          title={completesCourse.titulo || 'Curso sem título'}
          subtitle={completesCourse.descricao || 'Sem descrição disponível'}
          rating={completesCourse.avaliacao_media || 0}
          ratingCount={completesCourse.total_avaliacoes || 0}
          lessons={modules?.length || 0}
          totalHours={completesCourse.duracao_estimada || 0}
          progressPercent={enrollment?.progresso_percentual || 0}
          gradientFrom={gradientFrom}
          gradientTo={gradientTo}
          categoryName={categoryName}
        />

        <Box sx={{ mt: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant='fullWidth'
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<SchoolOutlined />}
              iconPosition='start'
              label='Currículo'
            />
            <Tab
              icon={<AccessTimeOutlined />}
              iconPosition='start'
              label='Visão Geral'
            />
            <Tab
              icon={<ChatBubbleOutlineOutlined />}
              iconPosition='start'
              label='Discussões'
            />
          </Tabs>

          {activeTab === TAB_INDEX.curriculum && (
            <Box>
              <Typography variant='h6' gutterBottom>
                Módulos do Curso
              </Typography>
              {modules?.map((module, index) => (
                <Card key={module.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant='h6'>{module.titulo}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Módulo {index + 1} • {module.xp} XP
                        </Typography>
                      </Box>
                      <Chip
                        label={module.obrigatorio ? 'Obrigatório' : 'Opcional'}
                        color={module.obrigatorio ? 'primary' : 'default'}
                        size='small'
                      />
                    </Box>
                    {module.conteudo && (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        {module.conteudo}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === TAB_INDEX.overview && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Sobre este curso
                    </Typography>
                    <Typography variant='body1' paragraph>
                      {completesCourse.descricao}
                    </Typography>

                    <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                      O que você vai aprender
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary='Conceitos fundamentais do curso' />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary='Aplicação prática dos conhecimentos' />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary='Projetos práticos' />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Detalhes do curso
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === TAB_INDEX.discussions && (
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Discussões do curso
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Em breve: seção de discussões e fórum para interação entre
                  alunos.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </DashboardLayout>
  )
}
