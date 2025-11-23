import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

interface Props {
  icon: React.ReactNode
  value: string | number
  label: string
}

export default function MetricCard({ icon, value, label }: Props) {
  const theme = useTheme()

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 1,
        display: 'grid',
        gap: 2,
        px: 3,
        bgcolor: theme.palette.background.paper,
        height: 100
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: 'inline-flex'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={800} color='text.primary'>
            {value}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {label}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
