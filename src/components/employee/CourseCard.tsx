import Card from '@mui/material/Card'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { EmojiEvents } from '@mui/icons-material'
export interface CourseCardProps {
  title: string
  category: string
  hours: string
  description?: string
  gradientFrom: string
  gradientTo: string
  onViewCourse?: () => void
  completionRate?: number
  instructorName?: string | null
  xpOffered?: number
  level?: string
}

export default function CourseCard({
  title,
  category,
  hours,
  description,
  gradientFrom,
  gradientTo,
  onViewCourse,
  completionRate: _completionRate,
  instructorName: _instructorName,
  xpOffered,
  level,
}: CourseCardProps) {
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
          label={level}
          size='small'
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            textAlign: 'justify',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
            height: '2.8em',
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='body2'>{hours}</Typography>
            </Box>
            {xpOffered && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmojiEvents sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant='body2'>{xpOffered} XP</Typography>
              </Box>
            )}
          </Box>

          <Button variant='outlined' size='small' onClick={onViewCourse}>
            Ver curso
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
