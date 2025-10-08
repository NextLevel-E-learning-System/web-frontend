import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'

interface Props {
  title: string
  description: string
  progress: number // 0-100
  timeLeft: string
  gradientFrom: string
  gradientTo: string
  courseCode: string
  onContinueLearning: (courseCode: string) => void
}

export default function CourseProgressCard({
  title,
  description,
  progress,
  timeLeft,
  gradientFrom,
  gradientTo,
  courseCode,
  onContinueLearning,
}: Props) {
  return (
    <Card variant='outlined' sx={{ overflow: 'hidden', height: '100%' }}>
      <Box
        sx={{
          height: 140,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          position: 'relative',
        }}
      >
        <Chip
          label='Em Andamento'
          size='small'
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: '#eab308',
            color: '#111827',
            fontWeight: 700,
          }}
        />
      </Box>
      <CardContent>
        <Typography variant='subtitle1' fontWeight={700}>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
          {description}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Progresso: {progress}%
        </Typography>
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{ height: 8, borderRadius: 6, my: 1 }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            {timeLeft} restantes
          </Typography>
          <Button
            variant='contained'
            size='small'
            onClick={() => onContinueLearning(courseCode)}
          >
            Continue Aprendendo
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
