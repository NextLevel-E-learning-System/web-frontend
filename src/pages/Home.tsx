import { Box, Button, Chip, Container, Grid, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BrandAppBar from '@/components/auth/BrandAppBar'
import { Link as RouterLink } from 'react-router-dom'

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <BrandAppBar />
      <Box
        component='section'
        sx={{
          background:
            'linear-gradient(180deg, rgba(99,102,241,0.10), rgba(59,130,246,0.05), transparent)',
          py: { xs: 8, md: 14 },
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={6} alignItems='center'>
            <Grid>
              <Typography variant='h3' fontWeight={800} gutterBottom>
                Eleve sua jornada de aprendizagem com a{' '}
                <Box
                  component='span'
                  sx={{
                    background:
                      'linear-gradient(90deg,#4F46E5,#0EA5E9,#10B981)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  NextLevel
                </Box>
              </Typography>
              <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
                A plataforma completa de aprendizagem corporativa para
                desenvolver competências, acompanhar resultados e alcançar metas
                profissionais.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Button
                  size='large'
                  variant='contained'
                  component={RouterLink}
                  to='/sign-up'
                  sx={{ background: 'linear-gradient(90deg,#4F46E5,#3B82F6)' }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Comece Agora
                </Button>
                <Button
                  size='large'
                  variant='outlined'
                  component={RouterLink}
                  to='/sign-in'
                >
                  Entrar na sua conta{' '}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
