import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Remove, SouthEast } from '@mui/icons-material'

interface Props {
  icon: React.ReactNode
  value: string
  label: string
  trendLabel: string
  trendDirection?: 'up' | 'down' | 'neutral'
  trendColor?: string
  iconColor?: string
  iconBackgroundColor?: string
}

export default function MetricCard({
  icon,
  value,
  label,
  trendLabel,
  trendDirection = 'up',
  trendColor,
  iconColor,
  iconBackgroundColor,
}: Props) {
  const theme = useTheme()
  const finalTrendColor =
    trendColor ||
    (trendDirection === 'down'
      ? theme.palette.error.main
      : trendDirection === 'neutral'
        ? theme.palette.text.secondary
        : theme.palette.success.main)
  const finalIconColor = iconColor || theme.palette.primary.main
  const finalIconBackground = iconBackgroundColor || alpha(finalIconColor, 0.12)

  const TrendIcon =
    trendDirection === 'down'
      ? SouthEast
      : trendDirection === 'neutral'
        ? Remove
        : ArrowOutwardIcon

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 3,
        p: 3,
        display: 'grid',
        gap: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: finalIconBackground,
            color: finalIconColor,
            display: 'inline-flex',
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1,
          color: finalTrendColor,
        }}
      >
        <TrendIcon fontSize='small' />
        <Typography variant='body2' fontWeight={600} sx={{ color: 'inherit' }}>
          {trendLabel}
        </Typography>
      </Box>
    </Card>
  )
}
