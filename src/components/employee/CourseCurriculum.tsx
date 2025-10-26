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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import CloseIcon from '@mui/icons-material/Close'
import {
  PlayCircleFilled,
  PictureAsPdfRounded,
  OpenInNew,
} from '@mui/icons-material'
import type { Module } from '../../api/courses'
import { useModuleMaterials } from '../../api/courses'
import AssessmentQuiz from './AssessmentQuiz'
import { useModuleAssessment } from '@/api/assessments'
import {
  useStartModule,
  useCompleteModule,
  useEnrollmentModuleProgress,
} from '../../api/progress'
import { Tooltip } from '@mui/material'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'

interface CourseCurriculumProps {
  modules: Module[]
  enrollmentId: string
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
  const [mediaDialog, setMediaDialog] = useState<{
    open: boolean
    url?: string
    name?: string
    materialId?: string
    type?: string
  }>({ open: false })
  const [materialsViewed, setMaterialsViewed] = useState<Set<string>>(new Set())

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
      onToggle()
      return
    }

    setIsStarting(true)
    try {
      await startModuleMutation.mutateAsync({
        enrollmentId,
        moduleId: module.id,
      })
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

  const handleOpenMedia = (
    url: string,
    name: string,
    materialId: string,
    type: string
  ) => {
    setMediaDialog({ url, name, materialId, type, open: true })
    setMaterialsViewed(prev => new Set(prev).add(materialId))
  }

  const handleCloseMedia = () => {
    setMediaDialog({ open: false })
  }

  const allMaterialsViewed =
    materials.length > 0 && materials.every(m => materialsViewed.has(m.id))

  const canCompleteModule =
    module.tipo_conteudo === 'pdf' || module.tipo_conteudo === 'video'
      ? allMaterialsViewed
      : module.tipo_conteudo === 'quiz'
        ? false // Quiz será concluído automaticamente após submeter
        : true

  const getActionLabel = () => {
    if (isStarting) return 'Iniciando...'
    if (isCompleted) return 'Concluído'
    if (isInProgress) return 'Continuar'
    return 'Iniciar'
  }

  const iconFor = (tipo: string) => {
    if (tipo.includes('pdf'))
      return <PictureAsPdfRounded color='error' sx={{ fontSize: 32 }} />
    if (tipo.includes('video'))
      return <PlayCircleFilled sx={{ color: 'primary.main', fontSize: 32 }} />
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

        {/* Conteúdo do módulo - só exibir se iniciado ou concluído */}
        {(isInProgress || isCompleted) && (
          <Stack spacing={2}>
            {/* Materiais (Vídeo ou PDF) */}
            {(module.tipo_conteudo === 'video' ||
              module.tipo_conteudo === 'pdf') && (
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
                        {iconFor(material.tipo_arquivo)}
                        <Stack flex={1}>
                          <Typography variant='body1' fontWeight={600}>
                            {material.nome_arquivo}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {(Number(material.tamanho) / 1024 / 1024).toFixed(
                              2
                            )}{' '}
                            MB
                          </Typography>
                        </Stack>
                        <Tooltip title='Visualizar'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => {
                              if (material.url_download) {
                                const tipo = material.tipo_arquivo.includes(
                                  'pdf'
                                )
                                  ? 'pdf'
                                  : 'video'
                                handleOpenMedia(
                                  material.url_download,
                                  material.nome_arquivo,
                                  material.id,
                                  tipo
                                )
                              }
                            }}
                          >
                            <OpenInNew fontSize='inherit' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Quiz */}
            {module.tipo_conteudo === 'quiz' && (
              <Box>
                {moduleAssessment ? (
                  <AssessmentQuiz
                    avaliacao={moduleAssessment}
                    onComplete={handleCompleteModule}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(234,179,8,0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      Carregando avaliação...
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Alerta se ainda há materiais não visualizados */}
            {isInProgress &&
              !isCompleted &&
              (module.tipo_conteudo === 'pdf' ||
                module.tipo_conteudo === 'video') &&
              !allMaterialsViewed && (
                <Box
                  sx={{
                    p: 2,

                    mt: 2,
                  }}
                >
                  <Typography variant='body2' color='primary' fontWeight={600}>
                    ℹ️ Você precisa visualizar todos os materiais antes de
                    concluir este módulo.
                  </Typography>
                </Box>
              )}

            {/* Botão de Concluir Módulo - não mostrar para quiz (conclusão automática) */}
            {isInProgress &&
              !isCompleted &&
              module.tipo_conteudo !== 'quiz' && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant='contained'
                    color='success'
                    size='large'
                    disabled={isCompleting || !canCompleteModule}
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

      {/* Modal para visualizar PDF ou Vídeo */}
      <Dialog
        open={mediaDialog.open}
        onClose={handleCloseMedia}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            {mediaDialog.name}
          </Typography>
          <IconButton
            edge='end'
            color='inherit'
            onClick={handleCloseMedia}
            aria-label='fechar'
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {mediaDialog.url && (
            <Box
              sx={{ flex: 1, width: '100%', height: '100%', bgcolor: '#000' }}
            >
              {mediaDialog.type === 'pdf' ? (
                <iframe
                  src={`${mediaDialog.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  width='100%'
                  height='100%'
                  style={{ border: 'none' }}
                  title={mediaDialog.name}
                />
              ) : (
                <video
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  src={mediaDialog.url}
                >
                  <source src={mediaDialog.url} type='video/mp4' />
                  Seu navegador não suporta a reprodução de vídeos.
                </video>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
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
          moduleProgress={moduleProgress}
        />
      ))}
    </Stack>
  )
}
