import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    )
  }, [location.pathname])

  return (
    <Container>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='h1'
            component='h1'
            sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}
          >
            404
          </Typography>
          <Typography
            variant='h5'
            component='p'
            color='text.secondary'
            sx={{ mb: 4 }}
          >
            Oops! Page not found
          </Typography>
          <Button component={Link} to='/' variant='contained' color='primary'>
            Return to Home
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default NotFound
