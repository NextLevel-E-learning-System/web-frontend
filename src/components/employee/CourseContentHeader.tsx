import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AccessTimeRounded,
  MenuBookRounded,
  ArrowBackIosNewRounded,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

interface CourseContentHeaderProps {
  title: string
  lessons: number
  totalHours: number
  progressPercent: number
  gradientFrom: string
  gradientTo: string
  categoryName?: string
}

export default function CourseContentHeader({
  title,
  lessons,
  totalHours,
  progressPercent,
  gradientFrom,
  gradientTo,
  categoryName,
}: CourseContentHeaderProps) {
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
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            color: 'common.white',
            position: 'relative',
            boxShadow: '0 12px 30px rgba(79, 70, 229, 0.25)',
          }}
        >
          <Button
            component={RouterLink}
            to='/meu-progresso'
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
          <Box sx={{ pr: { xs: 10, md: 12 } }}>
            <Typography
              variant='h4'
              fontWeight={800}
              lineHeight={1.2}
              sx={{ mb: 1.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                alignSelf: 'flex-start',
                fontWeight: 600,
              }}
            >
              {categoryName}
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ px: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ flexWrap: 'wrap', rowGap: 1.5, columnGap: 3 }}
          alignItems={{ sm: 'center' }}
        >
          <Stack direction='row' spacing={1} alignItems='center'>
            <MenuBookRounded color='primary' fontSize='small' />
            <Typography variant='body2' fontWeight={600}>
              {lessons} módulos
            </Typography>
          </Stack>

          <Stack direction='row' spacing={1} alignItems='center'>
            <AccessTimeRounded color='primary' fontSize='small' />
            <Typography variant='body2' fontWeight={600}>
              {totalHours} horas
            </Typography>
          </Stack>
        </Stack>

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
    </Stack>
  )
}
