import { Box, Card, CardContent, Typography } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { ReactNode } from 'react'

export default function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon: ReactNode
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#F0F7FF',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(18,131,230,.12)',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='body2' color='text.secondary' noWrap>
            {title}
          </Typography>
          <Typography variant='h5' fontWeight={800}>
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {positive ? (
                <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant='caption'
                color={positive ? 'success.main' : 'error.main'}
              >
                {change}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                vs last month
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
