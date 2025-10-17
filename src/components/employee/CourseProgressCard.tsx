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
  category?: string
  progress: number // 0-100
  timeLeft: string
  gradientFrom: string
  gradientTo: string
  courseCode: string
  status?: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
  onContinueLearning: (courseCode: string) => void
}

export default function CourseProgressCard({
  title,
  description,
  category,
  progress,
  timeLeft,
  gradientFrom,
  gradientTo,
  courseCode,
  status = 'EM_ANDAMENTO',
  onContinueLearning,
}: Props) {
  const isCompleted = status === 'CONCLUIDO' || progress === 100

  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        label: 'Concluído',
        bgcolor: '#10b981',
        color: '#fff',
      }
    }
    return {
      label: 'Em Andamento',
      bgcolor: '#eab308',
      color: '#111827',
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Card
      sx={{
        overflow: 'hidden',
        height: 340,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          flexShrink: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Chip
          label={statusConfig.label}
          size='small'
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: statusConfig.bgcolor,
            color: statusConfig.color,
            fontWeight: 600,
          }}
        />
      </Box>
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Chip
            label={category}
            size='small'
            sx={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
              color: '#fff',
              padding: '6px 8px',
              borderRadius: '16px',
            }}
          />
        </Box>
        <Typography
          variant='subtitle1'
          fontWeight={700}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            minHeight: '1.6em',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{
            mb: 1,
            textAlign: 'justify',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            height: '2.8em',
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Progresso: {progress}%
        </Typography>
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{
            height: 8,
            borderRadius: 6,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          {!isCompleted && (
            <Typography variant='caption' color='text.secondary'>
              {timeLeft} restantes
            </Typography>
          )}
          {isCompleted && <div />}
          <Button
            variant={isCompleted ? 'outlined' : 'contained'}
            color={isCompleted ? 'success' : 'primary'}
            size='small'
            onClick={() => onContinueLearning(courseCode)}
          >
            {isCompleted ? 'Ver Curso' : 'Continuar'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
