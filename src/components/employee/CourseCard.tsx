import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
export interface CourseCardProps {
  title: string
  category: string
  hours: string
  description?: string
  rating?: number
  gradientFrom: string
  gradientTo: string
  onViewCourse?: () => void
  // Novas propriedades
  completionRate?: number
  totalEnrollments?: number
  instructorName?: string
}

export default function CourseCard({
  title,
  category,
  hours,
  description,
  rating = 0,
  gradientFrom,
  gradientTo,
  onViewCourse,
  completionRate: _completionRate,
  totalEnrollments: _totalEnrollments,
  instructorName: _instructorName,
}: CourseCardProps) {
  return (
    <Card
      sx={{
        overflow: 'hidden',
        height: 380, // Altura fixa para todos os cards
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          flexShrink: 0, // Não encolhe
        }}
      />
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Linha com Chip à esquerda e Rating à direita */}
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
          {rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant='h6'
          fontWeight={700}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2, // Máximo 2 linhas para o título
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            height: '2.4em', // 2 linhas * 1.2 line-height
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3, // Máximo 3 linhas para a descrição
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              height: '4.2em', // 3 linhas * 1.4 line-height
              flexGrow: 1, // Ocupa o espaço restante
            }}
          >
            {description}
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }} /> // Espaço vazio quando não há descrição
        )}
        {/* Informações do curso */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            mt: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant='body2'>{hours}</Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, flexShrink: 0 }}>
        <Button variant='outlined' size='small' onClick={onViewCourse}>
          Ver curso
        </Button>
      </CardActions>
    </Card>
  )
}
