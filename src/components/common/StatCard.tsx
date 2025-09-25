import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

interface Props {
  label: string
  value: string
  icon?: React.ReactNode
}

export default function StatsCard({ label, value, icon }: Props) {
  return (
    <Card variant='outlined'>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon ? (
          <Box
            sx={{
              p: 1,
              borderRadius: '999px',
              bgcolor: 'rgba(15,23,42,0.05)',
              color: 'text.secondary',
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box>
          <Typography variant='overline' color='text.secondary'>
            {label}
          </Typography>
          <Typography variant='h6' fontWeight={800}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
