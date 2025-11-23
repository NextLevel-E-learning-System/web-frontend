import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Link as RouterLink } from 'react-router-dom'

interface Props {
  title: string
  description: string
  to: string
  button: string
  icon?: React.ReactNode
}

export default function QuickActionCard({
  title,
  description,
  to,
  button,
  icon
}: Props) {
  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          {icon}
          <Typography variant='subtitle1' fontWeight={700}>
            {title}
          </Typography>
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button component={RouterLink} to={to} variant='contained' size='small'>
          {button}
        </Button>
      </CardContent>
    </Card>
  )
}
