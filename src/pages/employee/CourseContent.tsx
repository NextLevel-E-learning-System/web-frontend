import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Rating,
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
import { useCourse, useCourseModules } from '../../api/courses'
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
  const { data: user } = useMeuPerfil()
  const { navigationItems } = useNavigation()

  // Buscar dados do curso
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(codigo || '')
  const { data: modules, isLoading: modulesLoading } = useCourseModules(
    codigo || ''
  )
  const { data: userEnrollments } = useUserEnrollments(user?.id || '')

  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEX.curriculum)

  // Verificar se o usuário está inscrito no curso
  const enrollment = userEnrollments?.find(e => e.curso_id === codigo)
  const isEnrolled = !!enrollment

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

  if (courseError || !course) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Erro ao carregar o curso:{' '}
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
          title={course.titulo}
          subtitle={course.descricao || ''}
          rating={4.5}
          ratingCount={150}
          lessons={modules?.length || 0}
          totalHours={8}
          progressPercent={enrollment?.progresso_percentual || 0}
          gradientFrom='#4f46e5'
          gradientTo='#0ea5e9'
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
                      {course.descricao}
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
                        <Chip label='Geral' size='small' color='primary' />
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Nível
                        </Typography>
                        <Typography variant='body1'>Iniciante</Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Avaliação
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Rating
                            value={4.5}
                            precision={0.1}
                            readOnly
                            size='small'
                          />
                          <Typography variant='body2'>4.5 (150)</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Idioma
                        </Typography>
                        <Typography variant='body1'>Português</Typography>
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
