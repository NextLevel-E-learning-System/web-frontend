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
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { QuizRounded, PlayCircleFilledWhiteRounded } from '@mui/icons-material'
import type { Module } from '../../api/courses'
import { useModuleMaterials } from '../../api/courses'

// Tipos baseados no backend (course-service)
type ModuleItemStatus = 'completed' | 'in_progress' | 'locked'
type ModuleContentType =
  | 'video'
  | 'document'
  | 'exercise'
  | 'quiz'
  | 'text'
  | null

interface ModuleItem {
  id: string
  title: string
  duration: string
  type: ModuleContentType
  status: ModuleItemStatus
  actionLabel: string
}

interface CourseCurriculumProps {
  modules: Module[]
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
  exercise: {
    label: 'Exercise',
    icon: DescriptionRoundedIcon,
    background: 'rgba(237,108,2,0.16)',
    color: '#e65100',
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

function ModuleItemRow({ item }: { item: ModuleItem }) {
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
          <Typography
            variant='subtitle2'
            fontWeight={600}
            noWrap
            sx={{ textOverflow: 'ellipsis' }}
          >
            {item.title}
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
            <Typography variant='body2' color='text.secondary'>
              {item.duration}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Button
        size='small'
        variant={isCompleted ? 'outlined' : 'contained'}
        color='primary'
        disabled={isLocked}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          bgcolor: isCompleted ? 'transparent' : undefined,
        }}
      >
        {item.actionLabel}
      </Button>
    </Stack>
  )
}

// Componente para um módulo individual que busca seus materiais
function ModuleAccordion({
  module,
  index,
  expanded,
  onToggle,
}: {
  module: Module
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const { data: materials = [] } = useModuleMaterials(module.id)

  // Converter materiais em itens do módulo
  const moduleItems: ModuleItem[] = materials.map(material => ({
    id: material.id,
    title: material.nome_arquivo,
    duration: formatFileSize(material.tamanho),
    type: mapFileTypeToContentType(material.tipo_arquivo),
    status: index === 0 ? 'completed' : 'locked',
    actionLabel: index === 0 ? 'Visualizar' : 'Em breve',
  }))

  // Se não há materiais, criar um item padrão baseado no módulo
  if (moduleItems.length === 0) {
    moduleItems.push({
      id: `${module.id}-content`,
      title: module.titulo,
      duration: 'Conteúdo do módulo',
      type: (module.tipo_conteudo as ModuleContentType) || 'text',
      status: index === 0 ? 'completed' : 'locked',
      actionLabel: index === 0 ? 'Visualizar' : 'Em breve',
    })
  }

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
              {module.conteudo || 'Conteúdo do módulo'}
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
          <Stack
            spacing={0.5}
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <Typography variant='body2' color='text.secondary' fontWeight={600}>
              {materials.length > 0
                ? `${materials.length} materiais`
                : 'Módulo teórico'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {moduleItems.length}{' '}
              {moduleItems.length > 1 ? 'atividades' : 'atividade'}
            </Typography>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          {moduleItems.map(item => (
            <ModuleItemRow key={item.id} item={item} />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

// Funções helper
function formatFileSize(size: string | number): string {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size
  if (sizeNum < 1024) return `${sizeNum} B`
  if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(1)} KB`
  return `${(sizeNum / (1024 * 1024)).toFixed(1)} MB`
}

function mapFileTypeToContentType(fileType: string): ModuleContentType {
  if (fileType.includes('video')) return 'video'
  if (fileType.includes('pdf') || fileType.includes('document'))
    return 'document'
  if (fileType.includes('quiz') || fileType.includes('test')) return 'quiz'
  return 'document'
}

export default function CourseCurriculum({ modules }: CourseCurriculumProps) {
  const [expandedModule, setExpandedModule] = useState<string | false>(
    modules[0]?.id ?? false
  )

  return (
    <Stack spacing={2.5}>
      {modules.map((module, index) => (
        <ModuleAccordion
          key={module.id}
          module={module}
          index={index}
          expanded={
            expandedModule === module.id ||
            (expandedModule === false && index === 0)
          }
          onToggle={() =>
            setExpandedModule(expandedModule === module.id ? false : module.id)
          }
        />
      ))}
    </Stack>
  )
}
