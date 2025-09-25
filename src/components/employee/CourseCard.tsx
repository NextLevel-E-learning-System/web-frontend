import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from "@mui/icons-material/AccessTime";
export interface CourseCardProps {
  title: string
  category: string
  hours: string
  description?: string
  rating?: number
  gradientFrom: string
  gradientTo: string
}

export default function CourseCard({
  title,
  category,
  hours,
  description,
  rating = 0,
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
        {/* Linha com Chip à esquerda e Rating à direita */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={category} size='small' sx={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`, color: '#fff', padding: '6px 8px', borderRadius: '16px' }} />
          {rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {rating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography variant='h6' fontWeight={700} gutterBottom>
          {title}
        </Typography>
         {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
        ) : null}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2">{hours}</Typography>
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
