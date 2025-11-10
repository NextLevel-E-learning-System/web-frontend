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
import { useStartModule, useModulosComProgresso } from '../../api/progress'
import { useModuloCompleto } from '../../api/courses'
import ModuloPlayer from '../learning/ModuloPlayer'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'

interface CourseCurriculumProps {
  modules: Module[]
  enrollmentId: string
}

// Componente para um módulo individual
function ModuleAccordion({
  module,
  enrollmentId,
  moduleProgress,
  expanded,
  onToggle,
}: {
  module: Module
  expanded: boolean
  onToggle: () => void
  enrollmentId: string
  moduleProgress?: Array<{
    modulo_id: string
    data_inicio?: string
    data_conclusao?: string
    tempo_gasto?: number
    liberado: boolean
    concluido: boolean
  }>
}) {
  const startModuleMutation = useStartModule()
  const [isStarting, setIsStarting] = useState(false)

  // Buscar dados completos do módulo quando expandido
  const { data: moduloCompleto, isLoading: isLoadingModulo } =
    useModuloCompleto(module.id)

  // Buscar progresso deste módulo no banco
  const moduleProgressData = moduleProgress?.find(
    p => p.modulo_id === module.id
  )

  // Verificar se módulo está liberado (baseado no backend)
  const isLiberado = moduleProgressData?.liberado ?? false

  // Determinar status do módulo baseado no progresso
  const getModuleStatus = (): ModuleItemStatus => {
    if (moduleProgressData?.data_conclusao) return 'completed'
    if (moduleProgressData?.data_inicio) return 'in_progress'
    return 'locked'
  }

  const moduleStatus = getModuleStatus()
  const isInProgress = moduleStatus === 'in_progress'
  const isCompleted = moduleStatus === 'completed'

  const handleStartModule = async (e: React.MouseEvent) => {
    e.stopPropagation() // Previne expansão do accordion

    // Se já está em progresso ou concluído, apenas expande o accordion
    if (isInProgress || isCompleted) {
      onToggle()
      return
    }

    // Se está bloqueado, inicia o módulo e depois expande
    setIsStarting(true)
    try {
      await startModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
      // Após iniciar, expande o accordion
      onToggle()
    } catch (error) {
      console.error('Erro ao iniciar módulo:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleModuleComplete = () => {
    // Fecha o accordion após completar
    if (expanded) {
      onToggle()
    }
  }

  const getActionLabel = () => {
    if (isStarting) return 'Iniciando...'
    if (isCompleted) return 'Revisar'
    if (isInProgress) return 'Continuar'
    if (!isLiberado) return 'Bloqueado'
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
            disabled={isStarting || (!isLiberado && !isCompleted)}
            onClick={handleStartModule}
            startIcon={
              isStarting ? (
                <CircularProgress size={16} color='inherit' />
              ) : isCompleted ? (
                <CheckCircleRoundedIcon />
              ) : !isLiberado ? (
                <LockRoundedIcon />
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

      <AccordionDetails sx={{ px: 0, pb: 0, pt: 0 }}>
        {/* Renderizar ModuloPlayer se módulo está iniciado ou concluído */}
        {(isInProgress || isCompleted) && moduloCompleto ? (
          <Box sx={{ p: 2 }}>
            <ModuloPlayer
              modulo={moduloCompleto}
              inscricaoId={enrollmentId}
              concluido={isCompleted}
              onComplete={handleModuleComplete}
              onBack={onToggle}
            />
          </Box>
        ) : isLoadingModulo ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <Divider sx={{ mb: 3 }} />

            {/* Descrição do módulo */}
            {module.conteudo && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {module.conteudo}
              </Typography>
            )}

            {/* Aviso de módulo bloqueado */}
            {!isLiberado && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 152, 0, 0.08)',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
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
                    Clique em "Iniciar" para desbloquear e acessar o conteúdo
                    deste módulo.
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
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
    useModulosComProgresso(enrollmentId)

  const handleToggle = (moduleId: string) => {
    setExpandedModule(prev => (prev === moduleId ? false : moduleId))
  }

  if (progressLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      {modules.map(module => (
        <ModuleAccordion
          key={module.id}
          module={module}
          enrollmentId={enrollmentId}
          moduleProgress={moduleProgress}
          expanded={expandedModule === module.id}
          onToggle={() => handleToggle(module.id)}
        />
      ))}
    </Stack>
  )
}
