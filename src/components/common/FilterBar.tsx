import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import Button from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

interface Category {
  codigo: string
  nome: string
}

interface FilterBarProps {
  categories: Category[]
  selectedCategory: string | null
  selectedLevel: string
  selectedDuration: string
  onCategoryChange: (category: string | null) => void
  onLevelChange: (level: string) => void
  onDurationChange: (duration: string) => void
  onClearFilters: () => void
}

export default function FilterBar({
  categories,
  selectedCategory,
  selectedLevel,
  selectedDuration,
  onCategoryChange,
  onLevelChange,
  onDurationChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <FormControl size='small' sx={{ minWidth: 160 }}>
          <InputLabel>Categorias</InputLabel>
          <Select
            label='Categorias'
            value={selectedCategory || 'all'}
            onChange={e =>
              onCategoryChange(e.target.value === 'all' ? null : e.target.value)
            }
          >
            <MenuItem value='all'>Todas as Categorias</MenuItem>
            {categories.map(category => (
              <MenuItem key={category.codigo} value={category.codigo}>
                {category.codigo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <InputLabel>Nível</InputLabel>
          <Select
            label='Nível'
            value={selectedLevel}
            onChange={e => onLevelChange(e.target.value)}
          >
            <MenuItem value='all'>Todos os Níveis</MenuItem>
            <MenuItem value='Iniciante'>Iniciante</MenuItem>
            <MenuItem value='Intermediario'>Intermediário</MenuItem>
            <MenuItem value='Avançado'>Avançado</MenuItem>
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <InputLabel>Duração</InputLabel>
          <Select
            label='Duração'
            value={selectedDuration}
            onChange={e => onDurationChange(e.target.value)}
          >
            <MenuItem value='all'>Qualquer</MenuItem>
            <MenuItem value='lt5'>Menos de 5h</MenuItem>
            <MenuItem value='5-10'>5-10h</MenuItem>
            <MenuItem value='>10'>Mais de 10h</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant='text' onClick={onClearFilters}>
          Limpar Filtros
        </Button>
      </Box>
    </Box>
  )
}
