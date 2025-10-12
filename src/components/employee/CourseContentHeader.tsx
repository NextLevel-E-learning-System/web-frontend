import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StarRateRounded } from '@mui/icons-material'
import IosShareIcon from '@mui/icons-material/IosShare'
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded'

interface CourseContentHeaderProps {
  title: string
  subtitle: string
  rating: number
  ratingCount: number
  lessons: number
  totalHours: number
  progressPercent: number
  gradientFrom: string
  gradientTo: string
  categoryName?: string
}

export default function CourseContentHeader({
  title,
  subtitle,
  rating,
  ratingCount,
  lessons,
  totalHours,
  progressPercent,
  gradientFrom,
  gradientTo,
  categoryName,
}: CourseContentHeaderProps) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.6), transparent 55%)',
        }}
      />

      <Stack spacing={4} position='relative' zIndex={1}>
        <Stack spacing={1.5}>
          {categoryName && (
            <Chip
              label={categoryName}
              size='small'
              sx={{
                alignSelf: 'flex-start',
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                color: '#fff',
                fontWeight: 600,
                letterSpacing: 1.2,
                padding: '6px 8px',
                borderRadius: '16px',
              }}
            />
          )}
          <Typography variant='h3' fontWeight={900} lineHeight={1.1}>
            {title}
          </Typography>
          <Typography variant='body1' sx={{ maxWidth: 720, opacity: 0.9 }}>
            {subtitle}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 5 }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack direction='row' spacing={3} alignItems='center'>
            <Stack direction='row' spacing={1} alignItems='center'>
              <StarRateRounded sx={{ color: '#fbbf24' }} />
              <Typography variant='h6' fontWeight={700}>
                {rating.toFixed(1)}
              </Typography>
            </Stack>
            <Typography variant='body2' sx={{ opacity: 0.85 }}>
              {ratingCount.toLocaleString()} reviews
            </Typography>
          </Stack>

          <Stack direction='row' spacing={2}>
            <Chip
              label={`${lessons} lessons`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'common.white',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${totalHours} hours`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'common.white',
                fontWeight: 600,
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ ml: { md: 'auto' } }}
          >
            <Button
              variant='contained'
              color='secondary'
              startIcon={<IosShareIcon />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'common.white' }}
            >
              Share
            </Button>
            <Button
              variant='contained'
              startIcon={<CloudDownloadRoundedIcon />}
              sx={{
                bgcolor: 'common.white',
                color: 'grey.900',
                fontWeight: 600,
              }}
            >
              Download Resources
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={1.5} maxWidth={400}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='body2' sx={{ opacity: 0.85 }}>
              Progress
            </Typography>
            <Typography variant='subtitle2' fontWeight={700}>
              {progressPercent}% Complete
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'common.white',
              },
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
