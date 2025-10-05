import { AppBar, Box, Button, Container, Toolbar } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'

export default function BrandAppBar() {
  return (
    <AppBar position='sticky' elevation={0}>
      <Box
        sx={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.10), rgba(59,130,246,0.10), rgba(16,185,129,0.10))',
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
        }}
      >
        <Toolbar disableGutters sx={{ gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoIcon} alt='NextLevel Logo' style={{ height: 60 }} />
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 2,
            }}
          ></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={RouterLink} to='/login' variant='text'>
              Login
            </Button>
            <Button component={RouterLink} to='/register' variant='contained'>
              Cadastro
            </Button>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  )
}
