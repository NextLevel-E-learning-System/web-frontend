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
import { QuizRounded, PlayCircleFilledWhiteRounded } from '@mui/icons-material'
import type { Module } from '../../api/courses'
import { useModuleMaterials } from '../../api/courses'
import { useStartModule } from '../../api/progress'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'
type ModuleContentType = 'video' | 'document' | 'quiz' | 'text' | null

interface ModuleItem {
  id: string
  title: string
  type: ModuleContentType
  conteudo: string
  status: ModuleItemStatus
  actionLabel: string
}

interface CourseCurriculumProps {
  modules: Module[]
  enrollmentId: string
  moduleProgress?: Array<{
    modulo_id: string
    data_inicio?: string
    data_conclusao?: string
  }>
}

const statusIconMap: Record<ModuleItemStatus, typeof CheckCircleRoundedIcon> = {
  completed: CheckCircleRoundedIcon,
  in_progress: PlayCircleFilledWhiteRounded,
  locked: LockRoundedIcon,
}

const statusBackgroundMap: Record<ModuleItemStatus, string> = {
  completed: 'rgba(34,197,94,0.16)',
  in_progress: 'rgba(59,130,246,0.16)',
  locked: 'rgba(15,23,42,0.12)',
}

const typeConfig: Record<
  NonNullable<ModuleContentType>,
  {
    label: string
    icon: typeof PlayCircleFilledWhiteRounded
    background: string
    color: string
  }
> = {
  video: {
    label: 'Video lesson',
    icon: PlayCircleFilledWhiteRounded,
    background: 'rgba(59,130,246,0.12)',
    color: '#1d4ed8',
  },
  document: {
    label: 'Resource',
    icon: DescriptionRoundedIcon,
    background: 'rgba(16,185,129,0.12)',
    color: '#047857',
  },
  quiz: {
    label: 'Quiz',
    icon: QuizRounded,
    background: 'rgba(234,179,8,0.16)',
    color: '#b45309',
  },
  text: {
    label: 'Text',
    icon: DescriptionRoundedIcon,
    background: 'rgba(156,39,176,0.16)',
    color: '#7b1fa2',
  },
}

function ModuleItemRow({
  item,
  onStart,
  isStarting,
}: {
  item: ModuleItem
  onStart: () => void
  isStarting: boolean
}) {
  const Icon = statusIconMap[item.status]
  const isLocked = item.status === 'locked'
  const isCompleted = item.status === 'completed'
  const type = item.type ? typeConfig[item.type] : typeConfig.text
  const TypeIcon = type.icon

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent='space-between'
      sx={{ py: 1.5 }}
    >
      <Stack
        direction='row'
        spacing={2}
        alignItems='center'
        flex={1}
        minWidth={0}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: statusBackgroundMap[item.status],
            color: isLocked
              ? 'text.secondary'
              : item.status === 'in_progress'
                ? 'primary.main'
                : 'success.main',
          }}
        >
          <Icon fontSize='small' />
        </Box>
        <Stack spacing={0.5} minWidth={0} flex={1}>
          <Typography variant='body1' fontWeight={600}>
            {item.conteudo}
          </Typography>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Chip
              icon={<TypeIcon fontSize='small' />}
              label={type.label}
              size='small'
              sx={{
                bgcolor: type.background,
                color: type.color,
                fontWeight: 600,
                '& .MuiChip-icon': {
                  color: type.color,
                  ml: 0.5,
                },
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Button
        size='small'
        variant={isCompleted ? 'outlined' : 'contained'}
        color='primary'
        disabled={isLocked || isStarting}
        onClick={onStart}
        startIcon={
          isStarting ? <CircularProgress size={16} color='inherit' /> : null
        }
        sx={{
          width: { xs: '100%', sm: 'auto' },
          bgcolor: isCompleted ? 'transparent' : undefined,
        }}
      >
        {isStarting ? 'Iniciando...' : item.actionLabel}
      </Button>
    </Stack>
  )
}

// Componente para um módulo individual que busca seus materiais
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
  const { data: materials = [] } = useModuleMaterials(module.id)
  const startModuleMutation = useStartModule()
  const [startingModuleId, setStartingModuleId] = useState<string | null>(null)

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

  // Handler para iniciar módulo
  const handleStartModule = async (moduleId: string) => {
    setStartingModuleId(moduleId)
    try {
      await startModuleMutation.mutateAsync({
        enrollmentId,
        moduleId,
      })
    } catch (error) {
      console.error('Erro ao iniciar módulo:', error)
    } finally {
      setStartingModuleId(null)
    }
  }

  // Criar item do módulo principal
  const moduleItem: ModuleItem = {
    id: module.id,
    title: module.titulo,
    conteudo: module.conteudo || '',
    type: (module.tipo_conteudo as ModuleContentType) || 'text',
    status: moduleStatus,
    actionLabel:
      moduleStatus === 'completed'
        ? 'Revisar'
        : moduleStatus === 'in_progress'
          ? 'Continuar'
          : 'Iniciar',
  }

  // Se houver materiais, adicionar como itens secundários (bloqueados por enquanto)
  const materialItems: ModuleItem[] = materials.map(material => ({
    id: material.id,
    title: material.nome_arquivo,
    type: mapFileTypeToContentType(material.tipo_arquivo),
    status: 'locked', // Materiais ficam bloqueados até implementar lógica específica
    actionLabel: 'Em breve',
  }))

  const allItems = [moduleItem, ...materialItems]

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      square
      sx={{
        borderRadius: 3,
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
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent='space-between'
          flex={1}
        >
          <Stack spacing={0.5} maxWidth={{ xs: '100%', md: '70%' }}>
            <Typography variant='subtitle1' fontWeight={700}>
              {module.titulo}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {module.conteudo}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={module.obrigatorio ? 'Obrigatório' : 'Opcional'}
                size='small'
                color={module.obrigatorio ? 'primary' : 'default'}
              />
              <Chip label={`${module.xp} XP`} size='small' color='secondary' />
            </Box>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          {allItems.map(item => (
            <ModuleItemRow
              key={item.id}
              item={item}
              onStart={() => handleStartModule(item.id)}
              isStarting={startingModuleId === item.id}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

function mapFileTypeToContentType(fileType: string): ModuleContentType {
  if (fileType.includes('video')) return 'video'
  if (fileType.includes('pdf') || fileType.includes('document'))
    return 'document'
  if (fileType.includes('quiz')) return 'quiz'
  return 'document'
}

export default function CourseCurriculum({
  modules,
  enrollmentId,
  moduleProgress,
}: CourseCurriculumProps) {
  const [expandedModule, setExpandedModule] = useState<string | false>(
    modules[0]?.id ?? false
  )

  return (
    <Stack spacing={2.5}>
      {modules.map((module, index) => (
        <ModuleAccordion
          key={module.id}
          module={module}
          expanded={
            expandedModule === module.id ||
            (expandedModule === false && index === 0)
          }
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
