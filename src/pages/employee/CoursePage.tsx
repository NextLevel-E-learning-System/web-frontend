import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Tabs,
  Tab,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  useCourse,
  useCourseModules,
  type Course,
  type Module,
} from '@/api/courses'
import { useUserEnrollments } from '@/api/progress'
import { useMeuPerfil } from '@/api/users'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigation } from '@/hooks/useNavigation'

interface TabDefinition {
  id: string
  label: string
}

const OVERVIEW_TAB: TabDefinition = { id: 'overview', label: 'Visão Geral' }
const MODULES_TAB: TabDefinition = { id: 'modules', label: 'Módulos' }
const PROGRESS_TAB: TabDefinition = { id: 'progress', label: 'Meu Progresso' }

export default function CoursePage() {
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

  const [tab, setTab] = useState<string>(OVERVIEW_TAB.id)

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

  const renderTabContent = () => {
    switch (tab) {
      case OVERVIEW_TAB.id:
        return (
          <Stack gap={3}>
            {/* Header do Curso */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                borderRadius: 2,
                color: 'white',
              }}
            >
              <Typography variant='h4' fontWeight={700} gutterBottom>
                {course.titulo}
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.9, mb: 2 }}>
                {course.descricao}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant='body2'>
                  <strong>Duração:</strong> {course.duracao_estimada}h
                </Typography>
                <Typography variant='body2'>
                  <strong>XP Oferecido:</strong> {course.xp_oferecido} XP
                </Typography>
                <Typography variant='body2'>
                  <strong>Nível:</strong> {course.nivel_dificuldade}
                </Typography>
                <Typography variant='body2'>
                  <strong>Instrutor:</strong> {course.instrutor_nome}
                </Typography>
              </Box>
            </Box>

            {/* Progresso */}
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Seu Progresso
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <LinearProgress
                  variant='determinate'
                  value={enrollment?.progresso_percentual || 0}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant='body2' fontWeight={600}>
                  {enrollment?.progresso_percentual || 0}%
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Status:{' '}
                {enrollment?.status === 'CONCLUIDO'
                  ? 'Concluído'
                  : 'Em Andamento'}
              </Typography>
            </Paper>

            {/* Informações do Curso */}
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                Sobre o Curso
              </Typography>
              <Typography variant='body1' color='text.secondary' paragraph>
                {course.descricao}
              </Typography>

              {course.pre_requisitos && course.pre_requisitos.length > 0 && (
                <>
                  <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                    Pré-requisitos:
                  </Typography>
                  <ul>
                    {course.pre_requisitos.map((prereq, index) => (
                      <li key={index}>
                        <Typography variant='body2'>{prereq}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Paper>
          </Stack>
        )

      case MODULES_TAB.id:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Módulos do Curso
            </Typography>
            {modules && modules.length > 0 ? (
              <Stack gap={2}>
                {modules
                  .sort((a, b) => a.ordem - b.ordem)
                  .map(module => (
                    <Paper
                      key={module.id}
                      variant='outlined'
                      sx={{ p: 2, cursor: 'pointer' }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Box
                          sx={{
                            minWidth: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {module.ordem}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant='subtitle1' fontWeight={600}>
                            {module.titulo}
                          </Typography>
                          {module.descricao && (
                            <Typography variant='body2' color='text.secondary'>
                              {module.descricao}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {module.obrigatorio && (
                            <Typography
                              variant='caption'
                              sx={{
                                bgcolor: 'warning.light',
                                color: 'warning.contrastText',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              Obrigatório
                            </Typography>
                          )}
                          {module.xp > 0 && (
                            <Typography
                              variant='caption'
                              sx={{
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              {module.xp} XP
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
              </Stack>
            ) : (
              <Typography color='text.secondary'>
                Este curso ainda não possui módulos cadastrados.
              </Typography>
            )}
          </Paper>
        )

      case PROGRESS_TAB.id:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Meu Progresso Detalhado
            </Typography>
            <Stack gap={3}>
              {/* Estatísticas */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                <Paper variant='outlined' sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant='h4'
                    color='primary.main'
                    fontWeight={700}
                  >
                    {enrollment?.progresso_percentual || 0}%
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Progresso Geral
                  </Typography>
                </Paper>
                <Paper variant='outlined' sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant='h4'
                    color='success.main'
                    fontWeight={700}
                  >
                    {modules?.length || 0}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total de Módulos
                  </Typography>
                </Paper>
                <Paper variant='outlined' sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant='h4'
                    color='warning.main'
                    fontWeight={700}
                  >
                    {course.xp_oferecido || 0}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    XP Total Disponível
                  </Typography>
                </Paper>
              </Box>

              {/* Informações da Inscrição */}
              <Paper variant='outlined' sx={{ p: 2 }}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                  Informações da Inscrição
                </Typography>
                <Stack gap={1}>
                  <Typography variant='body2'>
                    <strong>Data de Inscrição:</strong>{' '}
                    {enrollment?.data_inscricao
                      ? new Date(enrollment.data_inscricao).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'N/A'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Status:</strong>{' '}
                    {enrollment?.status === 'CONCLUIDO'
                      ? 'Concluído'
                      : 'Em Andamento'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Progresso:</strong>{' '}
                    {enrollment?.progresso_percentual || 0}%
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h5' fontWeight={600}>
              {course.titulo}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              variant='text'
              size='small'
              onClick={() => navigate('/cursos')}
            >
              Voltar para Cursos
            </Button>
          </Stack>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant='scrollable'
            allowScrollButtonsMobile
          >
            <Tab value={OVERVIEW_TAB.id} label={OVERVIEW_TAB.label} />
            <Tab value={MODULES_TAB.id} label={MODULES_TAB.label} />
            <Tab value={PROGRESS_TAB.id} label={PROGRESS_TAB.label} />
          </Tabs>
        </Paper>

        {/* Content */}
        <Box sx={{ minHeight: 400 }}>{renderTabContent()}</Box>
      </Box>
    </DashboardLayout>
  )
}
