import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import StarIcon from '@mui/icons-material/Star'

export interface CourseCardProps {
  title: string
  category: string
  hours: string
  price?: string
  rating?: number
  gradientFrom: string
  gradientTo: string
}

export default function CourseCard({
  title,
  category,
  hours,
  price,
  rating = 4.7,
  gradientFrom,
  gradientTo,
}: CourseCardProps) {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <CardContent>
        <Chip label={category} size='small' sx={{ mb: 1 }} />
        <Typography variant='h6' fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
            <Typography variant='body2'>{rating.toFixed(1)}</Typography>
          </Box>
          <Typography variant='body2'>{hours}</Typography>
          {price ? <Typography variant='body2'>{price}</Typography> : null}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant='outlined' size='small'>
          Ver curso
        </Button>
      </CardActions>
    </Card>
  )
}
