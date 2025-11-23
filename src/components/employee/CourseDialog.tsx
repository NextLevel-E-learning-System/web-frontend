import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import {
  Person,
  PeopleAlt,
  AccessTime,
  WorkspacePremium,
  PlaylistPlay
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import React from 'react'
import {
  useCourseModules,
  usePrerequisitesTitles,
  type Module
} from '@/api/courses'
import { Card, Paper } from '@mui/material'

export interface CourseData {
  title: string
  category: string
  description?: string
  rating?: number
  reviews?: number
  students?: number
  level?: string
  hours: string // e.g., "12h total"
  price?: string
  priceOriginal?: string
  badgeLabel?: string
  gradientFrom: string
  gradientTo: string
  courseCode?: string
  xpOffered?: number
  isActive?: boolean
  // Novas propriedades
  instructorName?: string | null
  prerequisites?: string[]
  completionRate?: number
  totalEnrollments?: number
  modules?: Module[]
  isEnrolled?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  course?: CourseData | null
  onEnroll?: (courseCode: string) => void
  onGoToCourse?: (courseCode: string) => void
  isEnrolling?: boolean
}

// Componente para visualizar um módulo (somente leitura)
function ModulePreview({ module }: { module: Module }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:before': { display: 'none' }
      }}
    >
      <Paper
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          transition: 'background-color 0.2s ease',
          '& .MuiAccordionSummary-content': {
            my: 1.5
          }
        }}
      >
        <Stack direction='row' spacing={2} alignItems='center' flex={1}>
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
              fontWeight: 700
            }}
          >
            {module.ordem}
          </Box>
          <Stack spacing={0.5} flex={1} minWidth={0}>
            <Typography variant='subtitle1' fontWeight={700}>
              {module.titulo}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={module.obrigatorio ? 'Obrigatório' : 'Opcional'}
                size='small'
                color={module.obrigatorio ? 'primary' : 'default'}
                variant='outlined'
              />
              {module.xp && (
                <Chip
                  label={`${module.xp} XP`}
                  size='small'
                  color='secondary'
                  variant='outlined'
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Card>
  )
}

export default function CourseDialog({
  open,
  onClose,
  course,
  onEnroll,
  onGoToCourse,
  isEnrolling
}: Props) {
  const [tab, setTab] = React.useState(0)

  const shouldFetchModules = !course?.modules && !!course?.courseCode
  const {
    data: fetchedModules,
    isLoading: modulesLoading,
    error: modulesError
  } = useCourseModules(shouldFetchModules ? course.courseCode! : '')

  // Usar módulos já disponíveis ou os buscados via API
  const modules = course?.modules || fetchedModules

  // Resolver títulos dos pré-requisitos
  const prerequisitesTitles = usePrerequisitesTitles(course?.prerequisites)

  if (!course) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <Box
        sx={{
          height: 150,
          background: `linear-gradient(135deg, ${course.gradientFrom}, ${course.gradientTo})`,
          px: 3,
          py: 2,
          color: '#fff'
        }}
      >
        <Chip
          label={course.category}
          sx={{
            bgcolor: 'rgba(255,255,255,0.25)',
            color: '#fff',
            fontWeight: 700
          }}
        />
        <Typography variant='h4' fontWeight={900} sx={{ mt: 1 }}>
          {course.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            mt: 1,
            flexWrap: 'wrap'
          }}
        >
          <Typography variant='body2'>
            <strong>Nível:</strong> {course.level}
          </Typography>
          {prerequisitesTitles && prerequisitesTitles.length > 0 && (
            <>
              <Typography variant='body2'>•</Typography>
              <Typography variant='body2'>
                <strong>Pré-requisitos:</strong>{' '}
                {prerequisitesTitles.join(', ')}
              </Typography>
            </>
          )}
        </Box>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
          <Tab label='Visão Geral' />
          <Tab label='Conteúdo' />
        </Tabs>
        <Divider />
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={800} gutterBottom>
              Sobre este Curso
            </Typography>
            <Typography color='text.secondary' sx={{ mb: 2 }}>
              {course.description}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2
              }}
            >
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant='subtitle2' fontWeight={800} gutterBottom>
                  Instrutor
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1
                  }}
                >
                  <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body1' fontWeight={600}>
                    {course.instructorName}
                  </Typography>
                </Box>

                <Typography variant='subtitle2' fontWeight={800} gutterBottom>
                  Estatísticas
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1
                  }}
                >
                  <PeopleAlt fontSize='small' color='primary' />
                  <Typography variant='body2'>
                    <strong>{course.totalEnrollments}</strong> inscrições
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize='small' color='success' />
                  <Typography variant='body2'>
                    <strong>{course.completionRate}%</strong> taxa de conclusão
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant='subtitle2' fontWeight={800} gutterBottom>
                  O curso inclui
                </Typography>
                {[
                  {
                    icon: <AccessTime fontSize='small' />,
                    text: `${course.hours} de conteúdo`
                  },
                  {
                    icon: <PlaylistPlay fontSize='small' />,
                    text: `${modules?.length || 0} módulos`
                  },
                  {
                    icon: <WorkspacePremium fontSize='small' />,
                    text: `${course.xpOffered || 0} XP`
                  },
                  {
                    icon: <BookmarkIcon fontSize='small' />,
                    text: 'Certificado de conclusão'
                  }
                ].map((i, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    {i.icon}
                    <Typography variant='body2'>{i.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'end',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              {course.isActive && (
                <>
                  {course.isEnrolled ? (
                    <Button
                      variant='contained'
                      sx={{ bgcolor: '#0f172a' }}
                      onClick={() =>
                        course.courseCode && onGoToCourse?.(course.courseCode)
                      }
                    >
                      Ir para o curso
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      sx={{ bgcolor: '#0f172a' }}
                      onClick={() =>
                        course.courseCode && onEnroll?.(course.courseCode)
                      }
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Inscrevendo...' : 'Inscrever-se'}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            {modulesLoading && shouldFetchModules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : modulesError ? (
              <Alert severity='error' sx={{ mb: 2 }}>
                Erro ao carregar os módulos: {modulesError.message}
              </Alert>
            ) : modules && modules.length > 0 ? (
              <Stack spacing={2.5}>
                {modules
                  .sort((a, b) => a.ordem - b.ordem)
                  .map(module => (
                    <ModulePreview key={module.id} module={module} />
                  ))}
              </Stack>
            ) : (
              <Typography color='text.secondary'>
                Este curso ainda não possui módulos cadastrados.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
