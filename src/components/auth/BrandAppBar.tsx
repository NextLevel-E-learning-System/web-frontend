import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Link as RouterLink } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'

export default function BrandAppBar() {
  return (
    <AppBar
      position='fixed'
      color='transparent'
      elevation={0}
      sx={{
        background: 'transparent',
        borderBottom: t => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ width: '100%', px: 2 }}>
        <Toolbar
          disableGutters
          sx={{ justifyContent: 'space-between', minHeight: 48, width: '100%' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
            }}
            component={RouterLink}
            to='/'
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <img
                src={logoIcon}
                alt='NextLevel Logo'
                style={{ height: 40, width: 'auto', display: 'block' }}
              />
            </Box>
            <Typography variant='h6' fontWeight={800} color='primary'>
              NextLevel
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={RouterLink} to='/login' variant='outlined'>
              Entrar
            </Button>
            <Button component={RouterLink} to='/register' variant='contained'>
              Cadastrar
            </Button>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  )
}
