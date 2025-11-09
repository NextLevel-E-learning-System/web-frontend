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

import type { Module } from '../../api/courses'
import { useModuleAssessment } from '@/api/assessments'
import {
  useStartModule,
  useCompleteModule,
  useEnrollmentModuleProgress,
} from '../../api/progress'
import AssessmentQuiz from './AssessmentQuiz'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'

interface CourseCurriculumProps {
  modules: Module[]
  enrollmentId: string
  onOpenModulo?: (moduloId: string) => void
}

// Componente para um módulo individual
function ModuleAccordion({
  module,
  expanded,
  onToggle,
  enrollmentId,
  moduleProgress,
  onOpenModulo,
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
  onOpenModulo?: (moduloId: string) => void
}) {
  const startModuleMutation = useStartModule()
  const completeModuleMutation = useCompleteModule()
  const [isStarting, setIsStarting] = useState(false)

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
  const isInProgress = moduleStatus === 'in_progress'
  const isCompleted = moduleStatus === 'completed'

  // Buscar avaliação do módulo se for tipo quiz
  const { data: moduleAssessment } = useModuleAssessment(
    module.id,
    module.tipo_conteudo === 'quiz' && (isInProgress || isCompleted)
  )

  const handleStartModule = async (e: React.MouseEvent) => {
    e.stopPropagation() // Previne expansão do accordion

    if (isInProgress || isCompleted) {
      // Se tem player disponível e módulo já está em progresso, abrir o player
      if (onOpenModulo) {
        onOpenModulo(module.id)
      } else {
        onToggle()
      }
      return
    }

    setIsStarting(true)
    try {
      await startModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
      // Após iniciar, abrir no player se disponível
      if (onOpenModulo) {
        onOpenModulo(module.id)
      } else if (!expanded) {
        onToggle()
      }
    } catch (error) {
      console.error('Erro ao iniciar módulo:', error)
    } finally {
      setIsStarting(false)
    }
  }

  // Handler para concluir módulo (usado pelo AssessmentQuiz quando usuário passa no quiz)
  const handleCompleteModule = async () => {
    if (isCompleted) return

    try {
      await completeModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
    } catch (error) {
      console.error('Erro ao concluir módulo:', error)
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
        borderRadius: 1,
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
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  moduleStatus === 'completed'
                    ? 'success.main'
                    : moduleStatus === 'in_progress'
                      ? 'primary.main'
                      : 'rgba(15,23,42,0.08)',
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {module.ordem}
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

        {/* Info: Clique em Iniciar/Continuar para abrir o módulo no player */}
        {(isInProgress || isCompleted) && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {module.tipo_conteudo === 'quiz' && moduleAssessment ? (
              <>
                Avaliação: {moduleAssessment.titulo}. Clique em "Continuar
                Módulo" para realizar.
              </>
            ) : module.tipo_conteudo === 'video' ? (
              'Clique em "Continuar Módulo" para assistir ao vídeo.'
            ) : module.tipo_conteudo === 'pdf' ? (
              'Clique em "Continuar Módulo" para visualizar o PDF.'
            ) : (
              'Clique em "Continuar Módulo" para prosseguir.'
            )}
          </Typography>
        )}

        {/* Quiz stats (se for quiz e tiver avaliação) */}
        {(isInProgress || isCompleted) &&
          module.tipo_conteudo === 'quiz' &&
          moduleAssessment && (
            <Box>
              <AssessmentQuiz
                avaliacao={moduleAssessment}
                onComplete={handleCompleteModule}
              />
            </Box>
          )}
      </AccordionDetails>
    </Accordion>
  )
}

export default function CourseCurriculum({
  modules,
  enrollmentId,
  onOpenModulo,
}: CourseCurriculumProps) {
  const [expandedModule, setExpandedModule] = useState<string | false>(false)

  // Buscar progresso dos módulos do banco

  return (
    <Stack spacing={2}>
      {modules.map(module => (
        <ModuleAccordion
          key={module.id}
          module={module}
          expanded={expandedModule === module.id}
          onToggle={() =>
            setExpandedModule(expandedModule === module.id ? false : module.id)
          }
          enrollmentId={enrollmentId}
          onOpenModulo={onOpenModulo}
        />
      ))}
    </Stack>
  )
}
