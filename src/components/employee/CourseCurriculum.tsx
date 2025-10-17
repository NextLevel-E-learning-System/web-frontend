import { useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { PlayCircleFilled, PictureAsPdfRounded } from '@mui/icons-material'
import type { Module } from '../../api/courses'
import { useModuleMaterials } from '../../api/courses'
import {
  useStartModule,
  useCompleteModule,
  useEnrollmentModuleProgress,
} from '../../api/progress'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'

interface CourseCurriculumProps {
  modules: Module[]
  enrollmentId: string
}

const statusIconMap: Record<ModuleItemStatus, typeof CheckCircleRoundedIcon> = {
  completed: CheckCircleRoundedIcon,
  in_progress: PlayCircleFilled,
  locked: LockRoundedIcon,
}

const statusColorMap: Record<ModuleItemStatus, string> = {
  completed: 'success.main',
  in_progress: 'primary.main',
  locked: 'text.disabled',
}

// Componente para um módulo individual
function ModuleAccordion({
  module,
  expanded,
  onToggle,
  enrollmentId,
  moduleProgress,
}: {
  module: Module
  expanded: boolean
  onToggle: () => void
  enrollmentId: string
  moduleProgress?: Array<{
    modulo_id: string
    data_inicio?: string
    data_conclusao?: string
  }>
}) {
  const startModuleMutation = useStartModule()
  const completeModuleMutation = useCompleteModule()
  const [isStarting, setIsStarting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Buscar materiais APENAS se tipo_conteudo for video ou document E se o módulo estiver expandido
  const shouldFetchMaterials =
    (module.tipo_conteudo === 'video' || module.tipo_conteudo === 'pdf') &&
    expanded

  const { data: materialsData, isLoading: materialsLoading } =
    useModuleMaterials(module.id)

  // Só usar os materiais se deveríamos buscá-los
  const materials = shouldFetchMaterials ? materialsData || [] : []

  // Buscar progresso deste módulo no banco
  const moduleProgressData = moduleProgress?.find(
    p => p.modulo_id === module.id
  )

  // Determinar status do módulo baseado no progresso
  const getModuleStatus = (): ModuleItemStatus => {
    if (moduleProgressData?.data_conclusao) return 'completed'
    if (moduleProgressData?.data_inicio) return 'in_progress'
    return 'locked'
  }

  const moduleStatus = getModuleStatus()
  const StatusIcon = statusIconMap[moduleStatus]
  const isInProgress = moduleStatus === 'in_progress'
  const isCompleted = moduleStatus === 'completed'

  // Handler para iniciar módulo
  const handleStartModule = async (e: React.MouseEvent) => {
    e.stopPropagation() // Previne expansão do accordion

    if (isInProgress || isCompleted) {
      // Se já está iniciado ou concluído, apenas expande o accordion
      onToggle()
      return
    }

    setIsStarting(true)
    try {
      await startModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
      // Após iniciar com sucesso, expande o accordion
      if (!expanded) {
        onToggle()
      }
    } catch (error) {
      console.error('Erro ao iniciar módulo:', error)
    } finally {
      setIsStarting(false)
    }
  }

  // Handler para concluir módulo
  const handleCompleteModule = async () => {
    if (isCompleted) return

    setIsCompleting(true)
    try {
      await completeModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
    } catch (error) {
      console.error('Erro ao concluir módulo:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const getActionLabel = () => {
    if (isStarting) return 'Iniciando...'
    if (isCompleted) return 'Concluído'
    if (isInProgress) return 'Continuar'
    return 'Iniciar'
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      square
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          bgcolor: expanded ? 'rgba(59,130,246,0.07)' : 'background.paper',
          transition: 'background-color 0.2s ease',
          '& .MuiAccordionSummary-content': {
            my: 1.5,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flex={1}
          sx={{ pr: 2 }}
        >
          <Stack direction='row' spacing={2} alignItems='center' flex={1}>
            {/* Status Icon */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  moduleStatus === 'completed'
                    ? 'rgba(34,197,94,0.16)'
                    : moduleStatus === 'in_progress'
                      ? 'rgba(59,130,246,0.16)'
                      : 'rgba(15,23,42,0.08)',
                color: statusColorMap[moduleStatus],
              }}
            >
              <StatusIcon fontSize='small' />
            </Box>

            {/* Module Info */}
            <Stack spacing={0.5} flex={1} minWidth={0}>
              <Typography variant='subtitle1' fontWeight={700}>
                {module.titulo}
              </Typography>
              {module.conteudo && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {module.conteudo}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={module.obrigatorio ? 'Obrigatório' : 'Opcional'}
                  size='small'
                  color={module.obrigatorio ? 'primary' : 'default'}
                  variant='outlined'
                />
                <Chip
                  label={`${module.xp} XP`}
                  size='small'
                  color='secondary'
                  variant='outlined'
                />
              </Box>
            </Stack>
          </Stack>

          {/* Action Button */}
          <Button
            size='small'
            variant={isCompleted || isInProgress ? 'outlined' : 'contained'}
            color={isCompleted ? 'success' : 'primary'}
            disabled={isStarting || isCompleted}
            onClick={handleStartModule}
            startIcon={
              isStarting ? (
                <CircularProgress size={16} color='inherit' />
              ) : isCompleted ? (
                <CheckCircleRoundedIcon />
              ) : null
            }
            sx={{
              minWidth: 120,
              whiteSpace: 'nowrap',
            }}
          >
            {getActionLabel()}
          </Button>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
        <Divider sx={{ mb: 3 }} />

        {/* Aviso de módulo bloqueado */}
        {!isInProgress && !isCompleted && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <LockRoundedIcon sx={{ color: 'warning.main', fontSize: 32 }} />
            <Stack>
              <Typography variant='subtitle2' fontWeight={600}>
                Módulo Bloqueado
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Clique em "Iniciar" para desbloquear e acessar o conteúdo deste
                módulo.
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Conteúdo do módulo - só exibir se iniciado ou concluído */}
        {(isInProgress || isCompleted) && (
          <Stack spacing={2}>
            {/* Materiais de Vídeo */}
            {module.tipo_conteudo === 'video' && (
              <Box>
                {!materialsLoading && materials.length > 0 && (
                  <Stack spacing={1.5}>
                    {materials.map(material => (
                      <Box
                        key={material.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(59,130,246,0.12)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <PlayCircleFilled
                          sx={{ color: 'primary.main', fontSize: 32 }}
                        />
                        <Stack flex={1}>
                          <Typography variant='body1' fontWeight={600}>
                            {material.nome_arquivo}
                          </Typography>
                          {material.tamanho && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {(Number(material.tamanho) / 1024 / 1024).toFixed(
                                2
                              )}{' '}
                              MB
                            </Typography>
                          )}
                        </Stack>
                        <Button size='small' variant='outlined'>
                          Assistir
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Materiais de Documento */}
            {module.tipo_conteudo === 'pdf' && (
              <Box>
                {!materialsLoading && materials.length > 0 && (
                  <Stack spacing={1.5}>
                    {materials.map(material => (
                      <Box
                        key={material.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(16,185,129,0.12)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {material.tipo_arquivo?.includes('pdf') ? (
                          <PictureAsPdfRounded
                            sx={{ color: '#047857', fontSize: 32 }}
                          />
                        ) : (
                          <DescriptionRoundedIcon
                            sx={{ color: '#047857', fontSize: 32 }}
                          />
                        )}
                        <Stack flex={1}>
                          <Typography variant='body1' fontWeight={600}>
                            {material.nome_arquivo}
                          </Typography>
                          {material.tamanho && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {(Number(material.tamanho) / 1024 / 1024).toFixed(
                                2
                              )}{' '}
                              MB
                            </Typography>
                          )}
                        </Stack>
                        <Button size='small' variant='outlined' color='success'>
                          Abrir
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Quiz */}
            {module.tipo_conteudo === 'quiz' && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(234,179,8,0.08)',
                  textAlign: 'center',
                }}
              >
                <Typography variant='body2' color='text.secondary'>
                  Quiz será carregado aqui
                </Typography>
              </Box>
            )}

            {/* Botão de Concluir Módulo */}
            {isInProgress && !isCompleted && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant='contained'
                  color='success'
                  size='large'
                  disabled={isCompleting}
                  onClick={handleCompleteModule}
                  startIcon={
                    isCompleting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <CheckCircleRoundedIcon />
                    )
                  }
                  sx={{ minWidth: 200 }}
                >
                  {isCompleting ? 'Concluindo...' : 'Concluir Módulo'}
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default function CourseCurriculum({
  modules,
  enrollmentId,
}: CourseCurriculumProps) {
  const [expandedModule, setExpandedModule] = useState<string | false>(false)

  // Buscar progresso dos módulos do banco
  const { data: moduleProgress = [], isLoading: progressLoading } =
    useEnrollmentModuleProgress(enrollmentId)

  if (progressLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={2.5}>
      {modules.map(module => (
        <ModuleAccordion
          key={module.id}
          module={module}
          expanded={expandedModule === module.id}
          onToggle={() =>
            setExpandedModule(expandedModule === module.id ? false : module.id)
          }
          enrollmentId={enrollmentId}
          moduleProgress={moduleProgress}
        />
      ))}
    </Stack>
  )
}
