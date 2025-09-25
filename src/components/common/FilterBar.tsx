import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

export default function FilterBar() {
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
          <InputLabel>All Categories</InputLabel>
          <Select label='All Categories' value='all'>
            <MenuItem value='all'>All Categories</MenuItem>
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <InputLabel>Skill Level</InputLabel>
          <Select label='Skill Level' value='all'>
            <MenuItem value='all'>All Levels</MenuItem>
            <MenuItem value='beginner'>Beginner</MenuItem>
            <MenuItem value='intermediate'>Intermediate</MenuItem>
            <MenuItem value='advanced'>Advanced</MenuItem>
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <InputLabel>Duration</InputLabel>
          <Select label='Duration' value='all'>
            <MenuItem value='all'>Any</MenuItem>
            <MenuItem value='lt5'>Under 5h</MenuItem>
            <MenuItem value='5-10'>5-10h</MenuItem>
            <MenuItem value='>10'>10h+</MenuItem>
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select label='Sort By' value='popular'>
            <MenuItem value='popular'>Most Popular</MenuItem>
            <MenuItem value='rating'>Highest Rated</MenuItem>
            <MenuItem value='new'>Newest</MenuItem>
            <MenuItem value='price'>Price</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant='text'>Clear Filters</Button>
      </Box>
    </Box>
  )
}
