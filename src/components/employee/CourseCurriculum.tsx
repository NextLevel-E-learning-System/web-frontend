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
import type {
  CourseModule,
  ModuleItemStatus,
  ModuleItemType,
} from '@/pages/employee/CourseContent'

interface CourseCurriculumProps {
  modules: CourseModule[]
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
  ModuleItemType,
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
}

function ModuleItemRow({ item }: { item: CourseModuleItem }) {
  const Icon = statusIconMap[item.status]
  const isLocked = item.status === 'locked'
  const isCompleted = item.status === 'completed'
  const type = typeConfig[item.type]
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

export default function CourseCurriculum({ modules }: CourseCurriculumProps) {
  const [expandedModule, setExpandedModule] = useState<string | false>(
    modules[0]?.id ?? false
  )

  return (
    <Stack spacing={2.5}>
      {modules.map((module, index) => {
        const expanded =
          expandedModule === module.id ||
          (expandedModule === false && index === 0)

        return (
          <Accordion
            key={module.id}
            expanded={expanded}
            onChange={(_, isExpanded) =>
              setExpandedModule(isExpanded ? module.id : false)
            }
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
                bgcolor: expanded
                  ? 'rgba(59,130,246,0.07)'
                  : 'background.paper',
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
                    {module.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {module.description}
                  </Typography>
                </Stack>
                <Stack
                  spacing={0.5}
                  alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    fontWeight={600}
                  >
                    {module.totalDuration}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {module.items.length}{' '}
                    {module.items.length > 1 ? 'activities' : 'activity'}
                  </Typography>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {module.items.map(item => (
                  <ModuleItemRow key={item.id} item={item} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Stack>
  )
}
