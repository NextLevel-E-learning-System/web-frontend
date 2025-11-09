import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ArrowBackIosNewRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Chip } from '@mui/material'
import { usePrerequisitesTitles } from '@/api/courses'

interface CourseContentHeaderProps {
  title: string
  progressPercent?: number
  gradientFrom: string
  gradientTo: string
  categoryName?: string
  showProgress?: boolean
  level?: string
  prerequisites?: string[]
  backPath?: string // Caminho específico para voltar (ex: /gerenciar/cursos)
}

export default function CourseContentHeader({
  title,
  progressPercent,
  gradientFrom,
  gradientTo,
  categoryName,
  showProgress = true,
  level,
  prerequisites,
  backPath,
}: CourseContentHeaderProps) {
  const navigate = useNavigate()
  const prerequisitesTitles = usePrerequisitesTitles(prerequisites)

  const handleGoBack = () => {
    if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ md: 'stretch' }}
      >
        <Box
          sx={{
            flex: 1,
            borderRadius: 1,
            px: 3,
            py: 2,
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            color: '#fff',
            position: 'relative',
            height: 150,
          }}
        >
          <Button
            onClick={handleGoBack}
            startIcon={<ArrowBackIosNewRounded fontSize='small' />}
            sx={{
              position: 'absolute',
              top: { xs: 12, md: 16 },
              right: { xs: 12, md: 20 },
              fontWeight: 600,
              color: 'common.white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Voltar
          </Button>

          {/* Conteúdo principal */}
          {categoryName && (
            <Chip
              label={categoryName}
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: '#fff',
                fontWeight: 700,
              }}
            />
          )}
          <Typography variant='h4' fontWeight={900} sx={{ mt: 1 }}>
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              mt: 1,
              flexWrap: 'wrap',
            }}
          >
            {level && (
              <Typography variant='body2'>
                <strong>Nível:</strong> {level}
              </Typography>
            )}
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
      </Stack>
      {showProgress && progressPercent !== undefined && (
        <Stack sx={{ px: { xs: 2, md: 3 } }}>
          <Box>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}
            >
              <Typography variant='body2' color='text.secondary'>
                Progresso
              </Typography>
              <Typography variant='subtitle2' fontWeight={700}>
                {progressPercent}% Completo
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={progressPercent}
              sx={{
                height: 6,
                borderRadius: 999,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 999,
                },
              }}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
