import { Box, Button, Chip, Container, Grid, Typography } from '@mui/material'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import BrandAppBar from '@/components/BrandAppBar'
import { Link as RouterLink } from 'react-router-dom'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background:
          'radial-gradient(1200px 500px at 10% -10%, rgba(18,131,230,.10), transparent), radial-gradient(1200px 500px at 90% 0%, rgba(245,158,11,.10), transparent), linear-gradient(180deg,#F7FAFF 0%, #EDF3FA 100%)',
      }}
    >
      <BrandAppBar />
      <Container maxWidth='xl' sx={{ py: { xs: 16, md: 24 } }}>
        <Grid container spacing={12} alignItems='center'>
          <Grid item xs={12} md={8}>
            <Chip
              color='primary'
              label='Plataforma de E-learning Corporativa'
              sx={{ fontWeight: 700 }}
            />
            <Typography
              variant='h2'
              sx={{
                fontWeight: 800,
                mt: 2,
                lineHeight: 1.1,
                letterSpacing: -0.6,
              }}
            >
              Aprenda, evolua e alcance o próximo nível
            </Typography>
            <Typography sx={{ mt: 2 }} color='text.secondary'>
              Cursos modernos, trilhas orientadas e gamificação para engajar seu
              time.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 6 }}>
              <Button
                component={RouterLink}
                to='/login'
                variant='contained'
                size='large'
                startIcon={<LoginOutlinedIcon />}
              >
                Entrar
              </Button>
              <Button
                component={RouterLink}
                to='/register'
                variant='outlined'
                size='large'
                startIcon={<PersonAddAlt1Icon />}
              >
                Cadastrar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
