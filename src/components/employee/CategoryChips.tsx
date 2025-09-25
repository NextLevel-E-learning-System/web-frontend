import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

export interface Category {
  label: string
  color: string
}

interface Props {
  categories: Category[]
}

export default function CategoryChips({ categories }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
      {categories.map(c => (
        <Chip
          key={c.label}
          label={c.label}
          sx={{
            backgroundColor: c.color,
            color: '#fff',
            fontWeight: 600,
            '&:hover': { opacity: 0.9 },
          }}
        />
      ))}
    </Box>
  )
}
