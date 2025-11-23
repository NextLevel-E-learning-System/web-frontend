import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

interface Props {
  title: string
  subtitle?: string
  gradientFrom: string
  gradientTo: string
  icon?: React.ReactNode
  earned?: boolean
}

export default function AchievementCard({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  icon,
  earned = true
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1,
        color: '#0f172a',
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        height: '100%',
        minHeight: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}
      >
        {icon}
        {earned ? (
          <Chip
            label='Conquistado'
            size='small'
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#111827',
              fontWeight: 700
            }}
          />
        ) : null}
      </Box>
      <Box sx={{ mt: 'auto' }}>
        <Typography fontWeight={800}>{title}</Typography>
        {subtitle ? (
          <Typography variant='body2' sx={{ opacity: 0.85 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  )
}
