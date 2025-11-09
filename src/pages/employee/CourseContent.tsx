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
  Button,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import DashboardLayout from '../../components/layout/DashboardLayout'
import CourseContentHeader from '../../components/employee/CourseContentHeader'
import { useNavigation } from '../../hooks/useNavigation'
import { useCategoryColors } from '../../hooks/useCategoryColors'
import { useCourseCatalog, useModulosCompletos } from '../../api/courses'
import { useUserEnrollments, useModulosComProgresso } from '../../api/progress'
import { useDashboardCompleto } from '../../api/users'
import CourseCurriculum from '@/components/employee/CourseCurriculum'
import CertificateView from '@/components/employee/CertificateView'
import ModuloPlayer from '@/components/learning/ModuloPlayer'

const TAB_INDEX = {
  curriculum: 0,
  overview: 1,
  certificate: 2,
  discussions: 3,
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

  // Estado para controlar qual módulo está sendo reproduzido
  const [moduloEmReproducao, setModuloEmReproducao] = useState<string | null>(
    null
  )

  // Buscar dados do curso do cache (CoursesPage já carregou todos)
  const { data: allCourses } = useCourseCatalog({})

  // Buscar módulos completos (ÚNICA requisição de módulos necessária!)
  const { data: modulosCompletos = [], isLoading: modulosLoading } =
    useModulosCompletos(codigo || '')

  // SEMPRE buscar dados atualizados das inscrições (não usar passedEnrollment)
  const { data: userEnrollmentsResponse } = useUserEnrollments(
    perfil?.id || '',
    {
      refetchOnMount: 'always', // Força refetch ao montar
    }
  )
  // Buscar progresso dos módulos
  const enrollment = userEnrollmentsResponse?.items.find(
    e => e.curso_id === codigo
  )
  const { data: modulosProgresso = [] } = useModulosComProgresso(
    enrollment?.id || ''
  )

  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEX.curriculum)

  // Verificar se o usuário está inscrito no curso - SEMPRE usar dados do cache
  const isEnrolled = !!enrollment
  const isCourseCompleted =
    enrollment?.status === 'CONCLUIDO' &&
    enrollment?.progresso_percentual === 100

  // Usar dados passados via state quando disponíveis, senão buscar no cache
  const completesCourse =
    passedCourseData || allCourses?.find(c => c.codigo === codigo)

  // Converter módulos completos para formato simples (para CourseCurriculum)
  const modules = modulosCompletos.map(m => ({
    id: m.modulo_id,
    titulo: m.titulo,
    conteudo: m.conteudo || '',
    ordem: m.ordem,
    obrigatorio: m.obrigatorio,
    xp: m.xp_modulo,
    xp_modulo: m.xp_modulo,
    tipo_conteudo: m.tipo_conteudo || 'text',
    criado_em: m.criado_em,
    atualizado_em: m.atualizado_em,
  }))

  // Usar hook para obter cores e nome da categoria
  const { gradientFrom, gradientTo, categoryName } = useCategoryColors(
    completesCourse?.categoria_id
  )

  // Se não estiver inscrito, redirecionar para a página de cursos
  useEffect(() => {
    if (!isEnrolled && codigo) {
      navigate('/cursos')
    }
  }, [isEnrolled, codigo, navigate])

  if (modulosLoading) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    )
  }

  if (!completesCourse) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Curso não encontrado
        </Alert>
      </DashboardLayout>
    )
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    setActiveTab(newValue)
  }

  // Handlers para o módulo player
  const handleOpenModulo = (moduloId: string) => {
    setModuloEmReproducao(moduloId)
  }

  const handleCloseModulo = () => {
    setModuloEmReproducao(null)
  }

  const handleModuloComplete = () => {
    // Buscar próximo módulo
    const currentIndex = modulosProgresso.findIndex(
      m => m.modulo_id === moduloEmReproducao
    )

    if (currentIndex >= 0 && currentIndex < modulosProgresso.length - 1) {
      // Avançar para o próximo módulo
      setModuloEmReproducao(modulosProgresso[currentIndex + 1].modulo_id)
    } else {
      // Último módulo concluído, fechar player
      setModuloEmReproducao(null)
    }
  }

  // Dados do módulo em reprodução
  const moduloAtual = modulosCompletos.find(
    m => m.modulo_id === moduloEmReproducao
  )
  const moduloProgressoAtual = modulosProgresso.find(
    m => m.modulo_id === moduloEmReproducao
  )

  return (
    <DashboardLayout items={navigationItems}>
      {/* Se tem módulo em reprodução, mostrar apenas o player */}
      {moduloEmReproducao && moduloAtual && moduloProgressoAtual ? (
        <ModuloPlayer
          modulo={moduloAtual}
          inscricaoId={enrollment?.id || ''}
          liberado={moduloProgressoAtual.liberado}
          concluido={moduloProgressoAtual.concluido}
          onComplete={handleModuloComplete}
          onBack={handleCloseModulo}
        />
      ) : (
        <>
          <CourseContentHeader
            title={completesCourse.titulo}
            progressPercent={enrollment?.progresso_percentual || 0}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
            categoryName={categoryName}
            level={completesCourse.nivel_dificuldade}
            prerequisites={completesCourse.pre_requisitos}
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
              {isCourseCompleted && (
                <Tab label='Certificado' value={TAB_INDEX.certificate} />
              )}
            </Tabs>
            <Divider />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {activeTab === TAB_INDEX.curriculum && enrollment && (
                <CourseCurriculum
                  modules={modules || []}
                  enrollmentId={enrollment.id}
                  onOpenModulo={handleOpenModulo}
                />
              )}

              {activeTab === TAB_INDEX.certificate && isCourseCompleted && (
                <CertificateView
                  enrollmentId={enrollment.id}
                  cursoTitulo={completesCourse.titulo}
                  dataConclusao={enrollment.data_conclusao}
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
        </>
      )}
    </DashboardLayout>
  )
}
