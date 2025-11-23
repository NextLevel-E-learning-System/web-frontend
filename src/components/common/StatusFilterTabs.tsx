import { Box, Tab, Tabs } from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material'

interface StatusFilterTabsProps {
  value: 'active' | 'disabled' | 'all'
  onChange: (value: 'active' | 'disabled' | 'all') => void
  activeCount: number
  inactiveCount: number
  activeLabel?: string
  inactiveLabel?: string
  sx?: any
}

export default function StatusFilterTabs({
  value,
  onChange,
  activeCount,
  inactiveCount,
  activeLabel = 'Ativos',
  inactiveLabel = 'Inativos',
  sx
}: StatusFilterTabsProps) {
  const totalCount = activeCount + inactiveCount

  return (
    <Tabs value={value} onChange={(_, v) => onChange(v)} sx={{ mb: 2, ...sx }}>
      <Tab value='all' label={`Todos (${totalCount})`} />
      <Tab
        value='active'
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon fontSize='small' />
            {activeLabel} ({activeCount})
          </Box>
        }
      />
      <Tab
        value='disabled'
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BlockIcon fontSize='small' />
            {inactiveLabel} ({inactiveCount})
          </Box>
        }
      />
    </Tabs>
  )
}
