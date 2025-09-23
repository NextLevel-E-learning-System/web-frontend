import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { Link as RouterLink } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'

export default function BrandAppBar() {
  return (
    <AppBar position='fixed' color='transparent' elevation={0}>
      <Box
        sx={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.10), rgba(59,130,246,0.10), rgba(16,185,129,0.10))',
          borderBottom: 1,
          borderColor: 'divider',
          px: 1,
        }}
      >
        <Container
          maxWidth='xxl'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <img
              src={logoIcon}
              alt='NextLevel Logo'
              style={{ height: 60, width: 'auto', display: 'block' }}
            />
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button component={RouterLink} to='/login' variant='text'>
              Entrar
            </Button>
            <Button component={RouterLink} to='/register' variant='contained'>
              Cadastrar
            </Button>
          </Box>
        </Container>
      </Box>
    </AppBar>
  )
}
